"use client";

import React, { forwardRef } from "react";

/**
 * AnalysisCore Component
 * Narrative State 04: Continuous Futuristic Security Instrumentation Machine.
 * Replaces HowItWorksSection and absorbs AttackSimulationView taint analysis.
 * Transitions through: INPUT → TRACE → DETECT → FIX in one unified composition.
 */
export const AnalysisCore = forwardRef(function AnalysisCore(
  {
    registerPipelineRef,
    registerTraceLineRef,
    registerDetectBoxRef,
    registerFixBoxRef,
    registerFinalCtaRef,
    className = "",
    style = {},
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={`absolute inset-0 z-[15] hidden flex-col justify-between py-12 md:py-16 px-6 md:px-12 pointer-events-none select-none ${className}`}
      style={{ opacity: 0, ...style }}
    >
      {/* ── AMBIENT ELECTRIC CYAN GLOW FOR FIX STATE ─────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[0] opacity-35"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 75% 50%, rgba(53,191,255,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ── TOP HEADER / NARRATIVE STATE IDENTIFIER ──────────────── */}
      <div className="relative z-[10] flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D92C24]" />
          <span className="font-[family-name:var(--font-space-mono)] text-[0.68rem] tracking-[0.25em] text-[#F2EFE6] uppercase font-bold">
            04 — ANALYSIS CORE // AUTOMATED TAINT INSTRUMENTATION
          </span>
        </div>

        {/* 4 Continuous Pipeline Stage Indicators */}
        <div
          ref={registerPipelineRef}
          className="flex items-center gap-4 md:gap-6 font-[family-name:var(--font-space-mono)] text-[0.62rem] tracking-[0.18em] uppercase"
        >
          <div className="flex items-center gap-1.5 text-[#35BFFF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35BFFF]" />
            <span>01 INPUT</span>
          </div>
          <span className="text-white/20">→</span>
          <div className="flex items-center gap-1.5 text-[#F2EFE6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D92C24]" />
            <span>02 TRACE</span>
          </div>
          <span className="text-white/20">→</span>
          <div className="flex items-center gap-1.5 text-[#D92C24]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D92C24] animate-ping" />
            <span>03 DETECT</span>
          </div>
          <span className="text-white/20">→</span>
          <div className="flex items-center gap-1.5 text-[#35BFFF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35BFFF]" />
            <span>04 FIX</span>
          </div>
        </div>
      </div>

      {/* ── CENTER AREA: CONTINUOUS CODE ANALYSIS VIEWPORT ────────── */}
      <div className="relative z-[10] my-auto w-full max-w-5xl mx-auto flex flex-col gap-6">
        {/* Instrumentation Window Frame */}
        <div className="relative rounded-xl border border-white/15 bg-black/85 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Machine Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D92C24]/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#77736B]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#35BFFF]/80" />
              <span className="font-[family-name:var(--font-space-mono)] text-[10px] text-[#77736B] tracking-[0.15em] ml-2">
                NEMESYS_ENGINE // src/controllers/user.controller.ts
              </span>
            </div>
            <div className="flex items-center gap-3 font-[family-name:var(--font-space-mono)] text-[9px] text-[#35BFFF] uppercase tracking-[0.1em]">
              <span>CFG: COMPILED</span>
              <span>•</span>
              <span>SYNTAX: AST VALID</span>
            </div>
          </div>

          {/* Interactive Code Stream with Gutter Tracing Line */}
          <div className="relative p-5 md:p-6 font-[family-name:var(--font-space-mono)] text-[clamp(10px,0.85vw,13px)] leading-[1.8] overflow-x-auto">
            {/* Animated Crimson Trace Gutter Line */}
            <div
              ref={registerTraceLineRef}
              className="absolute left-3 top-6 w-0.5 bg-[#D92C24] shadow-[0_0_8px_#D92C24] rounded-full will-change-transform"
              style={{ height: "0px", opacity: 0 }}
            />

            {/* Base Code Snippet with Taint Flow */}
            <div className="flex flex-col gap-1 text-[#F2EFE6]/80 pl-4">
              <div className="flex items-center gap-4">
                <span className="text-[#77736B]/50 select-none w-5 text-right text-xs">01</span>
                <span>
                  <strong className="text-[#35BFFF]">export async function</strong>{" "}
                  getUserProfile(req: Request) {"{"}
                </span>
              </div>

              {/* Line 02: Source Input */}
              <div className="flex items-center gap-4 bg-[#35BFFF]/10 -mx-4 px-4 py-0.5 rounded border border-[#35BFFF]/20">
                <span className="text-[#35BFFF] select-none w-5 text-right text-xs">02</span>
                <span>
                  <strong className="text-[#35BFFF]">const</strong> userId ={" "}
                  <strong className="text-[#F2EFE6] underline decoration-[#35BFFF] decoration-2">
                    req.query.id
                  </strong>
                  ;{" "}
                  <span className="text-[#35BFFF] text-[10px] tracking-widest ml-2">
                    // [STAGE 1: TAINT SOURCE]
                  </span>
                </span>
              </div>

              {/* Line 03: Vulnerable State (Cross-faded with Fix) */}
              <div
                ref={registerDetectBoxRef}
                className="flex items-center gap-4 bg-[#D92C24]/15 -mx-4 px-4 py-1 rounded border border-[#D92C24]/60 shadow-[0_0_15px_rgba(217,44,36,0.3)] transition-all duration-300"
                style={{ opacity: 0 }}
              >
                <span className="text-[#D92C24] select-none w-5 text-right text-xs font-bold">03</span>
                <span className="text-[#D92C24] font-bold">
                  const query = `SELECT * FROM users WHERE id = &apos;${"{"}userId{"}"}&apos;`;{" "}
                  <span className="text-[10px] bg-[#D92C24] text-white px-1.5 py-0.5 rounded ml-2 uppercase">
                    [STAGE 3: DANGEROUS SINK DETECTED]
                  </span>
                </span>
              </div>

              {/* Line 03 (FIXED): Transformed Corrected State */}
              <div
                ref={registerFixBoxRef}
                className="flex items-center gap-4 bg-[#35BFFF]/15 -mx-4 px-4 py-1 rounded border border-[#35BFFF]/60 shadow-[0_0_20px_rgba(53,191,255,0.25)] transition-all duration-300"
                style={{ opacity: 0 }}
              >
                <span className="text-[#35BFFF] select-none w-5 text-right text-xs font-bold">03</span>
                <span className="text-[#35BFFF] font-bold">
                  const query = &quot;SELECT * FROM users WHERE id = $1&quot;;{" "}
                  <span className="text-[10px] bg-[#35BFFF] text-black font-extrabold px-1.5 py-0.5 rounded ml-2 uppercase">
                    [STAGE 4: SECURE PARAMETERIZATION PATCH]
                  </span>
                </span>
              </div>

              {/* Line 04: Execution Sink */}
              <div className="flex items-center gap-4">
                <span className="text-[#77736B]/50 select-none w-5 text-right text-xs">04</span>
                <span>
                  <strong className="text-[#35BFFF]">const</strong> record ={" "}
                  <strong className="text-[#F2EFE6]">await db.query</strong>(query, [userId]);
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[#77736B]/50 select-none w-5 text-right text-xs">05</span>
                <span>
                  <strong className="text-[#35BFFF]">return</strong> Response.json(record);
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[#77736B]/50 select-none w-5 text-right text-xs">06</span>
                <span>{"}"}</span>
              </div>
            </div>
          </div>

          {/* Machine Telemetry Footer with Attack Scenario absorbed from AttackSimulationView */}
          <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-3 font-[family-name:var(--font-space-mono)] text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-[#77736B] uppercase tracking-wider">PAYLOAD SIMULATION:</span>
              <code className="text-[#D92C24] font-bold tracking-tight">
                &apos; UNION SELECT username, password_hash FROM users --
              </code>
            </div>
            <div className="flex items-center gap-4 text-[#35BFFF] uppercase font-bold">
              <span>REMEDIATION STATUS: PASS (0 WARNINGS)</span>
            </div>
          </div>
        </div>

        {/* Final CTA appearing when reaching the Fix / Final Climax */}
        <div
          ref={registerFinalCtaRef}
          className="flex items-center justify-between p-4 rounded-lg border border-[#35BFFF]/40 bg-[#35BFFF]/5 backdrop-blur-md pointer-events-auto"
          style={{ opacity: 0 }}
        >
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-anton)] text-xl text-[#F2EFE6] tracking-wide uppercase leading-none">
              TAINT REMEDIATED. PRODUCTION SECURED.
            </span>
            <span className="font-[family-name:var(--font-ibm-plex)] text-[11px] text-[#77736B] uppercase tracking-[0.1em] mt-1">
              Deterministic AST &amp; control-flow analysis integrated directly into your CI/CD.
            </span>
          </div>

          <a
            href="#"
            className="px-6 py-2.5 rounded bg-[#35BFFF] text-black font-[family-name:var(--font-space-mono)] font-bold text-xs uppercase tracking-[0.15em] hover:bg-white transition-all shadow-[0_0_20px_rgba(53,191,255,0.4)]"
          >
            Start Scanning Free →
          </a>
        </div>
      </div>

      {/* ── BOTTOM PIPELINE STATUS BAR ───────────────────────────── */}
      <div className="relative z-[10] border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-4 font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] uppercase tracking-[0.15em]">
        <div className="flex items-center gap-3">
          <span className="text-[#35BFFF]">● ANALYSIS PIPELINE:</span>
          <span className="text-[#F2EFE6]">STAGE 04 OF 04 (REMEDIATION APPLIED)</span>
        </div>
        <div className="flex items-center gap-6">
          <span>CALL GRAPH ENGINE: <strong>ONLINE</strong></span>
          <span>PATCH CONFIDENCE: <strong className="text-[#35BFFF]">100% VALIDATED</strong></span>
        </div>
      </div>
    </div>
  );
});
