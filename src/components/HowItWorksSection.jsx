"use client";

import React, { useEffect, useRef } from "react";

/**
 * HowItWorksSection — 04: INPUT → TRACE → DETECT → FIX
 *
 * One continuous pinned composition that reveals each stage sequentially.
 * Architecture:
 * - Section is 600vh tall
 * - Inner panel is GSAP-pinned for 600vh of scroll
 * - Stages 0-3 reveal progressively via GSAP timeline scrubbed to scroll
 * - Connecting path SVGs animate via strokeDashoffset
 * - FIX stage gets a radial glow treatment as climax
 */

const STAGES = [
  {
    id: "INPUT",
    num: "01",
    title: "INPUT",
    sub: "Code Ingestion",
    desc: "Your repository, API endpoint, or CI/CD pipeline feeds directly into NEMESYS. We accept JS, TS, Python, Go, Rust, and more.",
    code: `// Source ingested\nconst scan = nemesys.load({\n  source: "./src",\n  lang:   "typescript",\n  depth:  "full"\n});`,
    note: "zero config required",
    titleColor: "#F2EFE6",
    accentColor: "#35BFFF",
  },
  {
    id: "TRACE",
    num: "02",
    title: "TRACE",
    sub: "Taint Flow Mapping",
    desc: "Full control-flow graph construction. Every path that user-controlled data can travel is mapped — across functions, modules, async boundaries.",
    code: `// CFG ready\ngraph.nodes: 4,821\ngraph.edges: 12,034\ntaintSources: 47\npropagation: ACTIVE`,
    note: "every data path mapped",
    titleColor: "#F2EFE6",
    accentColor: "#77736B",
  },
  {
    id: "DETECT",
    num: "03",
    title: "DETECT",
    sub: "Vulnerability Discovery",
    desc: "NEMESYS identifies exactly where tainted data reaches critical sinks — DB queries, shell executions, file reads — flagging exploitable paths.",
    code: `[CRITICAL] SQL Injection\n  src/api/users.ts:89\n  req.query.id → db.raw()\n\n[HIGH] Path Traversal\n  src/files/reader.ts:34\n  req.body.path → fs.read()`,
    note: "near-zero false positives",
    titleColor: "#D92C24",
    accentColor: "#D92C24",
    isAlert: true,
  },
  {
    id: "FIX",
    num: "04",
    title: "FIX",
    sub: "AI-Powered Remediation",
    desc: "Context-aware patches — not generic suggestions. Each fix is validated against the full call graph before being recommended.",
    code: `// AI Patch — Validated ✓\n- db.raw(req.query.id)\n+ db.prepare(\n+   "SELECT * FROM users WHERE id = ?"\n+ ).run(sanitize(req.query.id))\n\n// Taint path: CLOSED`,
    note: "production-ready patches",
    titleColor: "#F2EFE6",
    accentColor: "#35BFFF",
    isFinal: true,
  },
];

