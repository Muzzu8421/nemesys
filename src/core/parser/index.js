// src/core/parser/index.js
//
// Wraps tree-sitter (via web-tree-sitter, WASM build) to turn a file's raw
// text into an AST. This is pure parsing only — no vulnerability logic
// lives here, that's the taint-analysis module's job.
//
// IMPORTANT VERSION NOTE: use web-tree-sitter@0.20.8 specifically, and
// tree-sitter-wasms for the prebuilt grammar files. Newer web-tree-sitter
// versions (0.25.x/0.26.x) use a different WASM ABI than the grammar
// files currently published in tree-sitter-wasms, and will throw a
// "failIf / getDylinkMetadata" error when loading the .wasm grammar.
// This was confirmed by testing both combinations directly — 0.20.8 is
// the version actually verified to work with tree-sitter-wasms@0.1.13.
//
// Install with:
//   npm install web-tree-sitter@0.20.8 tree-sitter-wasms

const TreeSitter = require("web-tree-sitter");
const Parser = TreeSitter.default || TreeSitter;
const path = require("path");

// Maps file extensions to the grammar name used by tree-sitter-wasms
const EXTENSION_TO_GRAMMAR = {
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".py": "python",
};

let initialized = false;
const languageCache = new Map(); // grammar name -> loaded Language
const parserCache = new Map(); // grammar name -> Parser instance configured for that language

async function ensureInitialized() {
  if (!initialized) {
    await Parser.init();
    initialized = true;
  }
}

async function getParserForGrammar(grammarName) {
  await ensureInitialized();

  if (parserCache.has(grammarName)) {
    return parserCache.get(grammarName);
  }

  let language = languageCache.get(grammarName);
  if (!language) {
    const wasmPath = path.join(
      process.cwd(),
      "node_modules",
      "tree-sitter-wasms",
      "out",
      `tree-sitter-${grammarName}.wasm`
    );
    language = await Parser.Language.load(wasmPath);
    languageCache.set(grammarName, language);
  }

  const parser = new Parser();
  parser.setLanguage(language);
  parserCache.set(grammarName, parser);
  return parser;
}

function getGrammarForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSION_TO_GRAMMAR[ext] || null;
}

/**
 * Parses a single file's content into a tree-sitter AST.
 *
 * @param {string} filePath - used only to detect the language via extension
 * @param {string} content - the raw file text
 * @returns {Promise<{ tree: object, grammar: string } | null>}
 *   Returns null if the file's extension isn't supported — callers should
 *   skip such files rather than treat this as an error.
 */
async function parseFile(filePath, content) {
  const grammar = getGrammarForFile(filePath);
  if (!grammar) return null;

  const parser = await getParserForGrammar(grammar);
  const tree = parser.parse(content);

  return { tree, grammar };
}

/**
 * Parses multiple files, skipping any with unsupported extensions.
 * Returns an array of { filePath, tree, grammar } — unsupported files
 * are simply omitted, not treated as errors.
 */
async function parseFiles(files) {
  const results = [];
  for (const { path: filePath, content } of files) {
    const parsed = await parseFile(filePath, content);
    if (parsed) {
      results.push({ filePath, tree: parsed.tree, grammar: parsed.grammar });
    }
  }
  return results;
}

module.exports = { parseFile, parseFiles };