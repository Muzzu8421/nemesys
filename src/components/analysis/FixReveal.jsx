"use client";

import React from "react";

export function FixReveal({ registerFixBoxRef }) {
  return (
    <div ref={registerFixBoxRef} className="mx-4 my-2 border-l-2 border-[#35BFFF] bg-[#35BFFF]/[0.07] px-3 py-2 font-[family-name:var(--font-space-mono)] text-[10px] leading-relaxed md:mx-6" style={{ display: "none", opacity: 0 }}>
      <div className="flex flex-wrap items-center gap-x-2 text-[#77736B]">
        <span className="line-through decoration-[#D92C24] decoration-2">... WHERE id = &apos;${"{"}userId{"}"}&apos;</span>
        <span className="font-bold text-[#35BFFF]">→</span>
        <span className="font-bold text-[#F2EFE6]">... WHERE id = $1</span>
      </div>
      <span className="mt-1 block font-bold tracking-[0.14em] text-[#35BFFF]">ISSUE RESOLVED / PARAMETERIZED QUERY APPLIED</span>
    </div>
  );
}
