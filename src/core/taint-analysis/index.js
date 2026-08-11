// src/core/taint-analysis/index.js
//
// Pure, deterministic static analysis — no AI involved here at all.
// Given a parsed AST (from src/core/parser) and the rules (from
// src/core/rules), this walks the tree to find variables that
// originate from a "source" and checks whether they reach a "sink"
// (via a function call OR a direct assignment) without passing
// through a recognized sanitizer. It also runs a separate, non-taint
// check for hardcoded secrets.
//
// CHANGE: every finding now includes `severity`, sourced from the
// matched rule (JS_CALL_SINKS / JS_CONSTRUCT_SINKS / JS_ASSIGNMENT_SINKS)
// or from the relevant standalone-check constant in rules/index.js.
// This was previously missing entirely, which left finding.severity
// undefined for every finding — the frontend's Severity Breakdown
// chart had nothing to aggregate.

const {
  JS_SOURCES,
  JS_CALL_SINKS,
  JS_ASSIGNMENT_SINKS,
  JS_CONSTRUCT_SINKS,
  JS_SANITIZER_NAMES,
  HARDCODED_SECRET_PATTERNS,
  SECRET_VARIABLE_NAME_HINTS,
  WEAK_CRYPTO_ALGORITHMS,
  CRYPTO_ALGO_CALLEE_PROPERTIES,
  COOKIE_CALLEE_PROPERTIES,
  REQUIRED_COOKIE_FLAGS,
  HARDCODED_SECRET_SEVERITY,
  WEAK_CRYPTO_SEVERITY,
  INSECURE_COOKIE_SEVERITY,
} = require("../rules");

// --- small AST helpers -----------------------------------------------

function getText(node, sourceCode) {
  return sourceCode.slice(node.startIndex, node.endIndex);
}

function getLine(node) {
  return node.startPosition.row + 1; // tree-sitter rows are 0-indexed
}

function walk(node, visit) {
  visit(node);
  for (let i = 0; i < node.childCount; i++) {
    walk(node.child(i), visit);
  }
}

// --- source detection ---------------------------------------------

function matchesSourcePattern(node, sourceCode) {
  if (node.type !== "member_expression") return false;
  const text = getText(node, sourceCode);

  for (const pattern of JS_SOURCES) {
    for (const objectName of pattern.objectNames) {
      for (const prop of pattern.properties) {
        if (text.startsWith(`${objectName}.${prop}`)) {
          return true;
        }
      }
    }
  }
  return false;
}

function findTaintedVariables(rootNode, sourceCode) {
  const tainted = new Map();

  walk(rootNode, (node) => {
    if (node.type !== "variable_declarator") return;

    const nameNode = node.childForFieldName("name");
    const valueNode = node.childForFieldName("value");
    if (!nameNode || !valueNode) return;
    if (nameNode.type !== "identifier") return;

    let isTainted = matchesSourcePattern(valueNode, sourceCode);

    if (!isTainted) {
      walk(valueNode, (inner) => {
        if (matchesSourcePattern(inner, sourceCode)) isTainted = true;
      });
    }

    if (isTainted) {
      tainted.set(getText(nameNode, sourceCode), {
        line: getLine(node),
        snippet: getText(node, sourceCode).trim(),
      });
    }
  });

  return tainted;
}

// --- call-based sink detection --------------------------------------

function getCalleeInfo(calleeNode, sourceCode) {
  if (calleeNode.type === "identifier") {
    return { name: getText(calleeNode, sourceCode), property: null };
  }
  if (calleeNode.type === "member_expression") {
    const propertyNode = calleeNode.childForFieldName("property");
    return {
      name: null,
      property: propertyNode ? getText(propertyNode, sourceCode) : null,
    };
  }
  return { name: null, property: null };
}

function matchCallSinkRule(calleeInfo) {
  return JS_CALL_SINKS.find((sink) => {
    if (sink.calleeNames && calleeInfo.name && sink.calleeNames.includes(calleeInfo.name)) {
      return true;
    }
    if (
      sink.calleeProperties &&
      calleeInfo.property &&
      sink.calleeProperties.includes(calleeInfo.property)
    ) {
      return true;
    }
    return false;
  });
}

// Checks whether `argNode`'s subtree contains an identifier matching a
// tainted variable name, without descending into any sanitizer call's
// arguments (so `escapeHtml(username)` correctly counts as sanitized
// even nested inside a larger expression).
function findTaintInSubtree(node, taintedVars, sourceCode) {
  let found = null;

  function visit(n) {
    if (found) return;

    if (n.type === "call_expression") {
      const calleeInfo = getCalleeInfo(n.childForFieldName("function"), sourceCode);
      const calleeName = calleeInfo.name || calleeInfo.property;
      if (calleeName && JS_SANITIZER_NAMES.includes(calleeName)) {
        return; // sanitized — do not descend into this call's arguments
      }
    }

    if (n.type === "identifier") {
      const name = getText(n, sourceCode);
      if (taintedVars.has(name)) {
        found = name;
        return;
      }
    }

    for (let i = 0; i < n.childCount; i++) {
      visit(n.child(i));
    }
  }

  visit(node);
  return found;
}

