"use client";

import React, { useEffect, useRef } from "react";

/**
 * WhyNemesysSection — 03: MODERN CODE MOVES FAST. SECURITY CAN'T BE AN AFTERTHOUGHT.
 *
 * Cinematic editorial layout:
 * - Char-level reveal for headline 1
 * - Word-masked reveal for headline 2
 * - Stats composition with border-left architecture
 * - Depth BG words parallax
 * - Technical annotation grid panel
 * - All via GSAP + ScrollTrigger scrub
 */

const STATS = [
  { number: "68%",    label: "of breaches involve\nhuman error in code"  },
  { number: "26 days",label: "average time to\ndetect a vulnerability"   },
  { number: "$4.9M",  label: "average cost of\na data breach (2024)"    },
];

const BG_WORDS = [
  { text: "INJECTION", x:  "3%", y: "22%", size: "clamp(55px,8vw,110px)" },
  { text: "XSS",       x: "72%", y:  "8%", size: "clamp(45px,7vw,95px)"  },
  { text: "SQLI",      x: "58%", y: "72%", size: "clamp(40px,6vw,80px)"  },
  { text: "RCE",       x: "18%", y: "78%", size: "clamp(50px,7vw,90px)"  },
  { text: "CSRF",      x: "40%", y: "88%", size: "clamp(35px,5vw,70px)"  },
];

const H1_TEXT = "MODERN CODE MOVES FAST.";
const H2_WORDS = "SECURITY CAN'T BE AN AFTERTHOUGHT.".split(" ");