export default function HowItWorksSection() {
  const wrapRef     = useRef(null);   // outer scroll container
  const panelRef    = useRef(null);   // inner sticky panel
  const stageEls    = useRef([]);     // per-stage wrapper divs
  const titleEls    = useRef([]);
  const numEls      = useRef([]);
  const descEls     = useRef([]);
  const codeEls     = useRef([]);
  const noteEls     = useRef([]);
  const ctaRef      = useRef(null);
  const pathRefs    = useRef([]);     // SVG connector paths
  const labelRef    = useRef(null);
  const axisRef     = useRef(null);
  const glowRef     = useRef(null);

  useEffect(() => {
    let ctx;
    const init = async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger }  = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {

        // Common scrub trigger anchored to the outer wrapper
        const makeSt = (startPct, endPct) => ({
          trigger:   wrapRef.current,
          start:     `top+=${startPct}% top`,
          end:       `top+=${endPct}% top`,
          scrub:     1.4,
        });

        // ── Section label ────────────────────────────
        if (labelRef.current) {
          gsap.fromTo(labelRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, scrollTrigger: makeSt(0, 5) }
          );
        }

        // ── Bottom axis line ──────────────────────────
        if (axisRef.current) {
          gsap.fromTo(axisRef.current,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, ease: "power2.inOut", scrollTrigger: makeSt(85, 95) }
          );
        }

        // ── FIX stage glow ────────────────────────────
        if (glowRef.current) {
          gsap.fromTo(glowRef.current,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1.1, ease: "power2.out", scrollTrigger: makeSt(78, 90) }
          );
        }

        // ── Per-stage reveals ─────────────────────────
        // 4 stages spread over 80% of the 600vh scroll (each gets ~20%)
        STAGES.forEach((stage, i) => {
          const base  = 5 + i * 20;   // 5, 25, 45, 65
          const span  = 16;

          if (numEls.current[i]) {
            gsap.fromTo(numEls.current[i],
              { opacity: 0, x: -30 },
              { opacity: 1, x: 0, scrollTrigger: makeSt(base, base + span * 0.3) }
            );
          }

          if (titleEls.current[i]) {
            gsap.fromTo(titleEls.current[i],
              { clipPath: "inset(0 100% 0 0)", x: -16 },
              { clipPath: "inset(0 0% 0 0)", x: 0,
                scrollTrigger: makeSt(base + span * 0.1, base + span * 0.55) }
            );
          }

          if (descEls.current[i]) {
            gsap.fromTo(descEls.current[i],
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, scrollTrigger: makeSt(base + span * 0.3, base + span * 0.7) }
            );
          }

          if (codeEls.current[i]) {
            gsap.fromTo(codeEls.current[i],
              { opacity: 0, y: 24, filter: "blur(6px)" },
              { opacity: 1, y: 0, filter: "blur(0px)",
                scrollTrigger: makeSt(base + span * 0.5, base + span * 0.9) }
            );
          }

          if (noteEls.current[i]) {
            gsap.fromTo(noteEls.current[i],
              { opacity: 0, rotate: -8 },
              { opacity: 1, rotate: -2,
                scrollTrigger: makeSt(base + span * 0.7, base + span) }
            );
          }

          // SVG connector path (between stage i and i+1)
          if (i < STAGES.length - 1 && pathRefs.current[i]) {
            const path = pathRefs.current[i];
            // We approximate stroke length — set in effect
            gsap.set(path, { attr: { "stroke-dasharray": 220, "stroke-dashoffset": 220 } });
            gsap.to(path, {
              attr: { "stroke-dashoffset": 0 },
              ease: "power2.inOut",
              scrollTrigger: makeSt(base + span * 0.85, base + span + 4),
            });
          }
        });

        // ── CTA reveal ────────────────────────────────
        if (ctaRef.current) {
          gsap.fromTo(ctaRef.current,
            { opacity: 0, y: 16, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1,
              scrollTrigger: makeSt(82, 92) }
          );
        }

      }, wrapRef);
    };

    init();
    return () => ctx && ctx.revert();
  }, []);

  return (
    /* ── Outer scroll container: 600vh ───────────────── */
    <div ref={wrapRef} className="relative" style={{ height: "600vh" }}>

      {/* ── Sticky panel ──────────────────────────────── */}
      <div
        ref={panelRef}
        className="sticky top-0 h-screen w-full bg-[#050505] overflow-hidden flex flex-col"
      >
        {/* Paper noise */}
        <div
          className="absolute inset-0 pointer-events-none z-[1] opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />

        {/* Left vertical axis */}
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#77736B]/18 to-transparent z-[2]" />

        {/* Section label */}
        <div ref={labelRef} className="absolute top-9 left-1/2 -translate-x-1/2 z-[10] opacity-0">
          <span className="font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] uppercase tracking-[0.32em]">
            04 — HOW IT WORKS
          </span>
        </div>

        {/* FIX stage ambient glow */}
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none z-[0] opacity-0"
          style={{
            background: "radial-gradient(ellipse 50% 60% at 85% 50%, rgba(53,191,255,0.06) 0%, transparent 70%)",
          }}
        />

        {/* ── Main grid ──────────────────────────────── */}
        <div className="relative z-[10] flex-1 flex flex-col justify-center px-[clamp(20px,5vw,80px)] py-20">

          {/* SVG overlay for connecting paths */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
            aria-hidden
            style={{ overflow: "visible" }}
          >
            {/* Horizontal connectors between stages */}
            {[0, 1, 2].map((i) => (
              <line
                key={i}
                ref={(el) => (pathRefs.current[i] = el)}
                /* positions are approximate — JS can't measure before mount */
                x1={`${12.5 + i * 25}%`} y1="45%"
                x2={`${25 + i * 25}%`}   y2="45%"
                stroke={i === 2 ? "#D92C24" : "#77736B"}
                strokeWidth="1"
                strokeOpacity="0.45"
                strokeDasharray="220"
                strokeDashoffset="220"
              />
            ))}
          </svg>

          {/* 4-column stage grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 w-full max-w-7xl mx-auto">
            {STAGES.map((stage, i) => (
              <div
                key={stage.id}
                ref={(el) => (stageEls.current[i] = el)}
                className="relative"
              >
                {/* BG glow per stage */}
                <div
                  className="absolute -inset-3 rounded pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 30% 40%, ${stage.accentColor}10 0%, transparent 70%)`,
                  }}
                />

                {/* Stage number */}
                <div
                  ref={(el) => (numEls.current[i] = el)}
                  className="mb-2 opacity-0"
                >
                  <span
                    className="font-[family-name:var(--font-space-mono)] text-[0.6rem] uppercase tracking-[0.22em]"
                    style={{ color: stage.accentColor }}
                  >
                    {stage.num}
                  </span>
                </div>

                {/* Stage title */}
                <div
                  ref={(el) => (titleEls.current[i] = el)}
                  className="mb-2 overflow-hidden"
                  style={{ clipPath: "inset(0 100% 0 0)" }}
                >
                  <h3
                    className="font-[family-name:var(--font-anton)] uppercase leading-none tracking-[-0.02em]"
                    style={{
                      fontSize: stage.isFinal
                        ? "clamp(3.5rem,6vw,7rem)"
                        : "clamp(2.8rem,5vw,5.5rem)",
                      color: stage.titleColor,
                      textShadow: stage.isFinal
                        ? "0 0 40px rgba(53,191,255,0.25)"
                        : "none",
                    }}
                  >
                    {stage.title}
                  </h3>
                  <p
                    className="font-[family-name:var(--font-space-mono)] text-[0.65rem] uppercase tracking-[0.14em] mt-1"
                    style={{ color: stage.accentColor, opacity: 0.75 }}
                  >
                    {stage.sub}
                  </p>
                </div>

                {/* Arrow connector */}
                {i < STAGES.length - 1 && (
                  <div
                    className="absolute -right-4 top-10 hidden lg:flex items-center z-[6]"
                    aria-hidden
                  >
                    <div
                      className="w-6 h-px"
                      style={{ background: i === 2 ? "#D92C24" : "#77736B", opacity: 0.45 }}
                    />
                    <div
                      className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent"
                      style={{ borderLeftColor: i === 2 ? "#D92C24" : "#77736B", opacity: 0.45 }}
                    />
                  </div>
                )}

                {/* Description */}
                <p
                  ref={(el) => (descEls.current[i] = el)}
                  className="font-[family-name:var(--font-ibm-plex)] text-[clamp(10px,0.8vw,12px)] text-[#77736B] leading-[1.75] mb-3 opacity-0"
                >
                  {stage.desc}
                </p>

                {/* Code block */}
                <div
                  ref={(el) => (codeEls.current[i] = el)}
                  className="relative opacity-0 mb-3"
                >
                  {stage.isAlert && (
                    <div className="absolute -top-2.5 right-0 z-10">
                      <span className="font-[family-name:var(--font-space-mono)] text-[8px] bg-[#D92C24] text-white px-1.5 py-0.5 uppercase tracking-[0.1em]">
                        ⚠ ALERT
                      </span>
                    </div>
                  )}
                  {stage.isFinal && (
                    <div className="absolute -top-2.5 right-0 z-10">
                      <span className="font-[family-name:var(--font-space-mono)] text-[8px] bg-[#35BFFF] text-black px-1.5 py-0.5 uppercase tracking-[0.1em]">
                        ✓ RESOLVED
                      </span>
                    </div>
                  )}
                  <pre
                    className="font-[family-name:var(--font-space-mono)] leading-[1.9] p-3 overflow-x-auto border"
                    style={{
                      fontSize: "clamp(8px,0.62vw,10px)",
                      color:       stage.isAlert ? "#D92C24" : stage.isFinal ? "#35BFFF" : "#77736B",
                      borderColor: stage.isAlert
                        ? "rgba(217,44,36,0.35)"
                        : stage.isFinal
                        ? "rgba(53,191,255,0.28)"
                        : "rgba(119,115,107,0.18)",
                      background:  stage.isAlert
                        ? "rgba(217,44,36,0.04)"
                        : stage.isFinal
                        ? "rgba(53,191,255,0.04)"
                        : "rgba(255,255,255,0.015)",
                    }}
                  >
                    <code>{stage.code}</code>
                  </pre>
                </div>

                {/* Handwritten annotation */}
                <div
                  ref={(el) => (noteEls.current[i] = el)}
                  className="opacity-0"
                >
                  <span
                    className="font-[family-name:var(--font-caveat)] text-[1.1rem] inline-block"
                    style={{ color: stage.accentColor, opacity: 0.75 }}
                  >
                    ↗ {stage.note}
                  </span>
                </div>

                {/* FIX stage CTA */}
                {stage.isFinal && (
                  <div ref={ctaRef} className="mt-5 opacity-0">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-[#35BFFF]/12 blur-md" />
                      <a
                        href="#"
                        className="relative inline-flex items-center gap-2 px-5 py-2.5 border border-[#35BFFF]/45 font-[family-name:var(--font-space-mono)] text-[0.72rem] text-[#35BFFF] uppercase tracking-[0.1em] hover:bg-[#35BFFF]/10 transition-colors"
                      >
                        Start Scanning Free →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom pipeline axis */}
          <div className="mt-14 w-full max-w-7xl mx-auto relative">
            <div
              ref={axisRef}
              className="w-full h-px"
              style={{
                background: "linear-gradient(to right, transparent, rgba(119,115,107,0.3), transparent)",
                transformOrigin: "left center",
                transform: "scaleX(0)",
                opacity: 0,
              }}
            />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 mt-px">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D92C24]" />
              <span className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#77736B] uppercase tracking-[0.22em]">
                ANALYSIS COMPLETE
              </span>
            </div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-[5] bg-gradient-to-b from-transparent to-[#000000]" />
      </div>
    </div>
  );
}
