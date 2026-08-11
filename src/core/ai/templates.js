// src/core/ai/templates.js
//
// Deterministic explanations, keyed by finding.vulnerability_type (the
// exact strings emitted by src/core/rules/index.js). This is the
// default render path — instant, no dependency on any AI backend.
//
// CHANGE: previously written against a guessed schema (vulnerabilityType,
// trace[]) that didn't match the real finding shape. Real findings use
// vulnerability_type and path[], where each path entry already carries
// an explicit `type: "source" | "sink"` — no need to infer role from
// array position. Some findings (hardcoded secrets, weak crypto,
// insecure cookies) are standalone checks with only ONE path entry
// (type: "sink", no source) — templates and step narration both need
// to handle that case without a dangling {source} placeholder.

function normalizeType(type) {
  return (type || "")
    .toLowerCase()
    .replace(/[()]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getSource(finding) {
  return (finding.path || []).find((p) => p.type === "source") || null;
}

function getSink(finding) {
  const path = finding.path || [];
  return path.find((p) => p.type === "sink") || path[path.length - 1] || null;
}

// --- flow-based templates (source -> sink) ----------------------------

const FLOW_TEMPLATES = {
  "sql-injection": (source, sink) =>
    `Data from "${source}" flows into "${sink}" without passing through a sanitizer. ` +
    `An attacker who controls this input could inject SQL to read, modify, or delete data ` +
    `outside the intended query. Use a parameterized query or an ORM method that binds ` +
    `values instead of interpolating them into the SQL string.`,

  "code-injection-eval": (source, sink) =>
    `Data from "${source}" reaches "${sink}", which executes it as JavaScript. ` +
    `An attacker controlling this input could run arbitrary code in your process. ` +
    `Avoid eval() entirely — parse or interpret the data structurally instead of executing it.`,

  "code-injection-function-constructor": (source, sink) =>
    `Data from "${source}" reaches "${sink}", where it's compiled into a new function body. ` +
    `This is functionally equivalent to eval() — an attacker-controlled string becomes ` +
    `executable code. Avoid the Function constructor with any untrusted input.`,

  "command-injection": (source, sink) =>
    `Data from "${source}" flows into "${sink}", which runs a shell command. ` +
    `An attacker controlling this input could execute arbitrary commands on the host. ` +
    `Avoid shell interpolation entirely — use an execFile-style API with an argument array ` +
    `instead of a concatenated command string.`,

  "path-traversal": (source, sink) =>
    `Data from "${source}" reaches "${sink}" and is used to construct a filesystem path. ` +
    `Without validation, an attacker could use "../" sequences to read or write files ` +
    `outside the intended directory. Resolve the path and verify it stays within an ` +
    `allowed base directory before use.`,

  "cross-site-scripting-reflected": (source, sink) =>
    `Data from "${source}" is written directly to the response via "${sink}" without escaping. ` +
    `An attacker controlling this input could get a script to execute in another user's ` +
    `browser. Escape the value before sending it, or render it as JSON/text rather than raw HTML.`,

  "cross-site-scripting-dom": (source, sink) =>
    `Data from "${source}" is assigned to "${sink}" without escaping. If an attacker controls ` +
    `this input, they can inject script that runs in the victim's browser session. Escape the ` +
    `value before rendering, or use a sanitizer such as DOMPurify before it reaches the DOM.`,

  "server-side-request-forgery-ssrf": (source, sink) =>
    `Data from "${source}" is used directly as the URL/host in "${sink}". An attacker controlling ` +
    `this input could make your server issue requests to internal services or arbitrary hosts. ` +
    `Validate against an allow-list of permitted hosts before making the request.`,

  "open-redirect": (source, sink) =>
    `Data from "${source}" is passed directly to "${sink}". An attacker controlling this input ` +
    `could redirect users to an arbitrary external site, commonly used for phishing. Validate ` +
    `the destination against an allow-list of known-safe paths before redirecting.`,
};

const DEFAULT_FLOW_TEMPLATE = (source, sink) =>
  `Data from "${source}" flows into "${sink}" without passing through a recognized sanitizer. ` +
  `Review whether this input can be attacker-controlled, and add validation or a sanitizer ` +
  `before it reaches "${sink}".`;

// --- standalone templates (single node, no data flow) ------------------

const STANDALONE_TEMPLATES = {
  "hardcoded-secret": (sink) =>
    `"${sink}" appears to hardcode a credential or API key directly in source. Anyone with ` +
    `read access to this file — or the repo history — has the secret. Move it to an ` +
    `environment variable or a secrets manager, and rotate the exposed value.`,

  "weak-cryptographic-algorithm": (sink) =>
    `"${sink}" uses a cryptographic algorithm (MD5, SHA-1, DES, or RC4) that's considered ` +
    `broken for security-sensitive use. These are vulnerable to collision or brute-force ` +
    `attacks with modern hardware. Use SHA-256 or better for hashing, and AES-GCM for encryption.`,

  "insecure-cookie-configuration": (sink) =>
    `"${sink}" sets a cookie without both the httpOnly and secure flags. Without httpOnly, ` +
    `client-side scripts (including injected XSS payloads) can read the cookie. Without ` +
    `secure, it can be sent over plain HTTP. Set both flags unless you have a specific reason not to.`,
};

const DEFAULT_STANDALONE_TEMPLATE = (sink) =>
  `"${sink}" was flagged as a potential issue on its own merits, independent of data flow. ` +
  `Review the surrounding code to confirm whether it's exploitable in this context.`;

export function getTemplate(finding) {
  const key = normalizeType(finding.vulnerability_type);
  const source = getSource(finding);
  const sink = getSink(finding);

  if (!sink) return DEFAULT_STANDALONE_TEMPLATE("this location");

  if (source) {
    const template = FLOW_TEMPLATES[key] || DEFAULT_FLOW_TEMPLATE;
    return template(source.snippet, sink.snippet);
  }

  const template = STANDALONE_TEMPLATES[key] || DEFAULT_STANDALONE_TEMPLATE;
  return template(sink.snippet);
}

// --- Step-by-step attack narration ------------------------------------------
//
// One line per node in finding.path, from the attacker's point of view.
// Role comes straight from path[i].type — deterministic, not inferred.

const STEP_VERBS = {
  "sql-injection": {
    source: (s) => `Attacker crafts a payload and submits it through ${s}.`,
    sink: (s) => `The payload reaches ${s} and executes as part of the SQL query — game over.`,
  },
  "cross-site-scripting-reflected": {
    source: (s) => `Attacker submits a script payload via ${s}.`,
    sink: (s) => `The payload is written into the response through ${s} and executes in the victim's browser.`,
  },
  "cross-site-scripting-dom": {
    source: (s) => `Attacker submits a script payload via ${s}.`,
    sink: (s) => `The payload is written into ${s} and executes in the victim's browser.`,
  },
  "command-injection": {
    source: (s) => `Attacker supplies shell metacharacters through ${s}.`,
    sink: (s) => `${s} executes the string as a shell command — the attacker now runs code on the host.`,
  },
  "path-traversal": {
    source: (s) => `Attacker sets a path like "../../etc/passwd" via ${s}.`,
    sink: (s) => `${s} opens the resolved path, stepping outside the intended directory.`,
  },
  "code-injection-eval": {
    source: (s) => `Attacker crafts a malicious script payload via ${s}.`,
    sink: (s) => `${s} executes the payload as JavaScript, running the attacker's code.`,
  },
  "code-injection-function-constructor": {
    source: (s) => `Attacker crafts a malicious script payload via ${s}.`,
    sink: (s) => `${s} compiles the payload into a function and it runs immediately.`,
  },
  "server-side-request-forgery-ssrf": {
    source: (s) => `Attacker supplies an internal or arbitrary URL via ${s}.`,
    sink: (s) => `${s} makes the request on the attacker's behalf, from inside your network.`,
  },
  "open-redirect": {
    source: (s) => `Attacker crafts a link with a malicious destination via ${s}.`,
    sink: (s) => `${s} sends the victim to the attacker-controlled destination.`,
  },
};

const DEFAULT_STEP_VERBS = {
  source: (s) => `Attacker controls the value entering at ${s}.`,
  sink: (s) => `The value reaches ${s}, a sensitive operation, unsanitized.`,
};

const STANDALONE_STEP_VERBS = {
  "hardcoded-secret": (s) => `${s} hardcodes a credential that anyone reading this file can extract.`,
  "weak-cryptographic-algorithm": (s) => `${s} uses a broken algorithm an attacker can defeat with commodity hardware.`,
  "insecure-cookie-configuration": (s) => `${s} sets a cookie an attacker's script could read or intercept.`,
};

const DEFAULT_STANDALONE_STEP_VERB = (s) => `${s} was flagged as a standalone issue, independent of data flow.`;

/**
 * Returns the narrative for one node in finding.path.
 * @returns {{ role: 'source'|'sink', line: number, snippet: string, text: string, file: string }}
 */
export function getStepNarrative(finding, index) {
  const path = finding.path || [];
  const step = path[index];
  if (!step) return null;

  const key = normalizeType(finding.vulnerability_type);

  // Standalone finding: single node, no source -> just describe it directly.
  if (step.type === "sink" && path.length === 1) {
    const verb = STANDALONE_STEP_VERBS[key] || DEFAULT_STANDALONE_STEP_VERB;
    return { role: "sink", line: step.line, file: step.file, snippet: step.snippet, text: verb(step.snippet) };
  }

  const role = step.type === "source" ? "source" : "sink";
  const verbs = STEP_VERBS[key] || DEFAULT_STEP_VERBS;
  const text = verbs[role](step.snippet);

  return { role, line: step.line, file: step.file, snippet: step.snippet, text };
}

/** Convenience: full ordered list of steps for a finding. */
export function getAttackSteps(finding) {
  return (finding.path || []).map((_, i) => getStepNarrative(finding, i));
}