export default function WhyNemesysSection() {
  const sectionRef   = useRef(null);
  const charRefs     = useRef([]);
  const h2WordRefs   = useRef([]);
  const accentRef    = useRef(null);
  const divider2Ref  = useRef(null);
  const bodyRef      = useRef(null);
  const statsRefs    = useRef([]);
  const gridRef      = useRef(null);
  const bgWordRefs   = useRef([]);
  const annoRef      = useRef(null);
  const labelRef     = useRef(null);

  useEffect(() => {
    let ctx;
    const init = async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger }  = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const st = (extra = {}) => ({
        trigger: sectionRef.current,
        scrub: 1.2,
        ...extra,
      });

      ctx = gsap.context(() => {

        // ── Section label ─────────────────────────────
        if (labelRef.current) {
          gsap.fromTo(labelRef.current,
            { opacity: 0, y: -12 },
            { opacity: 1,  y:   0,
              scrollTrigger: st({ start: "top 80%", end: "top 60%" }) }
          );
        }

        // ── BG depth words — parallax ─────────────────
        bgWordRefs.current.forEach((el, i) => {
          if (!el) return;
          const dir = i % 2 === 0 ? 1 : -1;
          gsap.fromTo(el,
            { y: 50 * dir, opacity: 0   },
            { y: -50 * dir, opacity: 0.05, ease: "none",
              scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true } }
          );
        });

        // ── Headline 1 — char reveals ─────────────────
        const chars = charRefs.current.filter(Boolean);
        if (chars.length) {
          gsap.fromTo(chars,
            { opacity: 0, y: 50, filter: "blur(8px)", rotateX: -60 },
            {
              opacity: 1, y: 0, filter: "blur(0px)", rotateX: 0,
              stagger: 0.025, ease: "power3.out",
              scrollTrigger: st({ start: "top 70%", end: "top 35%" }),
            }
          );
        }

        // ── Accent line ───────────────────────────────
        if (accentRef.current) {
          gsap.fromTo(accentRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "power3.inOut",
              scrollTrigger: st({ start: "top+={38}%", end: "top+={48}%" }) }
          );
        }

        // ── Headline 2 — word masked reveals ─────────
        h2WordRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.fromTo(el,
            { clipPath: "inset(0 100% 0 0)", x: -14 },
            { clipPath: "inset(0 0% 0 0)",   x: 0,
              scrollTrigger: st({
                start: `top+=${42 + i * 3.5}%`,
                end:   `top+=${55 + i * 3.5}%`,
              }) }
          );
        });

        // ── Divider 2 ─────────────────────────────────
        if (divider2Ref.current) {
          gsap.fromTo(divider2Ref.current,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1,
              scrollTrigger: st({ start: "top+={60}%", end: "top+={68}%" }) }
          );
        }

        // ── Body copy ─────────────────────────────────
        if (bodyRef.current) {
          gsap.fromTo(bodyRef.current,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0,
              scrollTrigger: st({ start: "top+={63}%", end: "top+={73}%" }) }
          );
        }

        // ── Annotation ────────────────────────────────
        if (annoRef.current) {
          gsap.fromTo(annoRef.current,
            { opacity: 0, rotate: -8, x: 16 },
            { opacity: 1, rotate: -3, x: 0,
              scrollTrigger: st({ start: "top+={72}%", end: "top+={82}%" }) }
          );
        }

        // ── Stats ─────────────────────────────────────
        statsRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.fromTo(el,
            { opacity: 0, x: -32, scale: 0.94 },
            { opacity: 1, x: 0,   scale: 1,
              scrollTrigger: st({
                start: `top+=${65 + i * 8}%`,
                end:   `top+=${75 + i * 8}%`,
              }) }
          );
        });

        // ── Technical grid panel ──────────────────────
        if (gridRef.current) {
          gsap.fromTo(gridRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0,
              scrollTrigger: st({ start: "top+={85}%", end: "top+={95}%" }) }
          );
        }

      }, sectionRef);
    };

    init();
    return () => ctx && ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#050505] overflow-hidden flex flex-col items-start justify-center py-28 px-[clamp(20px,5vw,80px)]"
    >
      {/* ── Noise texture ──────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* ── BG depth words ─────────────────────────────── */}
      {BG_WORDS.map((w, i) => (
        <div
          key={i}
          ref={(el) => (bgWordRefs.current[i] = el)}
          className="absolute pointer-events-none z-[0] select-none opacity-0"
          style={{ left: w.x, top: w.y }}
        >
          <span
            className="font-[family-name:var(--font-anton)] leading-none uppercase"
            style={{
              fontSize: w.size,
              WebkitTextStroke: "1px #D92C24",
              WebkitTextFillColor: "transparent",
            }}
          >
            {w.text}
          </span>
        </div>
      ))}

      {/* ── Left vertical rule ─────────────────────────── */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#D92C24]/60 via-[#D92C24]/20 to-transparent pointer-events-none z-[3]" />

      {/* ── Section label ──────────────────────────────── */}
      <div
        ref={labelRef}
        className="absolute top-10 left-1/2 -translate-x-1/2 z-[10] opacity-0"
      >
        <span className="font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] uppercase tracking-[0.32em]">
          03 — WHY NEMESYS
        </span>
      </div>

      {/* ── Main content ───────────────────────────────── */}
      <div className="relative z-[10] w-full max-w-7xl mx-auto flex flex-col gap-6">

        {/* Headline 1 — char-level reveal */}
        <div className="overflow-hidden" style={{ perspective: "800px" }}>
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2.8rem,7vw,9rem)] text-[#F2EFE6] uppercase leading-[0.86] tracking-[-0.02em]">
            {H1_TEXT.split("").map((char, i) => (
              <span
                key={i}
                ref={(el) => (charRefs.current[i] = el)}
                className="inline-block"
                style={{ opacity: 0 }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h2>
        </div>

        {/* Accent line */}
        <div
          ref={accentRef}
          className="w-full h-px"
          style={{
            background: "linear-gradient(to right, #D92C24, #D92C24 55%, rgba(217,44,36,0.1) 100%)",
            transformOrigin: "left center",
            transform: "scaleX(0)",
          }}
        />

        {/* Headline 2 */}
        <div className="overflow-hidden flex flex-wrap gap-x-[0.25em] gap-y-1">
          {H2_WORDS.map((word, i) => (
            <span
              key={i}
              ref={(el) => (h2WordRefs.current[i] = el)}
              className="font-[family-name:var(--font-anton)] inline-block uppercase leading-[0.9] tracking-[-0.015em]"
              style={{
                fontSize: "clamp(1.8rem,4.5vw,6rem)",
                color: i >= 5 ? "#D92C24" : "#77736B",
                clipPath: "inset(0 100% 0 0)",
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div
          ref={divider2Ref}
          className="w-2/3 h-px bg-[#77736B]/25"
          style={{ transformOrigin: "left center", transform: "scaleX(0)", opacity: 0 }}
        />

        {/* Two-column layout: body left, stats right */}
        <div className="flex flex-col lg:flex-row gap-16 mt-2">

          {/* Left — body + annotation */}
          <div className="flex-1 max-w-xl">
            <div ref={bodyRef} className="opacity-0">
              <p className="font-[family-name:var(--font-ibm-plex)] text-[clamp(13px,1.1vw,15px)] text-[#77736B] leading-[1.8] tracking-[0.01em]">
                Modern development cycles ship code in hours. Security reviews
                that take weeks don&apos;t scale.{" "}
                <span className="text-[#F2EFE6]">
                  NEMESYS integrates directly into your workflow
                </span>{" "}
                — running deep static analysis and taint-flow tracing at the
                speed of your CI/CD pipeline.
              </p>
              <p className="font-[family-name:var(--font-ibm-plex)] text-[clamp(13px,1.1vw,15px)] text-[#77736B] leading-[1.8] tracking-[0.01em] mt-4">
                Not a linter. Not a surface scanner. A full{" "}
                <span className="text-[#D92C24]">code-path intelligence engine</span>{" "}
                that understands how data flows, mutates, and reaches critical
                system calls.
              </p>
            </div>

            {/* Handwritten annotation */}
            <div ref={annoRef} className="mt-8 opacity-0">
              <span className="font-[family-name:var(--font-caveat)] text-[1.5rem] text-[#D92C24] -rotate-2 inline-block leading-[1.3]">
                built for developers,<br />not just security teams.
              </span>
            </div>
          </div>

          {/* Right — stats + technical grid */}
          <div className="flex-1 flex flex-col gap-5">
            {STATS.map((stat, i) => (
              <div
                key={i}
                ref={(el) => (statsRefs.current[i] = el)}
                className="relative border-l-2 border-[#D92C24]/30 pl-5 py-1 opacity-0"
              >
                {/* Red marker dot */}
                <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D92C24]" />
                <div className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,4.5vw,4rem)] text-[#F2EFE6] leading-none tracking-[-0.02em]">
                  {stat.number}
                </div>
                <div className="font-[family-name:var(--font-space-mono)] text-[0.68rem] text-[#77736B] uppercase tracking-[0.1em] leading-[1.7] mt-0.5 whitespace-pre-line">
                  {stat.label}
                </div>
                {/* Connector to next */}
                {i < STATS.length - 1 && (
                  <div className="absolute left-[-1px] top-full w-px h-5 bg-gradient-to-b from-[#D92C24]/30 to-transparent" />
                )}
              </div>
            ))}

            {/* Technical annotation grid */}
            <div ref={gridRef} className="relative mt-2 border border-[#77736B]/18 p-4 opacity-0">
              <div className="absolute -top-2.5 left-4 bg-[#050505] px-2">
                <span className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#35BFFF] uppercase tracking-[0.22em]">
                  ANALYSIS DEPTH
                </span>
              </div>
              <div className="font-[family-name:var(--font-space-mono)] text-[10px] text-[#77736B] leading-[2.4] tracking-[0.04em]">
                {[
                  ["TAINT PROPAGATION",  "7 LEVELS",  "#F2EFE6"],
                  ["CALL GRAPH DEPTH",   "∞",          "#F2EFE6"],
                  ["INTER-PROCEDURAL",   "ENABLED",    "#35BFFF"],
                  ["FALSE POSITIVE RATE","< 2%",       "#D92C24"],
                ].map(([k, v, vc]) => (
                  <div key={k} className="flex justify-between border-b border-[#77736B]/10 last:border-0 pb-0.5 last:pb-0">
                    <span>{k}</span>
                    <span style={{ color: vc }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom gradient ────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none z-[5] bg-gradient-to-b from-transparent to-[#050505]" />
    </section>
  );
}
