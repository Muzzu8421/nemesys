const Parser = require("web-tree-sitter");
const path = require("path");

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
const languageCache = new Map();
const parserCache = new Map();

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

async function parseFile(filePath, content) {
  const grammar = getGrammarForFile(filePath);
  if (!grammar) return null;

  const parser = await getParserForGrammar(grammar);
  const tree = parser.parse(content);

  return { tree, grammar };
}

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