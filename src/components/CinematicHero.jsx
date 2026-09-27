"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Total frames extracted from bg.mp4 into public/frames/
 * frame-0001.webp through frame-0227.webp
 */
const TOTAL_FRAMES = 227;

const inkBleedWhite = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E"), linear-gradient(#F2EFE6, #F2EFE6)`,
  backgroundBlendMode: "multiply",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const inkBleedRed = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.25'/%3E%3C/svg%3E"), linear-gradient(#D92C24, #D92C24)`,
  backgroundBlendMode: "multiply",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

// Section 02 constants
const THREAT_CODE_FRAGS = [
  { x: "7%",  y: "14%", text: "eval(userInput)",       color: "#D92C24", delay: 0 },
  { x: "78%", y: "20%", text: "exec(cmd)",              color: "#D92C24", delay: 0.15 },
  { x: "4%",  y: "60%", text: "db.query(raw)",          color: "#77736B", delay: 0.05 },
  { x: "82%", y: "55%", text: "fs.readFile(path)",      color: "#77736B", delay: 0.1  },
  { x: "14%", y: "85%", text: "req.params.id",          color: "#D92C24", delay: 0.2  },
  { x: "70%", y: "80%", text: "crypto.createHash()",   color: "#35BFFF", delay: 0.08 },
  { x: "45%", y: "6%",  text: "process.env.SECRET",    color: "#D92C24", delay: 0.12 },
  { x: "58%", y: "90%", text: "Math.random()",          color: "#77736B", delay: 0.18 },
];

const THREAT_DIAGNOSTICS = [
  { label: "CVE-2024-0001", value: "CRITICAL", x: "87%", y: "12%", color: "#D92C24" },
  { label: "ENTROPY",        value: "0.002",    x: "2%",  y: "38%", color: "#35BFFF" },
  { label: "TAINT FLOW",     value: "DETECTED", x: "84%", y: "44%", color: "#D92C24" },
  { label: "SCAN DEPTH",     value: "7 LAYERS", x: "2%",  y: "72%", color: "#77736B" },
  { label: "RISK SCORE",     value: "9.8 / 10", x: "86%", y: "72%", color: "#D92C24" },
];

const THREAT_WORDS = [
  { text: "YOUR",       color: "#F2EFE6" },
  { text: "CODE",       color: "#F2EFE6" },
  { text: "HAS A",      color: "#F2EFE6" },
  { text: "WEAK",       color: "#D92C24" },
  { text: "POINT.",     color: "#D92C24" },
];

// Section 03 constants
const WHY_STATS = [
  { number: "68%",    label: "of breaches involve\nhuman error in code" },
  { number: "26 days",label: "average time to\ndetect a vulnerability"  },
  { number: "$4.9M",  label: "average cost of\na data breach (2024)"   },
];

const WHY_BG_WORDS = [
  { text: "INJECTION", x:  "3%", y: "22%", size: "clamp(55px,8vw,110px)" },
  { text: "XSS",       x: "72%", y:  "8%", size: "clamp(45px,7vw,95px)"  },
  { text: "SQLI",      x: "58%", y: "72%", size: "clamp(40px,6vw,80px)"  },
  { text: "RCE",       x: "18%", y: "78%", size: "clamp(50px,7vw,90px)"  },
];

