"use client";

import React, { forwardRef } from "react";
import { WordReveal } from "../motion/MaskReveal";

const TRACE_STEPS = [
  {
    id: "input",
    label: "USER INPUT",
    snippet: "req.query.id",
    detail: "Tainted external payload",
    type: "source",
    subtext: "' UNION SELECT password...",
  },
  {
    id: "router",
    label: "REQUEST",
    snippet: "/api/v1/users",
    detail: "Ingress route unvalidated",
    type: "hop",
    subtext: "HTTP GET parameters",
  },
  {
    id: "controller",
    label: "FUNCTION",
    snippet: "getUserRecord(id)",
    detail: "Taint passed through argument",
    type: "hop",
    subtext: "call stack depth: 1",
  },
  {
    id: "service",
    label: "SERVICE",
    snippet: "UserService.find()",
    detail: "Zero sanitization applied",
    type: "hop",
    subtext: "no schema validation",
  },
  {
    id: "db",
    label: "DATABASE",
    snippet: "connection.raw()",
    detail: "Raw query concatenation",
    type: "hop",
    subtext: "dynamic string interpolation",
  },
  {
    id: "sink",
    label: "DANGEROUS SINK",
    snippet: "db.query(sqlString)",
    detail: "EXPLOIT DETONATION POINT",
    type: "sink",
    subtext: "CVE-2024-SQLI CRITICAL",
  },
];

/**
 * ThreatTrace Component
 * Narrative State 02: Interactive Security Incident Data-Flow Trace.
 * Demonstrates a living security trace where untrusted data travels
 * from user input through intermediate nodes into a dangerous sink.
 */
