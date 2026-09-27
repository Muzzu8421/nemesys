"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { TopologyScene } from "./TopologyScene";

export const SecurityTopology = forwardRef(function SecurityTopology(
  { registerHeadlineRef, registerHeadlinePhraseRef, registerAlertRef, registerStatsRef, className = "", style = {} },
  ref
) {
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  useImperativeHandle(ref, () => ({
    get element() {
      return rootRef.current;
    },
    setProgress(progress) {
      sceneRef.current?.setProgress(progress);
    },
  }));

  return (
    <section ref={rootRef} className={`absolute inset-0 z-[15] hidden select-none flex-col justify-between overflow-hidden px-6 py-10 pointer-events-none md:px-12 md:py-16 ${className}`} style={{ opacity: 0, ...style }}>
      <TopologyScene ref={sceneRef} />
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_72%_48%,transparent_0%,rgba(0,0,0,.35)_47%,rgba(0,0,0,.88)_100%)]" />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EFE6]/10 pb-4 font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-[0.16em] text-[#77736B]">
        <span className="flex items-center gap-3 text-[#F2EFE6]"><i className="h-2 w-2 rounded-full bg-[#35BFFF] shadow-[0_0_10px_#35BFFF]" />03 / SECURITY TOPOLOGY</span>
        <span>INTER-PROCEDURAL GRAPH / <b className="text-[#35BFFF]">DEPTH 06</b></span>
      </header>

      <div ref={registerHeadlineRef} className="relative z-10 max-w-xl md:ml-[5vw]">
        <p className="mb-3 font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.24em] text-[#35BFFF]">DEPTH-FIRST DISCOVERY</p>
        <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2.7rem,5.4vw,6rem)] leading-[0.88] tracking-[-0.02em] text-[#F2EFE6]">
          <span ref={(element) => registerHeadlinePhraseRef?.(element, 0)} className="block">
            <span data-topology-word className="inline-block will-change-transform" style={{ clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", opacity: 0 }}>SEE</span>{" "}
            <span data-topology-word className="inline-block will-change-transform" style={{ clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", opacity: 0 }}>THE</span>{" "}
            <span data-topology-word className="inline-block will-change-transform" style={{ clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", opacity: 0 }}>PATH</span>
          </span>
          <span ref={(element) => registerHeadlinePhraseRef?.(element, 1)} className="block">
            <span data-topology-word className="inline-block will-change-transform" style={{ clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", opacity: 0 }}>BETWEEN</span>{" "}
            <span data-topology-word className="inline-block text-[#D92C24] will-change-transform" style={{ clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", opacity: 0 }}>CAUSE</span>
          </span>
          <span ref={(element) => registerHeadlinePhraseRef?.(element, 2)} className="block">
            <span data-topology-word className="inline-block will-change-transform" style={{ clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", opacity: 0 }}>AND</span>{" "}
            <span data-topology-word className="inline-block will-change-transform" style={{ clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", opacity: 0 }}>EFFECT.</span>
          </span>
        </h2>
        <p className="mt-4 max-w-md font-[family-name:var(--font-ibm-plex)] text-sm leading-relaxed text-[#77736B]">
          NEMESYS follows execution through the codebase, exposing the relationship a single-file check cannot see.
        </p>
      </div>

      <footer className="relative z-10 flex flex-wrap items-end justify-between gap-4 border-t border-[#F2EFE6]/10 pt-4">
        <div ref={registerAlertRef} className="border border-[#D92C24]/60 bg-black/70 px-3 py-2 font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-[0.13em] text-[#F2EFE6] backdrop-blur-sm" style={{ opacity: 0 }}>
          <span className="mr-2 text-[#D92C24]">[!]</span> VULNERABILITY DETECTED / UNPROTECTED DATA-SINK
        </div>
        <div ref={registerStatsRef} className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-[0.13em] text-[#77736B]">
          06 nodes / 07 relationships / <b className="text-[#D92C24]">01 exposed path</b>
        </div>
      </footer>
    </section>
  );
});
