"use client";

import React from "react";

export function ThreatNode({ step, index, registerRef, registerSinkAlertRef }) {
  const isSource = step.type === "source";
  const isSink = step.type === "sink";

  return (
    <article
      ref={(element) => registerRef?.(element, index)}
      data-active="false"
      className={`group relative z-10 min-w-0 border border-[#F2EFE6]/[0.12] bg-black/25 p-3 backdrop-blur-[2px] md:p-4 will-change-transform data-[active=true]:border-[#D92C24]/75 data-[active=true]:bg-black/[0.76] data-[active=true]:backdrop-blur-md data-[active=true]:shadow-[0_0_26px_rgba(217,44,36,0.22)] ${
        isSink
          ? "threat-sink border-[#D92C24]/45 bg-[#D92C24]/[0.045]"
          : isSource
            ? "threat-source border-[#35BFFF]/40 bg-[#35BFFF]/[0.035]"
            : ""
      }`}
      style={{ opacity: 0 }}
    >
      {isSink && (
        <span ref={registerSinkAlertRef} className="absolute -top-3 right-2 bg-[#D92C24] px-1.5 py-1 font-[family-name:var(--font-space-mono)] text-[8px] font-bold tracking-[0.16em] text-[#F2EFE6]" style={{ opacity: 0 }}>
          CRITICAL
        </span>
      )}
      <div className="mb-3 flex items-center justify-between font-[family-name:var(--font-space-mono)] text-[9px] tracking-[0.16em] text-[#77736B]">
        <span>HOP 0{index + 1}</span>
        <span className={`h-2 w-2 rounded-full ${isSink ? "bg-[#D92C24] shadow-[0_0_10px_#D92C24]" : isSource ? "bg-[#35BFFF] shadow-[0_0_10px_#35BFFF]" : "bg-[#77736B]"}`} />
      </div>
      <h3 className="font-[family-name:var(--font-anton)] text-[clamp(1rem,1.45vw,1.35rem)] leading-none tracking-[0.03em] text-[#F2EFE6]">
        {step.label}
      </h3>
      <code className={`mt-2 block truncate font-[family-name:var(--font-space-mono)] text-[10px] group-data-[active=true]:brightness-150 ${isSource ? "text-[#35BFFF]" : "text-[#D92C24]"}`}>
        {step.snippet}
      </code>
      <p className="mt-2 min-h-8 font-[family-name:var(--font-ibm-plex)] text-[10px] leading-[1.3] text-[#77736B] group-data-[active=true]:text-[#F2EFE6]/80">{step.detail}</p>
    </article>
  );
}
