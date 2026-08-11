// src/core/rules/index.js
//
// Pure data — no logic here. Defines what counts as a "source" (user
// input entering the program), a "sink" (a dangerous place for
// untrusted data to end up), and a "sanitizer" (a function call that,
// if it wraps a variable, makes that variable safe to use).
//
// CHANGE: added `severity` to every rule. The frontend (severity
// breakdown chart, severity badges on finding cards) has always
// expected finding.severity, but nothing in taint-analysis/index.js
// was ever setting it — findings were emitted with no severity field
// at all, which is why the Severity Breakdown chart renders empty.
// Ratings below follow roughly OWASP-style impact: unauthenticated
// RCE/data-exfil-class issues are critical, exposure/injection issues
// that need extra conditions are high, defense-in-depth issues are
// medium, and hardening/best-practice issues are low.

const JS_SOURCES = [
  // Matches member-expression chains like req.body, req.body.username,
  // req.query, req.params, req.headers, req.cookies, etc.
  {
    objectNames: ["req", "request"],
    properties: ["body", "query", "params", "headers", "cookies"],
  },
];

// Sinks reached via a function CALL, e.g. db.query(...), eval(...).
// `dangerousArgIndex` is which argument to inspect for taint.
const JS_CALL_SINKS = [
  {
    type: "SQL Injection",
    severity: "critical",
    calleeProperties: ["query", "execute"],
    dangerousArgIndex: 0,
  },
  {
    type: "Code Injection (eval)",
    severity: "critical",
    calleeNames: ["eval"],
    dangerousArgIndex: 0,
  },
  {
    type: "Command Injection",
    severity: "critical",
    calleeNames: ["exec", "execSync", "spawn"],
    calleeProperties: ["exec", "execSync", "spawn"],
    dangerousArgIndex: 0,
  },
  {
    type: "Path Traversal",
    severity: "high",
    calleeProperties: ["readFile", "readFileSync", "writeFile", "writeFileSync", "unlink"],
    dangerousArgIndex: 0,
  },
  {
    type: "Cross-Site Scripting (Reflected)",
    severity: "high",
    calleeProperties: ["send", "write"],
    dangerousArgIndex: 0,
  },
  {
    type: "Server-Side Request Forgery (SSRF)",
    severity: "high",
    calleeNames: ["fetch"],
    calleeProperties: ["get", "post", "request"],
    dangerousArgIndex: 0,
  },
  {
    type: "Open Redirect",
    severity: "medium",
    calleeProperties: ["redirect"],
    dangerousArgIndex: 0,
  },
];

// Sinks reached via `new SomeConstructor(...)`, e.g. `new Function(taintedCode)`.
const JS_CONSTRUCT_SINKS = [
  {
    type: "Code Injection (Function constructor)",
    severity: "critical",
    calleeNames: ["Function"],
    dangerousArgIndex: 0,
  },
];

// Sinks reached via an ASSIGNMENT, e.g. `element.innerHTML = taintedVar`.
const JS_ASSIGNMENT_SINKS = [
  {
    type: "Cross-Site Scripting (DOM)",
    severity: "high",
    targetSuffixes: [".innerHTML", ".outerHTML"],
  },
];

// Function names that, if they directly wrap a tainted variable
// (e.g. escapeHtml(username), sanitize(username)), mark that specific
// usage as safe.
const JS_SANITIZER_NAMES = [
  "escapeHtml",
  "sanitize",
  "sanitizeInput",
  "escape",
  "encodeURIComponent",
  "parseInt",
  "Number",
];

// Standalone checks (NOT taint-tracing based) — each has its own fixed
// severity since there's no sink rule object to attach one to.
const HARDCODED_SECRET_SEVERITY = "critical";
const WEAK_CRYPTO_SEVERITY = "medium";
const INSECURE_COOKIE_SEVERITY = "low";

const HARDCODED_SECRET_PATTERNS = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "Google API Key", regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: "Generic API Key-like string", regex: /^[A-Za-z0-9_\-]{32,}$/ },
];
const SECRET_VARIABLE_NAME_HINTS = [
  "apikey",
  "api_key",
  "secret",
  "password",
  "token",
  "privatekey",
  "private_key",
];

const WEAK_CRYPTO_ALGORITHMS = ["md5", "sha1", "des", "rc4"];
const CRYPTO_ALGO_CALLEE_PROPERTIES = ["createHash", "createCipher", "createDecipher"];

const COOKIE_CALLEE_PROPERTIES = ["cookie"];
const REQUIRED_COOKIE_FLAGS = ["httpOnly", "secure"];

module.exports = {
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
};