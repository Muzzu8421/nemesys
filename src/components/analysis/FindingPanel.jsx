"use client";

import React from "react";

export function FindingPanel({ registerDetectBoxRef }) {
  return (
    <div ref={registerDetectBoxRef} className="mx-4 my-2 border-l-2 border-[#D92C24] bg-[#D92C24]/[0.08] px-3 py-2 font-[family-name:var(--font-space-mono)] text-[10px] leading-relaxed text-[#F2EFE6] shadow-[0_0_22px_rgba(217,44,36,0.16)] md:mx-6" style={{ opacity: 0 }}>
      <span className="font-bold tracking-[0.15em] text-[#D92C24]">VULNERABILITY DETECTED</span>
      <span className="mx-2 text-[#77736B]">//</span>
      CWE-89 SQL INJECTION
      <span className="mt-1 block text-[#77736B]">Untrusted input reaches raw query interpolation at line 03.</span>
    </div>
  );
}