function findCallSinkFindings(rootNode, taintedVars, sourceCode, filePath) {
  const findings = [];

  walk(rootNode, (node) => {
    if (node.type !== "call_expression") return;

    const calleeNode = node.childForFieldName("function");
    const calleeInfo = getCalleeInfo(calleeNode, sourceCode);
    const sinkRule = matchCallSinkRule(calleeInfo);
    if (!sinkRule) return;

    const argsNode = node.childForFieldName("arguments");
    if (!argsNode) return;

    const argNodes = argsNode.namedChildren ?? [];
    const targetArg = argNodes[sinkRule.dangerousArgIndex];
    if (!targetArg) return;

    const taintedVarName = findTaintInSubtree(targetArg, taintedVars, sourceCode);
    if (!taintedVarName) return;

    const sourceInfo = taintedVars.get(taintedVarName);

    findings.push({
      id: `${filePath}:${sourceInfo.line}->${getLine(node)}`,
      vulnerability_type: sinkRule.type,
      severity: sinkRule.severity,
      path: [
        { file: filePath, line: sourceInfo.line, snippet: sourceInfo.snippet, type: "source" },
        { file: filePath, line: getLine(node), snippet: getText(node, sourceCode).trim(), type: "sink" },
      ],
    });
  });

  return findings;
}

// --- assignment-based sink detection (e.g. element.innerHTML = x) ---

function findAssignmentSinkFindings(rootNode, taintedVars, sourceCode, filePath) {
  const findings = [];

  walk(rootNode, (node) => {
    if (node.type !== "assignment_expression") return;

    const leftNode = node.childForFieldName("left");
    const rightNode = node.childForFieldName("right");
    if (!leftNode || !rightNode) return;
    if (leftNode.type !== "member_expression") return;

    const leftText = getText(leftNode, sourceCode);
    const sinkRule = JS_ASSIGNMENT_SINKS.find((sink) =>
      sink.targetSuffixes.some((suffix) => leftText.endsWith(suffix))
    );
    if (!sinkRule) return;

    const taintedVarName = findTaintInSubtree(rightNode, taintedVars, sourceCode);
    if (!taintedVarName) return;

    const sourceInfo = taintedVars.get(taintedVarName);

    findings.push({
      id: `${filePath}:${sourceInfo.line}->${getLine(node)}`,
      vulnerability_type: sinkRule.type,
      severity: sinkRule.severity,
      path: [
        { file: filePath, line: sourceInfo.line, snippet: sourceInfo.snippet, type: "source" },
        { file: filePath, line: getLine(node), snippet: getText(node, sourceCode).trim(), type: "sink" },
      ],
    });
  });

  return findings;
}

// --- standalone hardcoded-secret detection (no taint tracing) -------

function findHardcodedSecrets(rootNode, sourceCode, filePath) {
  const findings = [];

  walk(rootNode, (node) => {
    if (node.type !== "variable_declarator") return;

    const nameNode = node.childForFieldName("name");
    const valueNode = node.childForFieldName("value");
    if (!nameNode || !valueNode) return;
    if (valueNode.type !== "string") return;

    const varName = getText(nameNode, sourceCode).toLowerCase();
    const stringValue = getText(valueNode, sourceCode).slice(1, -1); // strip quotes

    const nameLooksLikeSecret = SECRET_VARIABLE_NAME_HINTS.some((hint) =>
      varName.includes(hint)
    );
    const matchesKnownPattern = HARDCODED_SECRET_PATTERNS.some((p) => p.regex.test(stringValue));

    if ((nameLooksLikeSecret && stringValue.length >= 16) || matchesKnownPattern) {
      findings.push({
        id: `${filePath}:${getLine(node)}:secret`,
        vulnerability_type: "Hardcoded Secret",
        severity: HARDCODED_SECRET_SEVERITY,
        path: [
          {
            file: filePath,
            line: getLine(node),
            snippet: getText(node, sourceCode).trim(),
            type: "sink",
          },
        ],
      });
    }
  });

  return findings;
}

// --- construct-based sink detection (e.g. new Function(taintedCode)) -

function findConstructSinkFindings(rootNode, taintedVars, sourceCode, filePath) {
  const findings = [];

  walk(rootNode, (node) => {
    if (node.type !== "new_expression") return;

    const calleeNode = node.childForFieldName("constructor");
    if (!calleeNode || calleeNode.type !== "identifier") return;
    const calleeName = getText(calleeNode, sourceCode);

    const sinkRule = JS_CONSTRUCT_SINKS.find(
      (sink) => sink.calleeNames && sink.calleeNames.includes(calleeName)
    );
    if (!sinkRule) return;

    const argsNode = node.childForFieldName("arguments");
    if (!argsNode) return;

    const argNodes = argsNode.namedChildren ?? [];
    const targetArg = argNodes[sinkRule.dangerousArgIndex];
    if (!targetArg) return;

    const taintedVarName = findTaintInSubtree(targetArg, taintedVars, sourceCode);
    if (!taintedVarName) return;

    const sourceInfo = taintedVars.get(taintedVarName);

    findings.push({
      id: `${filePath}:${sourceInfo.line}->${getLine(node)}`,
      vulnerability_type: sinkRule.type,
      severity: sinkRule.severity,
      path: [
        { file: filePath, line: sourceInfo.line, snippet: sourceInfo.snippet, type: "source" },
        { file: filePath, line: getLine(node), snippet: getText(node, sourceCode).trim(), type: "sink" },
      ],
    });
  });

  return findings;
}

