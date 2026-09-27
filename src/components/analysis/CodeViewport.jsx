"use client";

import React from "react";
import { TraceLine } from "./TraceLine";
import { FindingPanel } from "./FindingPanel";
import { FixReveal } from "./FixReveal";

function CodeLine({ number, children, className = "", lineRef }) {
  return (
    <div ref={lineRef} className={`flex gap-4 px-4 py-0.5 transition-none md:px-6 ${className}`}>
      <span className="w-5 shrink-0 text-right text-[#77736B]/60">{number}</span>
      <code className="min-w-max text-[#F2EFE6]/80">{children}</code>
    </div>
  );
}

export function CodeViewport({ registerTraceLineRef, registerCodeLineRef, registerDetectBoxRef, registerExplainRef, registerFixBoxRef }) {
  return (
    <div className="relative overflow-hidden border border-[#F2EFE6]/15 bg-black/80 shadow-[0_24px_70px_rgba(0,0,0,0.72)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-[#F2EFE6]/10 bg-[#F2EFE6]/[0.025] px-4 py-3 font-[family-name:var(--font-space-mono)] text-[9px] tracking-[0.11em] text-[#77736B] md:px-6">
        <span>NEMESYS_ENGINE / src/controllers/user.controller.ts</span>
        <span className="hidden text-[#35BFFF] sm:block">AST / CFG / TAINT MAP</span>
      </div>
      <div className="relative overflow-x-auto py-4 font-[family-name:var(--font-space-mono)] text-[clamp(10px,0.9vw,13px)] leading-[1.75]">
        <TraceLine registerTraceLineRef={registerTraceLineRef} />
        <CodeLine number="01" lineRef={(element) => registerCodeLineRef?.(element, 0)}><b className="text-[#35BFFF]">export async function</b> getUserProfile(req) {"{"}</CodeLine>
        <CodeLine number="02" lineRef={(element) => registerCodeLineRef?.(element, 1)} className="bg-[#35BFFF]/[0.045]"><b className="text-[#35BFFF]">const</b> userId = <span className="border-b border-[#35BFFF] text-[#F2EFE6]">req.query.id</span>; <span className="text-[9px] text-[#35BFFF]">// TAINT SOURCE</span></CodeLine>
        <CodeLine number="03" lineRef={(element) => registerCodeLineRef?.(element, 2)} className="bg-[#D92C24]/[0.045]"><b className="text-[#35BFFF]">const</b> query = <span className="text-[#D92C24]">`SELECT * FROM users WHERE id = &apos;${"{"}userId{"}"}&apos;`</span>;</CodeLine>
        <FindingPanel registerDetectBoxRef={registerDetectBoxRef} registerExplainRef={registerExplainRef} />
        <FixReveal registerFixBoxRef={registerFixBoxRef} />
        <CodeLine number="04" lineRef={(element) => registerCodeLineRef?.(element, 3)}><b className="text-[#35BFFF]">const</b> record = <b className="text-[#F2EFE6]">await db.query</b>(query, [userId]);</CodeLine>
        <CodeLine number="05"><b className="text-[#35BFFF]">return</b> Response.json(record);</CodeLine>
        <CodeLine number="06">{"}"}</CodeLine>
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-[#F2EFE6]/10 bg-[#F2EFE6]/[0.02] px-4 py-3 font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-[0.1em] text-[#77736B] md:px-6">
        <span>Payload: <b className="text-[#D92C24]">&apos; UNION SELECT password --</b></span>
        <span className="text-[#35BFFF]">Patch confidence: 100%</span>
      </div>
    </div>
  );
}
