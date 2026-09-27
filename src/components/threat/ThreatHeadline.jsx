"use client";

import React from "react";
import { WordReveal } from "../motion/MaskReveal";

export function ThreatHeadline({ registerHeadRef, registerWordRef }) {
  return (
    <div ref={registerHeadRef} className="relative z-10 max-w-3xl text-center md:mr-auto md:-translate-y-[2vh] md:pl-[2vw] md:text-left">
      <p className="mb-3 font-[family-name:var(--font-space-mono)] text-[10px] font-bold tracking-[0.28em] text-[#D92C24]">INCIDENT TRACE / 01</p>
      <WordReveal
        text="YOUR CODE HAS A WEAK POINT."
        highlightWords={["WEAK", "POINT"]}
        highlightClass="text-[#D92C24]"
        registerWordRef={registerWordRef}
        className="justify-center md:justify-start font-[family-name:var(--font-anton)] text-[clamp(2.3rem,4.8vw,5.35rem)] leading-[0.9] tracking-[-0.02em] text-[#F2EFE6]"
      />
      <p className="mx-auto mt-4 max-w-xl font-[family-name:var(--font-ibm-plex)] text-[clamp(12px,1vw,14px)] leading-relaxed text-[#77736B] md:mx-0">
        Follow untrusted input across your application before it becomes an exploit.
      </p>
    </div>
  );
}