// Section 04 constants
const HOW_STAGES = [
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

export default function CinematicHero() {
  const outerWrapperRef = useRef(null);
  const pinnedStageRef  = useRef(null);
  const heroCardRef     = useRef(null);
  const canvasRef       = useRef(null);

  // Section 01 Refs
  const heroUIRef       = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Section 02 Refs
  const threatRef       = useRef(null);
  const threatWordRefs  = useRef([]);
  const threatCodeRefs  = useRef([]);
  const threatDiagRefs  = useRef([]);
  const threatScanLines = useRef([]);

  // Section 03 Refs
  const whyRef          = useRef(null);
  const whyCharRefs     = useRef([]);
  const whyH2WordRefs   = useRef([]);
  const whyStatsRefs    = useRef([]);
  const whyGridRef      = useRef(null);

  // Section 04 Refs
  const howRef          = useRef(null);
  const howStageEls     = useRef([]);
  const howConnectorEls = useRef([]);
  const howCtaRef       = useRef(null);

  useEffect(() => {
    let gsap, ScrollTrigger, masterTimeline;
    let animFrameId;
    let isCleanedUp = false;

    // ── 1. FRAME SEQUENCE PRELOADING & CANVAS RENDERER ──────────
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const images = new Array(TOTAL_FRAMES);
    let lastDrawnFrame = -1;
    const playhead = { frame: 0 };

    const getFrameUrl = (index) => {
      const num = String(index + 1).padStart(4, "0");
      return `/frames/frame-${num}.webp`;
    };

    // Render frame to canvas with 16:9 aspect ratio cover
    const renderFrame = (targetFrame) => {
      if (!ctx || !canvas) return;
      const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(targetFrame)));
      
      // Look for current or closest loaded frame
      let img = images[idx];
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let r = 1; r < 30; r++) {
          const prev = images[idx - r];
          if (prev && prev.complete && prev.naturalWidth > 0) { img = prev; break; }
          const next = images[idx + r];
          if (next && next.complete && next.naturalWidth > 0) { img = next; break; }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cW = canvas.width;
      const cH = canvas.height;
      if (cW === 0 || cH === 0) return;

      const imgW = img.naturalWidth || 1920;
      const imgH = img.naturalHeight || 1080;
      const cRatio = cW / cH;
      const imgRatio = imgW / imgH;

      let dW, dH, oX = 0, oY = 0;
      if (cRatio > imgRatio) {
        dW = cW;
        dH = cW / imgRatio;
        oY = (cH - dH) / 2;
      } else {
        dH = cH;
        dW = cH * imgRatio;
        oX = (cW - dW) / 2;
      }

      ctx.clearRect(0, 0, cW, cH);
      ctx.drawImage(img, oX, oY, dW, dH);
      lastDrawnFrame = idx;
    };

    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      renderFrame(playhead.frame);
    };

    // Preloading strategy:
    // Frame 0 loaded immediately for instant Hero render
    const initialImg = new window.Image();
    initialImg.src = getFrameUrl(0);
    images[0] = initialImg;
    initialImg.onload = () => {
      if (!isCleanedUp) {
        resizeCanvas();
        renderFrame(0);
      }
    };

    // Progressive background frame loader
    const preloadAllFrames = () => {
      // Step 1: Preload next 20 frames immediately
      for (let i = 1; i < Math.min(25, TOTAL_FRAMES); i++) {
        const img = new window.Image();
        img.src = getFrameUrl(i);
        images[i] = img;
      }

      // Step 2: Sample every 4th frame for quick scrubbing coverage
      for (let i = 25; i < TOTAL_FRAMES; i += 4) {
        const img = new window.Image();
        img.src = getFrameUrl(i);
        images[i] = img;
      }

      // Step 3: Fill in all remaining frames
      for (let i = 25; i < TOTAL_FRAMES; i++) {
        if (!images[i]) {
          const img = new window.Image();
          img.src = getFrameUrl(i);
          images[i] = img;
        }
      }
    };

    if (typeof window !== "undefined") {
      setTimeout(preloadAllFrames, 200);
      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
    }

    // RAF render loop decoupled from scroll
    const rafLoop = () => {
      if (Math.round(playhead.frame) !== lastDrawnFrame) {
        renderFrame(playhead.frame);
      }
      animFrameId = requestAnimationFrame(rafLoop);
    };
    animFrameId = requestAnimationFrame(rafLoop);

    // ── 2. MASTER GSAP SCROLLTRIGGER TIMELINE ───────────────────
    const initGSAP = async () => {
      const { default: _gsap } = await import("gsap");
      const { ScrollTrigger: _ST } = await import("gsap/ScrollTrigger");
      gsap = _gsap;
      ScrollTrigger = _ST;
      gsap.registerPlugin(ScrollTrigger);

      if (!outerWrapperRef.current || !pinnedStageRef.current) return;

      // Master Timeline setup: 0 to 100 timeline units
      masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: outerWrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: pinnedStageRef.current,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // ── A. FRAME SEQUENCE PROGRESSION (0 to 82) ───────────────
      // Frames scrub from 0 to 226 up until t=82. From t=82 to 100, holds final frame 226.
      masterTimeline.to(playhead, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        duration: 82,
      }, 0);

      // ── B. SECTION 01 — HERO UI (0 to 20) ────────────────────
      // Visible from t=0. Fades out between 14 and 20.
      masterTimeline.to(heroUIRef.current, {
        opacity: 0,
        y: -30,
        ease: "power2.inOut",
        duration: 6,
      }, 14);
      masterTimeline.set(heroUIRef.current, { pointerEvents: "none" }, 18);

      // ── C. SECTION 02 — THE THREAT (20 to 42) ─────────────────
      masterTimeline.set(threatRef.current, { display: "flex", pointerEvents: "auto" }, 19);
      masterTimeline.fromTo(threatRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, ease: "power2.out", duration: 5 },
        20
      );

      // Word reveals for "YOUR CODE HAS A WEAK POINT."
      threatWordRefs.current.forEach((el, i) => {
        if (!el) return;
        masterTimeline.fromTo(el,
          { clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", x: -20, opacity: 0 },
          { clipPath: "inset(0 0% 0 0)",   filter: "blur(0px)",  x: 0,   opacity: 1, ease: "power3.out", duration: 3.5 },
          21 + i * 2.2
        );
      });

      // Diagnostics & code frags
      threatDiagRefs.current.forEach((el, i) => {
        if (!el) return;
        masterTimeline.fromTo(el,
          { opacity: 0, x: i % 2 === 0 ? -15 : 15 },
          { opacity: 1, x: 0, ease: "power2.out", duration: 3 },
          23 + i * 1.5
        );
      });

      threatCodeRefs.current.forEach((el, i) => {
        if (!el) return;
        masterTimeline.fromTo(el,
          { opacity: 0, y: 10, filter: "blur(4px)" },
          { opacity: 1, y: 0,  filter: "blur(0px)", ease: "power2.out", duration: 2.5 },
          24 + (i % 4) * 1.2
        );
      });

      // Threat Exit
      masterTimeline.to(threatRef.current, {
        opacity: 0,
        y: -30,
        ease: "power2.inOut",
        duration: 5,
      }, 37);
      masterTimeline.set(threatRef.current, { display: "none", pointerEvents: "none" }, 42);

      // ── D. SECTION 03 — WHY NEMESYS (42 to 64) ────────────────
      masterTimeline.set(whyRef.current, { display: "flex", pointerEvents: "auto" }, 41);
      masterTimeline.fromTo(whyRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, ease: "power2.out", duration: 5 },
        42
      );

      // Chars for "MODERN CODE MOVES FAST."
      const validChars = whyCharRefs.current.filter(Boolean);
      if (validChars.length) {
        masterTimeline.fromTo(validChars,
          { opacity: 0, y: 35, filter: "blur(6px)" },
          { opacity: 1, y: 0,  filter: "blur(0px)", stagger: 0.2, ease: "power3.out", duration: 2.5 },
          43
        );
      }

      // Words for "SECURITY CAN'T BE AN AFTERTHOUGHT."
      whyH2WordRefs.current.forEach((el, i) => {
        if (!el) return;
        masterTimeline.fromTo(el,
          { clipPath: "inset(0 100% 0 0)", x: -14 },
          { clipPath: "inset(0 0% 0 0)",   x: 0, ease: "power2.out", duration: 2 },
          46 + i * 1.2
        );
      });

      // Stats & Grid
      whyStatsRefs.current.forEach((el, i) => {
        if (!el) return;
        masterTimeline.fromTo(el,
          { opacity: 0, x: -25 },
          { opacity: 1, x: 0, ease: "power2.out", duration: 3 },
          48 + i * 2
        );
      });

      if (whyGridRef.current) {
        masterTimeline.fromTo(whyGridRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 3 },
          53
        );
      }

      // Why Nemesys Exit
      masterTimeline.to(whyRef.current, {
        opacity: 0,
        y: -30,
        ease: "power2.inOut",
        duration: 5,
      }, 59);
      masterTimeline.set(whyRef.current, { display: "none", pointerEvents: "none" }, 64);

      // ── E. SECTION 04 — HOW IT WORKS (64 to 84) ───────────────
      masterTimeline.set(howRef.current, { display: "flex", pointerEvents: "auto" }, 63);
      masterTimeline.fromTo(howRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, ease: "power2.out", duration: 5 },
        64
      );

      // Stages stagger in: INPUT -> TRACE -> DETECT -> FIX
      howStageEls.current.forEach((el, i) => {
        if (!el) return;
        masterTimeline.fromTo(el,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 4 },
          65 + i * 3.5
        );
      });

      // Connectors
      howConnectorEls.current.forEach((el, i) => {
        if (!el) return;
        masterTimeline.fromTo(el,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 0.6, ease: "power2.inOut", duration: 3 },
          68 + i * 3.5
        );
      });

      if (howCtaRef.current) {
        masterTimeline.fromTo(howCtaRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, ease: "back.out(1.4)", duration: 3 },
          79
        );
      }

      // ── F. SMOOTH CARD SCALE DOWN (84 to 100) ─────────────────
      // After reaching the final frame & FIX state at t=82:
      // smoothly scale the entire Hero component down into a smaller card,
      // preserving the final frame, aspect ratio and existing visual design.
      masterTimeline.to(heroCardRef.current, {
        scale: 0.82,
        borderRadius: "28px",
        boxShadow: "0 35px 90px -15px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.12)",
        ease: "power2.inOut",
        duration: 16,
      }, 84);

    };

    initGSAP();

    return () => {
      isCleanedUp = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", resizeCanvas);
      }
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (masterTimeline) masterTimeline.kill();
    };
  }, []);

  return (
    /* ── OUTER TALL SCROLL TRACK (Single Pinned Component) ───────────── */
    <div
      ref={outerWrapperRef}
      className="relative w-full bg-black"
      style={{ height: "650vh" }}
    >
      {/* ── STICKY PINNED VIEWPORT CONTAINER ─────────────────────────── */}
      <div
        ref={pinnedStageRef}
        className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#000000]"
      >
        {/* ── THE CINEMATIC HERO CARD (SCALES DOWN AFTER FINAL FRAME) ──── */}
        <div
          ref={heroCardRef}
          className="relative w-full h-full overflow-hidden flex flex-col justify-between origin-center will-change-transform bg-black"
          style={{ transform: "scale(1)", borderRadius: "0px" }}
        >
          {/* ── SVG FILTERS (For rough scribbles & button edges) ──────── */}
          <svg width="0" height="0" className="absolute pointer-events-none">
            <defs>
              <filter id="rough-edge" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" seed="1" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>

          {/* ── CANVAS: SCROLL-CONTROLLED FRAME SEQUENCE ───────────────── */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-[0] block"
          />

          {/* Fallback image (frame 0) shown before canvas initializes */}
          <div className="absolute inset-0 z-[-1]">
            <Image
              src="/image1.jpg"
              alt=""
              fill
              priority
              className="object-cover object-[center_top]"
              sizes="100vw"
            />
          </div>

          {/* ── CINEMATIC OVERLAYS & TEXTURES ─────────────────────────── */}
          <div className="absolute inset-0 z-[2] pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_25%,rgba(0,0,0,0)_60%)]" />
          <div className="absolute inset-0 z-[2] pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0)_15%)]" />
          <div className="absolute inset-0 z-[2] pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0)_20%)]" />
          
          {/* Noise / paper texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-[3] opacity-[0.035]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "256px 256px",
            }}
          />

          {/* ── 01 — HERO UI EXPERIENCE (VISIBLE IN FIRST PHASE) ──────── */}
          <div
            ref={heroUIRef}
            className="absolute inset-0 z-[15] flex flex-col justify-between pointer-events-auto"
          >
            {/* Target Crosshair */}
            <div className="absolute left-[-15px] top-[45%] z-[10] w-[60px] h-[60px] pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-80" style={{ filter: "url(#rough-edge)" }}>
                <circle cx="50" cy="50" r="30" fill="none" stroke="#D92C24" strokeWidth="2.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#D92C24" strokeWidth="2.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#D92C24" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Navigation */}
            <header className="relative z-[20] flex items-center justify-between px-[clamp(16px,3vw,52px)] py-[clamp(14px,2.5vh,28px)] shrink-0">
              <a href="#" className="flex items-center gap-[clamp(6px,1vw,10px)] no-underline shrink-0 group">
                <Image
                  src="/icon.png"
                  alt="Nemesys Icon"
                  width={28}
                  height={28}
                  className="w-[clamp(20px,2.2vw,28px)] h-auto object-contain"
                />
                <span className="font-[family-name:var(--font-anton)] text-[clamp(1.4rem,2.2vw,1.8rem)] text-[#F2EFE6] tracking-[0.05em] uppercase leading-[0.8] drop-shadow-md pt-1">
                  NEMESYS
                </span>
              </a>

              <nav className="hidden md:flex items-center gap-[clamp(16px,2.5vw,40px)] absolute left-1/2 -translate-x-1/2">
                {["Features", "How It Works", "Pricing", "Docs", "Blog"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="font-[family-name:var(--font-space-mono)] text-[clamp(0.6rem,0.8vw,0.75rem)] font-medium text-[#E8E3D7]/75 uppercase tracking-[0.1em] hover:text-[#F2EFE6] transition-colors whitespace-nowrap"
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <a
                href="#"
                className="hidden md:inline-flex items-center gap-1.5 px-[clamp(12px,1.5vw,22px)] py-[clamp(5px,0.8vh,8px)] border-[1.5px] border-[#E8E3D7]/40 bg-black/50 text-[#F2EFE6] font-[family-name:var(--font-space-mono)] font-bold text-[clamp(0.6rem,0.8vw,0.75rem)] uppercase tracking-[0.1em] shrink-0 transition-colors hover:bg-[#E8E3D7]/15 hover:border-[#E8E3D7]/80 shadow-sm [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,6px_100%,0_calc(100%-6px))]"
              >
                Get Started →
              </a>

              <button
                className="md:hidden flex bg-transparent border-[1.5px] border-[#E8E3D7]/40 text-[#F2EFE6] px-2.5 py-1.5 text-base cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                ☰
              </button>
            </header>

            {/* Main Content Area */}
            <div className="relative z-[15] flex-1 flex items-end px-[clamp(16px,3vw,52px)] pb-[clamp(32px,6vh,64px)] max-w-full lg:max-w-[62%]">
              <div className="flex flex-col w-full relative">
                {/* Headline: SECURE YOUR CODE */}
                <div className="relative flex flex-col leading-[0.92] mb-[clamp(8px,2vh,20px)] mt-auto pt-[clamp(20px,4vh,60px)] z-[20] [filter:drop-shadow(4px_4px_0_#000)_drop-shadow(-1px_-1px_0_#000)_drop-shadow(0_15px_40px_rgba(0,0,0,0.9))]">
                  <div className="font-[family-name:var(--font-anton)] font-normal text-[clamp(4.5rem,9.5vw,11.5rem)] uppercase tracking-[-0.02em]">
                    <div style={inkBleedWhite}>SECURE</div>
                    <div className="flex flex-wrap items-baseline mt-1">
                      <span style={inkBleedWhite} className="mr-[clamp(10px,2vw,20px)]">YOUR</span>
                      <span className="relative inline-block">
                        <span style={inkBleedRed} className="relative z-10">CODE</span>
                        <div className="absolute left-[-5%] right-[-15%] bottom-[-10px] md:bottom-[-20px] h-[35px] md:h-[50px] pointer-events-none z-[3]">
                          <svg viewBox="0 0 300 100" className="w-full h-full opacity-100" preserveAspectRatio="none" style={{ filter: "drop-shadow(3px 3px 0px rgba(0,0,0,0.8)) url(#rough-edge)" }}>
                            <path d="M10,50 L280,30 L220,50 L290,50" fill="none" stroke="#D92C24" strokeWidth="12" strokeLinecap="square" strokeLinejoin="miter" />
                            <path d="M30,70 L260,45 L180,65 L270,70" fill="none" stroke="#D92C24" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" opacity="0.8" />
                          </svg>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="font-[family-name:var(--font-ibm-plex)] font-medium text-[clamp(14px,1.2vw,16px)] text-[#E8E3D7]/90 leading-[1.45] max-w-[clamp(280px,36vw,540px)] m-0 mb-[clamp(16px,3vh,32px)] tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.9)] relative z-[10]">
                  NEMESYS helps developers find and fix security<br className="hidden sm:block" />
                  vulnerabilities in their code using advanced<br className="hidden sm:block" />
                  static analysis and AI.
                </p>

                {/* CTA Buttons */}
                <div className="flex items-center gap-[clamp(12px,2vw,24px)] flex-wrap mb-[clamp(24px,4vh,48px)] relative z-[10]">
                  <a href="#" className="relative group inline-flex items-center justify-center px-[clamp(20px,3vw,36px)] py-[clamp(12px,2vh,20px)] no-underline">
                    <svg className="absolute inset-0 w-full h-full text-[#D92C24] transition-colors group-hover:text-[#E52B2B]" preserveAspectRatio="none" viewBox="0 0 200 60" style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.7)) url(#rough-edge)" }}>
                      <path d="M5,10 Q25,3 100,5 T195,8 Q198,30 194,52 Q100,58 6,55 Q2,30 5,10 Z" fill="currentColor" />
                    </svg>
                    <span className="relative z-10 font-[family-name:var(--font-space-mono)] text-[clamp(0.75rem,1vw,0.9rem)] font-bold text-[#F2EFE6] uppercase tracking-[0.08em] flex items-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
                      Get Started Free <span className="text-[1.2em]">→</span>
                    </span>
                  </a>

                  <a href="#" className="relative group inline-flex items-center justify-center px-[clamp(18px,2.8vw,32px)] py-[clamp(10px,1.8vh,18px)] no-underline">
                    <svg className="absolute inset-0 w-full h-full text-[#E8E3D7] transition-all group-hover:text-[#F2EFE6]" preserveAspectRatio="none" viewBox="0 0 200 60" style={{ filter: "drop-shadow(3px 3px 0px rgba(0,0,0,0.5)) url(#rough-edge)" }}>
                      <path d="M8,12 Q40,5 100,8 T192,12 Q196,30 190,50 Q100,55 10,50 Q4,30 8,12 Z" fill="rgba(0,0,0,0.4)" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                    <span className="relative z-10 font-[family-name:var(--font-space-mono)] text-[clamp(0.75rem,1vw,0.9rem)] font-bold text-[#F2EFE6] uppercase tracking-[0.08em] flex items-center gap-3">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.2em] h-[1.2em]">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      View on GitHub
                    </span>
                  </a>
                </div>

                {/* Stats */}
                <div className="flex items-start gap-[clamp(16px,3vw,36px)] pt-[clamp(8px,1vh,16px)] relative z-[10]">
                  <div className="flex flex-col gap-1.5 relative">
                    <span className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none tracking-[-0.01em] [text-shadow:2px_2px_0_rgba(0,0,0,0.8)]">10K+</span>
                    <span className="font-[family-name:var(--font-ibm-plex)] text-[clamp(10px,0.75vw,12px)] font-medium text-[#E8E3D7]/90 uppercase tracking-[0.05em] leading-[1.3]">Vulnerabilities<br />Detected</span>
                  </div>
                  <div className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none opacity-80 select-none">/</div>
                  <div className="flex flex-col gap-1.5 relative">
                    <span className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none tracking-[-0.01em] [text-shadow:2px_2px_0_rgba(0,0,0,0.8)]">500+</span>
                    <span className="font-[family-name:var(--font-ibm-plex)] text-[clamp(10px,0.75vw,12px)] font-medium text-[#E8E3D7]/90 uppercase tracking-[0.05em] leading-[1.3]">Projects<br />Secured</span>
                  </div>
                  <div className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none opacity-80 select-none">/</div>
                  <div className="flex flex-col gap-1.5 relative">
                    <span className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none tracking-[-0.01em] [text-shadow:2px_2px_0_rgba(0,0,0,0.8)]">99%</span>
                    <span className="font-[family-name:var(--font-ibm-plex)] text-[clamp(10px,0.75vw,12px)] font-medium text-[#E8E3D7]/90 uppercase tracking-[0.05em] leading-[1.3]">Developer<br />Satisfaction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Handwritten Caveat Note */}
            <div className="absolute right-[clamp(20px,4vw,60px)] bottom-[clamp(40px,8vh,100px)] z-[15] max-w-[clamp(160px,12vw,220px)] font-[family-name:var(--font-caveat)] font-bold text-[clamp(1.4rem,1.8vw,1.8rem)] leading-[1.1] text-[#E8E3D7]/90 -rotate-[4deg] opacity-95 pointer-events-none drop-shadow-[1px_2px_3px_rgba(0,0,0,0.6)]">
              BUILD <span className="text-[#D92C24]">SAFER</span> SOFTWARE<br />
              FOR A <span className="text-[#D92C24]">STRONGER</span> TOMORROW.
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[20] flex flex-col items-center gap-2 opacity-60">
              <span className="font-[family-name:var(--font-space-mono)] text-[0.6rem] text-[#F2EFE6]/60 uppercase tracking-[0.2em]">SCROLL</span>
              <div className="w-[1px] h-8 bg-gradient-to-b from-[#F2EFE6]/60 to-transparent animate-pulse" />
            </div>
          </div>

          {/* ── 02 — THE THREAT EXPERIENCE (PHASE 2) ───────────────────── */}
          <div
            ref={threatRef}
            className="absolute inset-0 z-[15] hidden flex-col items-center justify-center py-20 px-6 pointer-events-none"
            style={{ opacity: 0 }}
          >
            {/* Ghost BG Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[0] select-none opacity-[0.06]" aria-hidden>
              <span
                className="font-[family-name:var(--font-anton)] leading-none"
                style={{ fontSize: "clamp(160px,28vw,380px)", WebkitTextStroke: "1.5px #D92C24", WebkitTextFillColor: "transparent" }}
              >
                VULN
              </span>
            </div>

            {/* Scan Lines & Frame Markers */}
            {[20, 50, 75].map((top, i) => (
              <div
                key={i}
                ref={(el) => (threatScanLines.current[i] = el)}
                className="absolute left-0 right-0 h-px bg-[#D92C24]/20 pointer-events-none z-[2]"
                style={{ top: `${top}%` }}
              />
            ))}
            <div className="absolute left-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D92C24]/25 to-transparent pointer-events-none z-[2]" />
            <div className="absolute right-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#77736B]/15 to-transparent pointer-events-none z-[2]" />

            {/* Corner Brackets */}
            {["top-10 left-10 border-t-2 border-l-2", "top-10 right-10 border-t-2 border-r-2", "bottom-10 left-10 border-b-2 border-l-2", "bottom-10 right-10 border-b-2 border-r-2"].map((cls, i) => (
              <div key={i} className={`absolute w-8 h-8 border-[#D92C24]/50 pointer-events-none z-[3] ${cls}`} />
            ))}

            {/* Floating Code Fragments */}
            {THREAT_CODE_FRAGS.map((frag, i) => (
              <div
                key={i}
                ref={(el) => (threatCodeRefs.current[i] = el)}
                className="absolute pointer-events-none z-[3]"
                style={{ left: frag.x, top: frag.y, opacity: 0 }}
              >
                <span className="font-[family-name:var(--font-space-mono)] text-[clamp(8px,0.62vw,10px)] tracking-[0.04em]" style={{ color: frag.color, opacity: 0.65 }}>
                  {frag.text}
                </span>
              </div>
            ))}

            {/* Diagnostics */}
            {THREAT_DIAGNOSTICS.map((d, i) => (
              <div
                key={i}
                ref={(el) => (threatDiagRefs.current[i] = el)}
                className="absolute pointer-events-none z-[3]"
                style={{ left: d.x, top: d.y, opacity: 0 }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#77736B] uppercase tracking-[0.14em]">{d.label}</span>
                  <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: d.color }}>{d.value}</span>
                </div>
              </div>
            ))}

            {/* Section label */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[10]">
              <span className="font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] uppercase tracking-[0.32em]">
                02 — THE THREAT
              </span>
            </div>

            {/* Headline */}
            <div className="relative z-[10] w-full max-w-5xl mx-auto flex flex-col items-center text-center">
              <div className="flex flex-wrap justify-center gap-x-[clamp(12px,2.5vw,32px)] gap-y-2 mb-4">
                {THREAT_WORDS.map((w, i) => (
                  <div key={i} ref={(el) => (threatWordRefs.current[i] = el)} style={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}>
                    <span
                      className="font-[family-name:var(--font-anton)] font-normal uppercase leading-[0.88] tracking-[-0.025em] block"
                      style={{ fontSize: "clamp(3.5rem,8.5vw,10rem)", color: w.color }}
                    >
                      {w.text}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="w-full max-w-2xl h-px mb-8"
                style={{ background: "linear-gradient(to right, transparent, #D92C24, #D92C24 60%, transparent)" }}
              />

              <p className="font-[family-name:var(--font-ibm-plex)] text-[clamp(12px,1vw,14px)] text-[#77736B] leading-[1.8] uppercase tracking-[0.06em] max-w-2xl">
                Traditional security scans catch surface-level issues.<br />
                NEMESYS performs deep taint-flow analysis — tracing how untrusted<br />
                data moves through your entire codebase, layer by layer.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className="w-10 h-px bg-[#D92C24]" />
                <span className="font-[family-name:var(--font-caveat)] text-[1.4rem] text-[#D92C24] -rotate-2 inline-block">
                  every line. every path. every risk.
                </span>
                <div className="w-10 h-px bg-[#D92C24]" />
              </div>
            </div>
          </div>

          {/* ── 03 — WHY NEMESYS EXPERIENCE (PHASE 3) ─────────────────── */}
          <div
            ref={whyRef}
            className="absolute inset-0 z-[15] hidden flex-col items-start justify-center py-20 px-[clamp(20px,5vw,80px)] pointer-events-none"
            style={{ opacity: 0 }}
          >
            {/* Ghost Background Words */}
            {WHY_BG_WORDS.map((w, i) => (
              <div key={i} className="absolute pointer-events-none z-[0] select-none opacity-[0.04]" style={{ left: w.x, top: w.y }}>
                <span className="font-[family-name:var(--font-anton)] leading-none uppercase" style={{ fontSize: w.size, WebkitTextStroke: "1px #D92C24", WebkitTextFillColor: "transparent" }}>
                  {w.text}
                </span>
              </div>
            ))}

            {/* Left rule */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#D92C24]/60 via-[#D92C24]/20 to-transparent pointer-events-none z-[3]" />

            {/* Section Label */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[10]">
              <span className="font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] uppercase tracking-[0.32em]">
                03 — WHY NEMESYS
              </span>
            </div>

            {/* Content Container */}
            <div className="relative z-[10] w-full max-w-7xl mx-auto flex flex-col gap-5">
              {/* Headline 1 (Char Reveal) */}
              <div className="overflow-hidden" style={{ perspective: "800px" }}>
                <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2.6rem,6.5vw,8rem)] text-[#F2EFE6] uppercase leading-[0.88] tracking-[-0.02em]">
                  {"MODERN CODE MOVES FAST.".split("").map((c, i) => (
                    <span key={i} ref={(el) => (whyCharRefs.current[i] = el)} className="inline-block" style={{ opacity: 0 }}>
                      {c === " " ? "\u00A0" : c}
                    </span>
                  ))}
                </h2>
              </div>

              {/* Accent Line */}
              <div
                className="w-full h-px"
                style={{ background: "linear-gradient(to right, #D92C24, #D92C24 55%, rgba(217,44,36,0.1) 100%)" }}
              />

              {/* Headline 2 (Word Reveal) */}
              <div className="overflow-hidden flex flex-wrap gap-x-[0.25em] gap-y-1">
                {"SECURITY CAN'T BE AN AFTERTHOUGHT.".split(" ").map((w, i) => (
                  <span
                    key={i}
                    ref={(el) => (whyH2WordRefs.current[i] = el)}
                    className="font-[family-name:var(--font-anton)] inline-block uppercase leading-[0.9] tracking-[-0.015em]"
                    style={{ fontSize: "clamp(1.6rem,4vw,5.5rem)", color: i >= 4 ? "#D92C24" : "#77736B", clipPath: "inset(0 100% 0 0)" }}
                  >
                    {w}
                  </span>
                ))}
              </div>

              {/* Two Column Layout */}
              <div className="flex flex-col lg:flex-row gap-12 mt-2 w-full">
                {/* Left */}
                <div className="flex-1 max-w-xl">
                  <p className="font-[family-name:var(--font-ibm-plex)] text-[clamp(12px,1.05vw,14px)] text-[#77736B] leading-[1.8] tracking-[0.01em]">
                    Modern development cycles ship code in hours. Security reviews that take weeks don&apos;t scale.{" "}
                    <span className="text-[#F2EFE6]">NEMESYS integrates directly into your workflow</span> — running deep static analysis and taint-flow tracing at the speed of your CI/CD pipeline.
                  </p>
                  <div className="mt-6">
                    <span className="font-[family-name:var(--font-caveat)] text-[1.4rem] text-[#D92C24] -rotate-2 inline-block leading-[1.3]">
                      built for developers,<br />not just security teams.
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex-1 flex flex-col gap-4">
                  {WHY_STATS.map((s, i) => (
                    <div
                      key={i}
                      ref={(el) => (whyStatsRefs.current[i] = el)}
                      className="relative border-l-2 border-[#D92C24]/30 pl-4 py-1"
                      style={{ opacity: 0 }}
                    >
                      <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D92C24]" />
                      <div className="font-[family-name:var(--font-anton)] text-[clamp(2rem,3.8vw,3.5rem)] text-[#F2EFE6] leading-none tracking-[-0.02em]">
                        {s.number}
                      </div>
                      <div className="font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#77736B] uppercase tracking-[0.1em] leading-[1.6] mt-0.5 whitespace-pre-line">
                        {s.label}
                      </div>
                    </div>
                  ))}

                  {/* Technical Depth Grid */}
                  <div ref={whyGridRef} className="relative mt-1 border border-[#77736B]/20 p-3 bg-black/40" style={{ opacity: 0 }}>
                    <div className="absolute -top-2 left-3 bg-[#050505] px-1.5">
                      <span className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#35BFFF] uppercase tracking-[0.22em]">
                        ANALYSIS DEPTH
                      </span>
                    </div>
                    <div className="font-[family-name:var(--font-space-mono)] text-[9px] text-[#77736B] leading-[2.2] tracking-[0.04em]">
                      {[["TAINT PROPAGATION", "7 LEVELS", "#F2EFE6"], ["CALL GRAPH DEPTH", "∞", "#F2EFE6"], ["INTER-PROCEDURAL", "ENABLED", "#35BFFF"], ["FALSE POSITIVE RATE", "< 2%", "#D92C24"]].map(([k, v, vc]) => (
                        <div key={k} className="flex justify-between border-b border-[#77736B]/10 last:border-0 pb-0.5">
                          <span>{k}</span>
                          <span style={{ color: vc }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 04 — HOW IT WORKS EXPERIENCE (PHASE 4 & FINAL CARD STATE) ─ */}
          <div
            ref={howRef}
            className="absolute inset-0 z-[15] hidden flex-col justify-center px-[clamp(20px,5vw,80px)] py-16 pointer-events-none"
            style={{ opacity: 0 }}
          >
            {/* Section Label */}
            <div className="absolute top-9 left-1/2 -translate-x-1/2 z-[10]">
              <span className="font-[family-name:var(--font-space-mono)] text-[0.62rem] text-[#77736B] uppercase tracking-[0.32em]">
                04 — HOW IT WORKS
              </span>
            </div>

            {/* Ambient Cyan Glow for FIX Stage Climax */}
            <div
              className="absolute inset-0 pointer-events-none z-[0] opacity-40"
              style={{ background: "radial-gradient(ellipse 55% 65% at 85% 50%, rgba(53,191,255,0.08) 0%, transparent 70%)" }}
            />

            {/* 4 Stages Pipeline */}
            <div className="relative z-[10] w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
                {HOW_STAGES.map((s, i) => (
                  <div
                    key={s.id}
                    ref={(el) => (howStageEls.current[i] = el)}
                    className="relative"
                    style={{ opacity: 0 }}
                  >
                    {/* Stage number */}
                    <div className="mb-2">
                      <span className="font-[family-name:var(--font-space-mono)] text-[0.6rem] uppercase tracking-[0.22em]" style={{ color: s.accentColor }}>
                        {s.num}
                      </span>
                    </div>

                    {/* Stage title */}
                    <div className="mb-2">
                      <h3
                        className="font-[family-name:var(--font-anton)] uppercase leading-none tracking-[-0.02em]"
                        style={{
                          fontSize: s.isFinal ? "clamp(3rem,5vw,6rem)" : "clamp(2.4rem,4vw,4.5rem)",
                          color: s.titleColor,
                          textShadow: s.isFinal ? "0 0 35px rgba(53,191,255,0.3)" : "none",
                        }}
                      >
                        {s.title}
                      </h3>
                      <p className="font-[family-name:var(--font-space-mono)] text-[0.65rem] uppercase tracking-[0.14em] mt-0.5" style={{ color: s.accentColor, opacity: 0.8 }}>
                        {s.sub}
                      </p>
                    </div>

                    {/* Arrow Connector Line */}
                    {i < HOW_STAGES.length - 1 && (
                      <div
                        ref={(el) => (howConnectorEls.current[i] = el)}
                        className="absolute -right-3 top-8 hidden lg:flex items-center z-[6] origin-left"
                        style={{ opacity: 0 }}
                        aria-hidden
                      >
                        <div className="w-5 h-px" style={{ background: i === 2 ? "#D92C24" : "#77736B" }} />
                        <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-transparent" style={{ borderLeftColor: i === 2 ? "#D92C24" : "#77736B" }} />
                      </div>
                    )}

                    {/* Description */}
                    <p className="font-[family-name:var(--font-ibm-plex)] text-[clamp(10px,0.75vw,11.5px)] text-[#77736B] leading-[1.7] mb-2.5">
                      {s.desc}
                    </p>

                    {/* Code Snippet Box */}
                    <div className="relative mb-2.5">
                      {s.isAlert && (
                        <div className="absolute -top-2.5 right-0 z-10">
                          <span className="font-[family-name:var(--font-space-mono)] text-[7.5px] bg-[#D92C24] text-white px-1.5 py-0.5 uppercase tracking-[0.1em]">
                            ⚠ ALERT
                          </span>
                        </div>
                      )}
                      {s.isFinal && (
                        <div className="absolute -top-2.5 right-0 z-10">
                          <span className="font-[family-name:var(--font-space-mono)] text-[7.5px] bg-[#35BFFF] text-black px-1.5 py-0.5 uppercase tracking-[0.1em]">
                            ✓ RESOLVED
                          </span>
                        </div>
                      )}
                      <pre
                        className="font-[family-name:var(--font-space-mono)] leading-[1.8] p-2.5 overflow-x-auto border"
                        style={{
                          fontSize: "clamp(7.5px,0.58vw,9.5px)",
                          color: s.isAlert ? "#D92C24" : s.isFinal ? "#35BFFF" : "#77736B",
                          borderColor: s.isAlert ? "rgba(217,44,36,0.35)" : s.isFinal ? "rgba(53,191,255,0.3)" : "rgba(119,115,107,0.18)",
                          background: s.isAlert ? "rgba(217,44,36,0.04)" : s.isFinal ? "rgba(53,191,255,0.04)" : "rgba(255,255,255,0.015)",
                        }}
                      >
                        <code>{s.code}</code>
                      </pre>
                    </div>

                    {/* Handwritten annotation */}
                    <div>
                      <span className="font-[family-name:var(--font-caveat)] text-[1.05rem] inline-block" style={{ color: s.accentColor, opacity: 0.8 }}>
                        ↗ {s.note}
                      </span>
                    </div>

                    {/* Final FIX CTA */}
                    {s.isFinal && (
                      <div ref={howCtaRef} className="mt-4 pointer-events-auto" style={{ opacity: 0 }}>
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-[#35BFFF]/15 blur-sm" />
                          <a
                            href="#"
                            className="relative inline-flex items-center gap-1.5 px-4 py-2 border border-[#35BFFF]/50 font-[family-name:var(--font-space-mono)] text-[0.7rem] text-[#35BFFF] uppercase tracking-[0.08em] hover:bg-[#35BFFF]/10 transition-colors"
                          >
                            Start Scanning Free →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Pipeline Status Axis */}
              <div className="mt-10 w-full relative">
                <div className="w-full h-px" style={{ background: "linear-gradient(to right, transparent, rgba(119,115,107,0.3), transparent)" }} />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 mt-px">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D92C24]" />
                  <span className="font-[family-name:var(--font-space-mono)] text-[8px] text-[#77736B] uppercase tracking-[0.22em]">
                    PIPELINE ARMORED — ZERO VULNERABILITIES REMAINING
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
