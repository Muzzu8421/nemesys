"use client";

import React from "react";

const STAGES = ["INPUT", "TRACE", "DETECT", "FIX"];

export function AnalysisPipeline({ registerPipelineRef }) {
  return (
    <div ref={registerPipelineRef} className="flex items-center gap-1 font-[family-name:var(--font-space-mono)] text-[8px] uppercase tracking-[0.08em] text-[#77736B] sm:gap-4 sm:text-[10px] sm:tracking-[0.14em]">
      {STAGES.map((stage, index) => (
        <React.Fragment key={stage}>
          {index > 0 && <span className="text-[#F2EFE6]/20">/</span>}
          <span className={stage === "DETECT" ? "text-[#D92C24]" : stage === "INPUT" || stage === "FIX" ? "text-[#35BFFF]" : "text-[#F2EFE6]"}>
            0{index + 1} {stage}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
