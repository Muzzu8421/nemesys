"use client";

import React, { forwardRef } from "react";
import { AnalysisPipeline } from "./AnalysisPipeline";
import { CodeViewport } from "./CodeViewport";

export const AnalysisCore = forwardRef(function AnalysisCore(
  { registerPipelineRef, registerTraceLineRef, registerCodeLineRef, registerDetectBoxRef, registerExplainRef, registerFixBoxRef, registerFinalCtaRef, className = "", style = {} },
  ref
) {
  return (
    <section ref={ref} className={`absolute inset-0 z-[15] hidden select-none flex-col justify-between overflow-hidden px-4 py-6 pointer-events-none sm:px-6 sm:py-10 md:px-12 md:py-16 ${className}`} style={{ opacity: 0, ...style }}>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_48%,rgba(53,191,255,.08),transparent_48%)]" />
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EFE6]/10 pb-4">
        <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-[0.16em] text-[#F2EFE6]"><i className="mr-3 inline-block h-2 w-2 rounded-full bg-[#D92C24]" />04 / ANALYSIS CORE</span>
        <AnalysisPipeline registerPipelineRef={registerPipelineRef} />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-3 sm:gap-4">
        <div>
          <p className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.22em] text-[#35BFFF]">INPUT / TRACE / DETECT / FIX</p>
          <h2 className="mt-2 font-[family-name:var(--font-anton)] text-[clamp(1.75rem,4vw,4.2rem)] leading-[0.9] tracking-[-0.02em] text-[#F2EFE6]">FOLLOW THE LINE.<br /><span className="text-[#D92C24]">FIX THE CAUSE.</span></h2>
        </div>
        <CodeViewport registerTraceLineRef={registerTraceLineRef} registerCodeLineRef={registerCodeLineRef} registerDetectBoxRef={registerDetectBoxRef} registerExplainRef={registerExplainRef} registerFixBoxRef={registerFixBoxRef} />
        <div ref={registerFinalCtaRef} className="flex flex-col items-start justify-between gap-3 border border-[#35BFFF]/45 bg-black/65 px-4 py-3 backdrop-blur-md pointer-events-auto sm:flex-row sm:items-center sm:gap-4" style={{ opacity: 0 }}>
          <div><strong className="font-[family-name:var(--font-anton)] text-xl tracking-[0.04em] text-[#F2EFE6]">ISSUE RESOLVED</strong><span className="mt-1 block font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-[0.1em] text-[#77736B] sm:ml-3 sm:mt-0 sm:inline sm:text-[10px] sm:tracking-[0.12em]">Safe query path validated</span></div>
          <a href="#" className="shrink-0 bg-[#35BFFF] px-4 py-2 font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-black">Scan code</a>
        </div>
      </main>

      <footer className="relative z-10 flex flex-wrap justify-between gap-4 border-t border-[#F2EFE6]/10 pt-4 font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-[0.13em] text-[#77736B]">
        <span>Inter-procedural taint analysis / online</span>
        <span>Issue ID: <b className="text-[#35BFFF]">NMS-89-031</b></span>
      </footer>
    </section>
  );
});
