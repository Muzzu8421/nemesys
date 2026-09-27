"use client";

import React, { useEffect, useRef } from "react";

/**
 * ThreatSection — 02: YOUR CODE HAS A WEAK POINT.
 *
 * Cinematic dark editorial section with:
 * - Word-by-word masked + blur reveals (GSAP scrub)
 * - Floating code fragments with staggered delay
 * - Diagnostic indicators + red security markings
 * - SVG scan lines, corner brackets
 * - Paper/noise texture overlay
 * - All animations reverse on scroll-back (scrub handles this)
 */

const CODE_FRAGS = [
  { x: "7%",  y: "14%", text: "eval(userInput)",       color: "#D92C24", delay: 0 },
  { x: "78%", y: "20%", text: "exec(cmd)",              color: "#D92C24", delay: 0.15 },
  { x: "4%",  y: "60%", text: "db.query(raw)",          color: "#77736B", delay: 0.05 },
  { x: "82%", y: "55%", text: "fs.readFile(path)",      color: "#77736B", delay: 0.1  },
  { x: "14%", y: "85%", text: "req.params.id",          color: "#D92C24", delay: 0.2  },
  { x: "70%", y: "80%", text: "crypto.createHash()",   color: "#35BFFF", delay: 0.08 },
  { x: "45%", y: "6%",  text: "process.env.SECRET",    color: "#D92C24", delay: 0.12 },
  { x: "58%", y: "90%", text: "Math.random()",          color: "#77736B", delay: 0.18 },
  { x: "30%", y: "32%", text: "JSON.parse(body)",       color: "#77736B", delay: 0.22 },
  { x: "62%", y: "38%", text: "Buffer.from(input)",     color: "#35BFFF", delay: 0.06 },
];

const DIAGNOSTICS = [
  { label: "CVE-2024-0001", value: "CRITICAL", x: "87%", y: "12%", color: "#D92C24" },
  { label: "ENTROPY",        value: "0.002",    x: "2%",  y: "38%", color: "#35BFFF" },
  { label: "TAINT FLOW",     value: "DETECTED", x: "84%", y: "44%", color: "#D92C24" },
  { label: "SCAN DEPTH",     value: "7 LAYERS", x: "2%",  y: "72%", color: "#77736B" },
  { label: "RISK SCORE",     value: "9.8 / 10", x: "86%", y: "72%", color: "#D92C24" },
];

const WORDS = [
  { text: "YOUR",       color: "#F2EFE6" },
  { text: "CODE",       color: "#F2EFE6" },
  { text: "HAS A",      color: "#F2EFE6" },
  { text: "WEAK",       color: "#D92C24" },
  { text: "POINT.",     color: "#D92C24" },
];