// --- standalone: weak cryptographic algorithms (no taint tracing) ---

function findWeakCrypto(rootNode, sourceCode, filePath) {
  const findings = [];

  walk(rootNode, (node) => {
    if (node.type !== "call_expression") return;

    const calleeNode = node.childForFieldName("function");
    const calleeInfo = getCalleeInfo(calleeNode, sourceCode);
    if (!calleeInfo.property || !CRYPTO_ALGO_CALLEE_PROPERTIES.includes(calleeInfo.property)) {
      return;
    }

    const argsNode = node.childForFieldName("arguments");
    const firstArg = argsNode?.namedChildren?.[0];
    if (!firstArg || firstArg.type !== "string") return;

    const algoValue = getText(firstArg, sourceCode).slice(1, -1).toLowerCase();
    if (!WEAK_CRYPTO_ALGORITHMS.includes(algoValue)) return;

    findings.push({
      id: `${filePath}:${getLine(node)}:weakcrypto`,
      vulnerability_type: "Weak Cryptographic Algorithm",
      severity: WEAK_CRYPTO_SEVERITY,
      path: [
        { file: filePath, line: getLine(node), snippet: getText(node, sourceCode).trim(), type: "sink" },
      ],
    });
  });

  return findings;
}

// --- standalone: insecure cookie flags (no taint tracing) -----------

function objectLiteralHasTrueFlag(objectNode, flagName, sourceCode) {
  if (!objectNode || objectNode.type !== "object") return false;

  let found = false;
  for (let i = 0; i < objectNode.namedChildCount; i++) {
    const pair = objectNode.namedChild(i);
    if (pair.type !== "pair") continue;
    const keyNode = pair.childForFieldName("key");
    const valueNode = pair.childForFieldName("value");
    if (!keyNode || !valueNode) continue;

    const keyText = getText(keyNode, sourceCode).replace(/['"]/g, "");
    if (keyText === flagName && getText(valueNode, sourceCode) === "true") {
      found = true;
    }
  }
  return found;
}

function findInsecureCookies(rootNode, sourceCode, filePath) {
  const findings = [];

  walk(rootNode, (node) => {
    if (node.type !== "call_expression") return;

    const calleeNode = node.childForFieldName("function");
    const calleeInfo = getCalleeInfo(calleeNode, sourceCode);
    if (!calleeInfo.property || !COOKIE_CALLEE_PROPERTIES.includes(calleeInfo.property)) {
      return;
    }

    const argsNode = node.childForFieldName("arguments");
    const optionsArg = argsNode?.namedChildren?.[2]; // res.cookie(name, value, options)

    const missingFlags = REQUIRED_COOKIE_FLAGS.filter(
      (flag) => !objectLiteralHasTrueFlag(optionsArg, flag, sourceCode)
    );

    if (missingFlags.length === 0) return;

    findings.push({
      id: `${filePath}:${getLine(node)}:cookie`,
      vulnerability_type: "Insecure Cookie Configuration",
      severity: INSECURE_COOKIE_SEVERITY,
      path: [
        {
          file: filePath,
          line: getLine(node),
          snippet: getText(node, sourceCode).trim(),
          type: "sink",
        },
      ],
    });
  });

  return findings;
}

// --- main entry point -----------------------------------------------

function analyzeFile(filePath, tree, sourceCode) {
  const taintedVars = findTaintedVariables(tree.rootNode, sourceCode);

  const findings = [
    ...findHardcodedSecrets(tree.rootNode, sourceCode, filePath),
    ...findWeakCrypto(tree.rootNode, sourceCode, filePath),
    ...findInsecureCookies(tree.rootNode, sourceCode, filePath),
  ];

  if (taintedVars.size > 0) {
    findings.push(
      ...findCallSinkFindings(tree.rootNode, taintedVars, sourceCode, filePath),
      ...findAssignmentSinkFindings(tree.rootNode, taintedVars, sourceCode, filePath),
      ...findConstructSinkFindings(tree.rootNode, taintedVars, sourceCode, filePath)
    );
  }

  return findings;
}

function analyzeFiles(parsedFiles) {
  const allFindings = [];
  for (const { filePath, tree, sourceCode } of parsedFiles) {
    allFindings.push(...analyzeFile(filePath, tree, sourceCode));
  }
  return allFindings;
}

module.exports = { analyzeFile, analyzeFiles };