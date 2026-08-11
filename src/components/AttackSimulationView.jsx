"use client"
// src/components/AttackSimulationView.jsx
//
// Plays back a finding's taint trace as an animated "attacker's path"
// through the code: source -> hop(s) -> sink. The SEQUENCE is fully
// deterministic (it's just finding.trace, which the taint analyzer already
// produced) — nothing here is generated. Only the per-step narration text
// is optionally AI-enriched; it always starts from the instant template
// version so the animation never blocks or waits on a model.

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocalAi } from "./local-ai-provider";
import { getAttackSteps } from "@/core/ai/templates";

const STEP_DURATION_MS = 2200;

const ROLE_LABEL = {
  source: "ENTRY POINT",
  sink: "DETONATES",
};

const ROLE_COLOR = {
  source: "#22d3ee", // cyan
  sink: "#f87171", // red
};

export default function AttackSimulationView({ finding }) {
  const { source: aiSource, byokConfig, explainStep } = useLocalAi();
  const baseSteps = useMemo(() => getAttackSteps(finding), [finding]);

  const [steps, setSteps] = useState(baseSteps);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const timerRef = useRef(null);

  const canEnrich = aiSource === "ollama" || !!byokConfig;

  // Reset when the finding changes
  useEffect(() => {
    setSteps(baseSteps);
    setCurrentIndex(0);
    setPlaying(false);
  }, [baseSteps]);

  // Autoplay loop
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

  // Optional: enrich narration with AI, one step at a time, in the
  // background. Never blocks the animation — each step swaps in when ready.
  const enrichWithAi = useCallback(async () => {
    if (!canEnrich || enriching) return;
    setEnriching(true);
    const preferByok = aiSource !== "ollama" && !!byokConfig;
    const next = [...baseSteps];
    for (let i = 0; i < next.length; i++) {
      try {
        const enriched = await explainStep(finding, i, { preferByok });
        if (enriched) {
          next[i] = enriched;
          setSteps([...next]);
        }
      } catch {
        // leave template text for this step
      }
    }
    setEnriching(false);
  }, [canEnrich, enriching, aiSource, byokConfig, baseSteps, explainStep, finding]);

  if (!steps.length) return null;

  const current = steps[currentIndex];
  const isStandalone = steps.length === 1;

  // Standalone findings (hardcoded secret, weak crypto, insecure cookie)
  // have no data flow to animate — one node, no source. Show it as a
  // static callout rather than a one-dot "path" with a pointless Play button.
  if (isStandalone) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">Why This Matters</h3>
          {canEnrich && (
            <button
              onClick={enrichWithAi}
              disabled={enriching}
              className="text-xs px-2.5 py-1 rounded-md border border-violet-400/30 text-violet-300 hover:bg-violet-400/10 disabled:opacity-50 transition-colors"
            >
              {enriching ? "Enriching…" : "Enrich with AI"}
            </button>
          )}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: ROLE_COLOR.sink }}>
              STATIC ISSUE — no data flow required
            </span>
            <span className="text-[11px] font-mono text-white/40">line {current.line}</span>
          </div>
          <code className="block text-xs font-mono text-white/70 bg-black/40 rounded px-2 py-1.5 mb-3 overflow-x-auto">
            {current.snippet}
          </code>
          <p className="text-sm text-white/85 leading-relaxed">{current.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/90 tracking-wide">
          Attack Simulation
        </h3>
        <div className="flex items-center gap-2">
          {canEnrich && (
            <button
              onClick={enrichWithAi}
              disabled={enriching}
              className="text-xs px-2.5 py-1 rounded-md border border-violet-400/30 text-violet-300 hover:bg-violet-400/10 disabled:opacity-50 transition-colors"
            >
              {enriching ? "Enriching…" : "Enrich with AI"}
            </button>
          )}
          <button
            onClick={playing ? pause : play}
            className="text-xs px-3 py-1 rounded-md border border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 transition-colors"
          >
            {playing ? "Pause" : currentIndex >= steps.length - 1 ? "Replay" : "Play"}
          </button>
        </div>
      </div>

      {/* Node path */}
      <div className="relative flex items-center mb-6 px-2">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => jumpTo(i)}
              className="relative z-10 flex flex-col items-center gap-1.5 group"
            >
              <div
                className="w-4 h-4 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i <= currentIndex ? ROLE_COLOR[step.role] : "rgba(255,255,255,0.15)",
                  boxShadow:
                    i === currentIndex ? `0 0 14px 3px ${ROLE_COLOR[step.role]}` : "none",
                  transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
                }}
              />
              <span
                className="text-[10px] uppercase tracking-wider transition-colors"
                style={{ color: i <= currentIndex ? ROLE_COLOR[step.role] : "rgba(255,255,255,0.3)" }}
              >
                {ROLE_LABEL[step.role]}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-1 relative overflow-hidden bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 transition-all ease-linear"
                  style={{
                    width: i < currentIndex ? "100%" : "0%",
                    backgroundColor: ROLE_COLOR[step.role],
                    transitionDuration: `${STEP_DURATION_MS}ms`,
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current step detail */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] font-mono uppercase tracking-wider"
            style={{ color: ROLE_COLOR[current.role] }}
          >
            Step {currentIndex + 1} of {steps.length} — {ROLE_LABEL[current.role]}
          </span>
          <span className="text-[11px] font-mono text-white/40">line {current.line}</span>
        </div>
        <code className="block text-xs font-mono text-white/70 bg-black/40 rounded px-2 py-1.5 mb-3 overflow-x-auto">
          {current.snippet}
        </code>
        <p className="text-sm text-white/85 leading-relaxed">{current.text}</p>
      </div>
    </div>
  );
}