export default function ThreatSection() {
  const sectionRef    = useRef(null);
  const wordRefs      = useRef([]);
  const codeRefs      = useRef([]);
  const diagRefs      = useRef([]);
  const hLineRefs     = useRef([]);
  const bgTextRef     = useRef(null);
  const subRef        = useRef(null);
  const annotationRef = useRef(null);
  const labelRef      = useRef(null);
  const accentLineRef = useRef(null);

  useEffect(() => {
    let ctx;
    const init = async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger }  = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        // Helper: create a scrubbed trigger pinned to this section
        const st = (extra = {}) => ({
          trigger: sectionRef.current,
          scrub: 1.2,
          ...extra,
        });

        // ── Section label ─────────────────────────────
        if (labelRef.current) {
          gsap.fromTo(labelRef.current,
            { opacity: 0, y: -12 },
            { opacity: 1, y: 0, scrollTrigger: st({ start: "top 85%", end: "top 65%" }) }
          );
        }

        // ── BG ghost text parallax ────────────────────
        if (bgTextRef.current) {
          gsap.fromTo(bgTextRef.current,
            { y: 80,  opacity: 0   },
            { y: -80, opacity: 0.06, ease: "none",
              scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true } }
          );
        }

        // ── Scan lines ───────────────────────────────
        hLineRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.fromTo(el,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1,
              scrollTrigger: st({ start: `top+=${60 + i * 8}%`, end: `top+=${70 + i * 8}%` }) }
          );
        });

        // ── Word reveals ─────────────────────────────
        WORDS.forEach((_, i) => {
          const el = wordRefs.current[i];
          if (!el) return;
          gsap.fromTo(el,
            { clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", x: -24, opacity: 0 },
            { clipPath: "inset(0 0% 0 0)",   filter: "blur(0px)",  x: 0,   opacity: 1,
              scrollTrigger: st({
                start: `top+=${20 + i * 12}%`,
                end:   `top+=${35 + i * 12}%`,
              }) }
          );
        });

        // ── Accent line under headline ────────────────
        if (accentLineRef.current) {
          gsap.fromTo(accentLineRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "power3.inOut",
              scrollTrigger: st({ start: "top+={78}%", end: "top+={88}%" }) }
          );
        }

        // ── Supporting text ───────────────────────────
        if (subRef.current) {
          gsap.fromTo(subRef.current,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0,
              scrollTrigger: st({ start: "top+={80}%", end: "top+={90}%" }) }
          );
        }

        // ── Annotation ────────────────────────────────
        if (annotationRef.current) {
          gsap.fromTo(annotationRef.current,
            { opacity: 0, rotate: -6, x: 20 },
            { opacity: 1, rotate: -2, x: 0,
              scrollTrigger: st({ start: "top+={85}%", end: "top+={95}%" }) }
          );
        }

        // ── Code fragments ────────────────────────────
        codeRefs.current.forEach((el, i) => {
          if (!el) return;
          const delay = CODE_FRAGS[i]?.delay ?? 0;
          gsap.fromTo(el,
            { opacity: 0, y: 12, filter: "blur(4px)" },
            { opacity: 1, y: 0,  filter: "blur(0px)", delay,
              scrollTrigger: st({ start: "top+={30}%", end: "top+={60}%" }) }
          );
        });

        // ── Diagnostic indicators ─────────────────────
        diagRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.fromTo(el,
            { opacity: 0, x: i % 2 === 0 ? -16 : 16 },
            { opacity: 1, x: 0,
              scrollTrigger: st({ start: "top+={25}%", end: "top+={55}%" }) }
          );
        });

      }, sectionRef);
    };

    init();
    return () => ctx && ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#000000] overflow-hidden flex flex-col items-center justify-center py-28 px-6"
    >
      {/* ── Paper / noise texture ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* ── Ghost BG text ─────────────────────────────── */}
      <div
        ref={bgTextRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[0] select-none opacity-0"
        aria-hidden
      >
        <span
          className="font-[family-name:var(--font-anton)] leading-none"
          style={{
            fontSize: "clamp(160px,28vw,400px)",
            WebkitTextStroke: "1.5px #D92C24",
            WebkitTextFillColor: "transparent",
          }}
        >
          VULN
        </span>
      </div>

      {/* ── Horizontal scan lines ─────────────────────── */}
      {[18, 46, 74].map((top, i) => (
        <div
          key={i}
          ref={(el) => (hLineRefs.current[i] = el)}
          className="absolute left-0 right-0 h-px bg-[#D92C24]/15 pointer-events-none z-[2]"
          style={{ top: `${top}%`, transformOrigin: "left center", transform: "scaleX(0)" }}
        />
      ))}

      {/* ── Left vertical rule ───────────────────────── */}
      <div className="absolute left-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D92C24]/25 to-transparent pointer-events-none z-[2]" />
      {/* Right vertical rule */}
      <div className="absolute right-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#77736B]/15 to-transparent pointer-events-none z-[2]" />

      {/* ── Red corner brackets ───────────────────────── */}
      {[
        "top-10 left-10 border-t-2 border-l-2",
        "top-10 right-10 border-t-2 border-r-2",
        "bottom-10 left-10 border-b-2 border-l-2",
        "bottom-10 right-10 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-8 h-8 border-[#D92C24]/50 pointer-events-none z-[3] ${cls}`} />
      ))}

      {/* ── Floating code fragments ───────────────────── */}
      {CODE_FRAGS.map((frag, i) => (
        <div
          key={i}
          ref={(el) => (codeRefs.current[i] = el)}
          className="absolute pointer-events-none z-[3] opacity-0"
          style={{ left: frag.x, top: frag.y }}
        >
          <span
            className="font-[family-name:var(--font-space-mono)] text-[clamp(8px,0.62vw,10px)] tracking-[0.04em]"
            style={{ color: frag.color, opacity: 0.6 }}
          >
            {frag.text}
          </span>
        </div>
      ))}

      {/* ── Diagnostic indicators ────────────────────── */}
      {DIAGNOSTICS.map((d, i) => (
        <div
          key={i}
          ref={(el) => (diagRefs.current[i] = el)}
          className="absolute pointer-events-none z-[3] opacity-0"
          style={{ left: d.x, top: d.y }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#77736B] uppercase tracking-[0.14em]">
              {d.label}
            </span>
            <span
              className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-[0.08em]"
              style={{ color: d.color }}
            >
              {d.value}
            </span>
          </div>
        </div>
      ))}

      {/* ── Section label ────────────────────────────── */}
      <div
        ref={labelRef}
        className="absolute top-10 left-1/2 -translate-x-1/2 z-[10] opacity-0"
      >
        <span className="font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] uppercase tracking-[0.32em]">
          02 — THE THREAT
        </span>
      </div>

      {/* ── Main Headline ────────────────────────────── */}
      <div className="relative z-[10] w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Word-by-word reveal grid */}
        <div className="flex flex-wrap justify-center gap-x-[clamp(12px,2.5vw,32px)] gap-y-2 mb-4">
          {WORDS.map((word, i) => (
            <div
              key={i}
              ref={(el) => (wordRefs.current[i] = el)}
              className="overflow-visible"
              style={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
            >
              <span
                className="font-[family-name:var(--font-anton)] font-normal uppercase leading-[0.88] tracking-[-0.025em] block"
                style={{
                  fontSize: "clamp(3.8rem,9vw,11rem)",
                  color: word.color,
                }}
              >
                {word.text}
              </span>
            </div>
          ))}
        </div>

        {/* Accent line */}
        <div
          ref={accentLineRef}
          className="w-full max-w-2xl h-px mb-10"
          style={{
            background: "linear-gradient(to right, transparent, #D92C24, #D92C24 60%, transparent)",
            transformOrigin: "left center",
            transform: "scaleX(0)",
          }}
        />

        {/* Supporting text */}
        <div ref={subRef} className="opacity-0 max-w-2xl mx-auto">
          <p className="font-[family-name:var(--font-ibm-plex)] text-[clamp(12px,1vw,14px)] text-[#77736B] leading-[1.8] uppercase tracking-[0.06em]">
            Traditional security scans catch surface-level issues.<br />
            NEMESYS performs deep taint-flow analysis — tracing how untrusted<br />
            data moves through your entire codebase, layer by layer.
          </p>
        </div>

        {/* Annotation */}
        <div ref={annotationRef} className="mt-8 opacity-0 flex items-center gap-4">
          <div className="w-10 h-px bg-[#D92C24]" />
          <span className="font-[family-name:var(--font-caveat)] text-[1.4rem] text-[#D92C24] -rotate-2 inline-block">
            every line. every path. every risk.
          </span>
          <div className="w-10 h-px bg-[#D92C24]" />
        </div>
      </div>

      {/* ── Bottom gradient into next section ────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[5] bg-gradient-to-b from-transparent to-[#050505]" />
    </section>
  );
}
