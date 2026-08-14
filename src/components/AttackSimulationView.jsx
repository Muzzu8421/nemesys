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

function normalizeType(type) {
  return (type || "").toLowerCase().replace(/[()]/g, "").trim().replace(/\s+/g, "-");
}

function buildStepsFromPath(finding) {
  return (finding.path || []).map((node) => ({
    role: node.type === "source" ? "source" : "sink",
    line: node.line,
    file: node.file,
    snippet: node.snippet,
    text:
      node.type === "source"
        ? `Tainted data enters here through ${node.snippet}`
        : `Data reaches ${node.snippet} — a sensitive operation`,
  }));
}

export default function AttackSimulationView({ finding }) {
  const [steps, setSteps] = useState(() => buildStepsFromPath(finding));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setSteps(buildStepsFromPath(finding));
    setCurrentIndex(0);
    setPlaying(false);
  }, [finding]);

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


  if (!steps.length) return null;

  const sinkKey = normalizeType(finding.vulnerability_type);
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white/90 tracking-wide">Attack Simulation</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={playing ? pause : play}
            className="text-xs px-3 py-1 rounded-md border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 transition-colors"
          >
            {playing ? "Pause" : currentIndex >= steps.length - 1 ? "Replay" : "Play"}
          </button>
        </div>
      </div>

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
                      key={`${i}-${playing}-${currentIndex}`}
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