export const ThreatTrace = forwardRef(function ThreatTrace(
  {
    registerWordRef,
    registerNodeRef,
    registerPathRef,
    registerSinkAlertRef,
    registerHeadRef,
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
      {/* ── BACKGROUND GHOST WATERMARK ───────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[0] select-none opacity-[0.05]"
        aria-hidden
      >
        <span
          className="font-[family-name:var(--font-anton)] text-[clamp(140px,26vw,360px)] uppercase leading-none"
          style={{
            WebkitTextStroke: "1.5px #D92C24",
            WebkitTextFillColor: "transparent",
          }}
        >
          TAINT
        </span>
      </div>

      {/* ── CORNER BRACKETS & TECHNICAL MARKINGS ──────────────────── */}
      {[
        "top-6 left-6 border-t border-l",
        "top-6 right-6 border-t border-r",
        "bottom-6 left-6 border-b border-l",
        "bottom-6 right-6 border-b border-r",
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-6 h-6 border-[#D92C24]/40 pointer-events-none z-[2] ${cls}`}
        />
      ))}

      {/* ── TOP HEADER / NARRATIVE STATE IDENTIFIER ──────────────── */}
      <div
        ref={registerHeadRef}
        className="relative z-[10] flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D92C24] animate-pulse" />
          <span className="font-[family-name:var(--font-space-mono)] text-[0.68rem] tracking-[0.25em] text-[#F2EFE6] uppercase font-bold">
            02 — THREAT TRACE // REAL-TIME TAINT INJECTION
          </span>
        </div>
        <div className="flex items-center gap-6 font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] tracking-[0.15em] uppercase">
          <span>SOURCE: <strong className="text-[#35BFFF]">req.query.id</strong></span>
          <span className="hidden sm:inline">PATH: <strong>6 HOPS</strong></span>
          <span>STATUS: <strong className="text-[#D92C24]">VULNERABLE</strong></span>
        </div>
      </div>

      {/* ── CENTER AREA: HEADLINE + INTERACTIVE SECURITY TRACE ────── */}
      <div className="relative z-[10] my-auto flex flex-col items-center justify-center gap-8 md:gap-12 w-full max-w-6xl mx-auto">
        {/* Main statement with word-by-word masked reveal */}
        <div className="text-center flex flex-col items-center">
          <span className="font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#D92C24] tracking-[0.3em] uppercase mb-2">
            SECURITY INCIDENT DETECTED
          </span>
          <WordReveal
            text="YOUR CODE HAS A WEAK POINT."
            highlightWords={["WEAK", "POINT"]}
            highlightClass="text-[#D92C24]"
            className="font-[family-name:var(--font-anton)] text-[clamp(2.8rem,7vw,7.5rem)] uppercase leading-[0.9] tracking-[-0.02em] text-[#F2EFE6]"
            registerWordRef={registerWordRef}
          />
          <p className="font-[family-name:var(--font-ibm-plex)] text-[clamp(12px,0.95vw,14px)] text-[#77736B] uppercase tracking-[0.08em] mt-3 max-w-xl">
            Static string inspection misses data flow. NEMESYS physically traces
            untrusted user input across function and service boundaries.
          </p>
        </div>

        {/* ── LIVING SECURITY TRACE DIAGRAM ──────────────────────── */}
        <div className="w-full relative px-2">
          {/* SVG connecting trace line with animated red signal */}
          <div className="relative w-full">
            <svg
              className="w-full h-12 overflow-visible pointer-events-none hidden md:block"
              preserveAspectRatio="none"
              viewBox="0 0 1000 60"
            >
              {/* Background inactive path */}
              <path
                d="M 50,30 L 950,30"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              {/* Active red tracing path animated by GSAP */}
              <path
                ref={registerPathRef}
                d="M 50,30 L 950,30"
                fill="none"
                stroke="#D92C24"
                strokeWidth="2.5"
                strokeDasharray="900"
                strokeDashoffset="900"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(217,44,36,0.8))",
                }}
              />
            </svg>

            {/* 6 Interactive Nodes along the Data Flow */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 relative md:-mt-8">
              {TRACE_STEPS.map((step, idx) => {
                const isSink = step.type === "sink";
                const isSource = step.type === "source";

                return (
                  <div
                    key={step.id}
                    ref={(el) => {
                      if (registerNodeRef) registerNodeRef(el, idx);
                    }}
                    className={`relative flex flex-col p-3 rounded-lg border transition-all duration-300 will-change-transform ${
                      isSink
                        ? "bg-[#D92C24]/10 border-[#D92C24]/60 shadow-[0_0_20px_rgba(217,44,36,0.25)]"
                        : isSource
                        ? "bg-[#35BFFF]/10 border-[#35BFFF]/50"
                        : "bg-black/60 border-white/10"
                    }`}
                    style={{ opacity: 0 }}
                  >
                    {/* Pulsing detonation marker on dangerous sink */}
                    {isSink && (
                      <span
                        ref={registerSinkAlertRef}
                        className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded text-[8px] font-[family-name:var(--font-space-mono)] font-bold bg-[#D92C24] text-white tracking-widest uppercase animate-pulse"
                      >
                        CRITICAL
                      </span>
                    )}

                    {/* Step order indicator */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#77736B] tracking-[0.2em]">
                        HOP 0{idx + 1}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isSink
                            ? "bg-[#D92C24] shadow-[0_0_8px_#D92C24]"
                            : isSource
                            ? "bg-[#35BFFF] shadow-[0_0_8px_#35BFFF]"
                            : "bg-[#77736B]"
                        }`}
                      />
                    </div>

                    {/* Label & code snippet */}
                    <span className="font-[family-name:var(--font-anton)] text-[clamp(1rem,1.4vw,1.3rem)] text-[#F2EFE6] tracking-wide uppercase leading-tight">
                      {step.label}
                    </span>
                    <code className="font-[family-name:var(--font-space-mono)] text-[9.5px] text-[#D92C24] mt-1 truncate">
                      {step.snippet}
                    </code>
                    <span className="font-[family-name:var(--font-ibm-plex)] text-[8.5px] text-[#77736B] tracking-tight mt-1 line-clamp-2">
                      {step.detail}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DIAGNOSTIC TELEMETRY ──────────────────────────── */}
      <div className="relative z-[10] border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-4 font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] uppercase tracking-[0.15em]">
        <div className="flex items-center gap-3">
          <span className="text-[#D92C24] font-bold">⚠ VULNERABILITY REACHED:</span>
          <span className="text-[#F2EFE6]">CWE-89 SQL INJECTION DETONATION</span>
        </div>
        <div className="flex items-center gap-6">
          <span>LATENCY: <strong>14ms</strong></span>
          <span>TAINT PROPAGATION: <strong className="text-[#35BFFF]">CONFIRMED</strong></span>
        </div>
      </div>
    </div>
  );
});
