"use client";

import React, { forwardRef } from "react";
import { ThreatHeadline } from "./ThreatHeadline";
import { ThreatNode } from "./ThreatNode";
import { TracePath } from "./TracePath";

const TRACE_STEPS = [
  { id: "input", label: "USER INPUT", snippet: "req.query.id", detail: "Tainted external payload", type: "source" },
  { id: "request", label: "REQUEST", snippet: "GET /api/users", detail: "Ingress route unvalidated", type: "hop" },
  { id: "function", label: "FUNCTION", snippet: "getUserRecord(id)", detail: "Argument carries taint", type: "hop" },
  { id: "service", label: "SERVICE", snippet: "UserService.find()", detail: "No validation boundary", type: "hop" },
  { id: "database", label: "DATABASE", snippet: "connection.raw()", detail: "Raw query construction", type: "hop" },
  { id: "sink", label: "DANGEROUS SINK", snippet: "db.query(sql)", detail: "Exploit detonation point", type: "sink" },
];

export const ThreatTrace = forwardRef(function ThreatTrace(
  { registerWordRef, registerNodeRef, registerPathRef, registerTracerRef, registerMobilePathRef, registerMobileTracerRef, registerSinkAlertRef, registerHeadRef, className = "", style = {} },
  ref
) {
  return (
    <section ref={ref} className={`absolute inset-0 z-[15] hidden select-none flex-col justify-between overflow-hidden px-6 py-10 pointer-events-none md:px-12 md:py-16 ${className}`} style={{ opacity: 0, ...style }}>
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(242,239,230,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(242,239,230,.35)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div aria-hidden="true" className="absolute -right-[6vw] top-[14vh] font-[family-name:var(--font-anton)] text-[clamp(10rem,28vw,28rem)] leading-none text-[#D92C24]/[0.035]">TRACE</div>

      <header ref={registerHeadRef} className="relative z-10 flex items-center justify-between border-b border-[#F2EFE6]/10 pb-4 font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-[0.16em] text-[#77736B]">
        <span className="flex items-center gap-3 text-[#F2EFE6]"><i className="h-2 w-2 rounded-full bg-[#D92C24] shadow-[0_0_10px_#D92C24]" />02 / THREAT TRACE</span>
        <span className="hidden sm:block">SOURCE: <b className="text-[#35BFFF]">req.query.id</b> / 06 HOPS</span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-6 md:gap-12">
        <ThreatHeadline registerHeadRef={registerHeadRef} registerWordRef={registerWordRef} />
        <div className="relative w-full">
          <TracePath registerPathRef={registerPathRef} registerTracerRef={registerTracerRef} registerMobilePathRef={registerMobilePathRef} registerMobileTracerRef={registerMobileTracerRef} />
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-6 md:gap-3">
            {TRACE_STEPS.map((step, index) => (
              <ThreatNode key={step.id} step={step} index={index} registerRef={registerNodeRef} registerSinkAlertRef={step.type === "sink" ? registerSinkAlertRef : undefined} />
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex flex-wrap justify-between gap-4 border-t border-[#F2EFE6]/10 pt-4 font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-[0.13em] text-[#77736B]">
        <span className="text-[#D92C24]">CWE-89 / SQL injection path confirmed</span>
        <span>Trace latency: 14ms / confidence: <b className="text-[#35BFFF]">99.8%</b></span>
      </footer>
    </section>
  );
});
