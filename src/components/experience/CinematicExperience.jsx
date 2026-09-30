"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { FrameSequenceCanvas } from "./FrameSequenceCanvas";
import { ThreatTrace } from "../threat/ThreatTrace";
import { SecurityTopology } from "../topology/SecurityTopology";
import { AnalysisCore } from "../analysis/AnalysisCore";

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

const TRACE_NODE_X = [50, 230, 410, 590, 770, 950];

/**
 * CinematicExperience Master Component
 * Houses the persistent cinematic stage and coordinates the 4 narrative states:
 * 01 — Cinematic Hero
 * 02 — Threat Trace
 * 03 — Security Topology
 * 04 — Analysis Core
 * Driven by one master GSAP ScrollTrigger timeline with smooth card scale-down.
 */
export default function CinematicExperience() {
  const outerWrapperRef  = useRef(null);
  const pinnedStageRef   = useRef(null);
  const heroCardRef      = useRef(null);
  const frameCanvasRef   = useRef(null);

  // 01 — Hero UI Refs
  const heroUIRef        = useRef(null);
  const crosshairRef     = useRef(null);

  // 02 — Threat Trace Refs
  const threatRef        = useRef(null);
  const threatHeadRef    = useRef(null);
  const threatWordRefs   = useRef([]);
  const threatNodeRefs   = useRef([]);
  const threatPathRef    = useRef(null);
  const threatTracerRef  = useRef(null);
  const threatMobilePathRef = useRef(null);
  const threatMobileTracerRef = useRef(null);
  const threatSinkRef    = useRef(null);

  // 03 — Security Topology Refs
  const topologyRef      = useRef(null);
  const topoHeadRef      = useRef(null);
  const topoPhraseRefs   = useRef([]);
  const topoAlertRef     = useRef(null);
  const topoStatsRef     = useRef(null);

  // 04 — Analysis Core Refs
  const analysisRef      = useRef(null);
  const analysisPipeRef  = useRef(null);
  const analysisTraceRef = useRef(null);
  const analysisCodeLineRefs = useRef([]);
  const analysisDetectRef= useRef(null);
  const analysisExplainRef = useRef(null);
  const analysisFixRef   = useRef(null);
  const analysisCtaRef   = useRef(null);

  useEffect(() => {
    let gsap, ScrollTrigger, masterTimeline;

    const initMasterTimeline = async () => {
      const { default: _gsap } = await import("gsap");
      const { ScrollTrigger: _ST } = await import("gsap/ScrollTrigger");
      gsap = _gsap;
      ScrollTrigger = _ST;
      gsap.registerPlugin(ScrollTrigger);

      if (!outerWrapperRef.current || !pinnedStageRef.current) return;

      const totalFrames = frameCanvasRef.current?.getTotalFrames() || 227;
      const playhead = frameCanvasRef.current?.getPlayhead() || { frame: 0 };
      const finalCardScale = window.matchMedia("(max-width: 640px)").matches ? 0.92 : 0.82;

      // ── MASTER SCRUBBED SCROLLTRIGGER TIMELINE ─────────────────
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

      // ── 1. FRAME SEQUENCE SCRUBBING (0 to 86% of timeline) ────
      // Frame sequence progresses from Frame 0 to Frame 226 across states 01 to 04
      masterTimeline.to(
        playhead,
        {
          frame: totalFrames - 1,
          ease: "none",
          duration: 86,
          onUpdate: () => {
            frameCanvasRef.current?.forceRender();
          },
        },
        0
      );

      // ── 2. NARRATIVE STATE 01 — HERO (0 to 25%) ────────────────
      // Hero UI is active from t=0. At t=20, it recedes smoothly
      masterTimeline.to(
        heroUIRef.current,
        {
          opacity: 0,
          y: -35,
          ease: "power2.inOut",
          duration: 5,
        },
        20
      );
      if (crosshairRef.current) {
        masterTimeline.to(crosshairRef.current, { opacity: 0, duration: 4 }, 20);
      }
      masterTimeline.set(heroUIRef.current, { pointerEvents: "none" }, 25);

      // ── 3. NARRATIVE STATE 02 — THREAT TRACE (25% to 45%) ──────
      // Seamlessly enters into the robot's world
      masterTimeline.set(threatRef.current, { display: "flex", pointerEvents: "auto" }, 24);
      masterTimeline.fromTo(
        threatRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, ease: "power2.out", duration: 4 },
        25
      );

      // The path and tracer are both scrubbed, so every hop is reproducible in
      // either scroll direction without component state updates.
      if (threatPathRef.current) {
        masterTimeline.fromTo(
          threatPathRef.current,
          { strokeDashoffset: 900 },
          { strokeDashoffset: 0, ease: "power1.inOut", duration: 10 },
          26
        );
      }
      if (threatMobilePathRef.current) {
        masterTimeline.fromTo(
          threatMobilePathRef.current,
          { strokeDashoffset: 1300 },
          { strokeDashoffset: 0, ease: "power1.inOut", duration: 10 },
          26
        );
      }

      if (threatTracerRef.current) {
        masterTimeline.fromTo(
          threatTracerRef.current,
          { attr: { cx: TRACE_NODE_X[0] }, opacity: 0 },
          { opacity: 1, duration: 0.25 },
          26
        );
        TRACE_NODE_X.slice(1).forEach((x, idx) => {
          masterTimeline.to(
            threatTracerRef.current,
            { attr: { cx: x }, ease: "power1.inOut", duration: 1.8 },
            26 + (idx + 1) * 1.8
          );
        });
      }
      if (threatMobileTracerRef.current) {
        const mobileTraceNodes = [[250, 100], [750, 100], [750, 300], [250, 300], [250, 500], [750, 500]];
        masterTimeline.fromTo(
          threatMobileTracerRef.current,
          { attr: { cx: mobileTraceNodes[0][0], cy: mobileTraceNodes[0][1] }, opacity: 0 },
          { opacity: 1, duration: 0.25 },
          26
        );
        mobileTraceNodes.slice(1).forEach(([x, y], idx) => {
          masterTimeline.to(
            threatMobileTracerRef.current,
            { attr: { cx: x, cy: y }, ease: "power1.inOut", duration: 1.8 },
            26 + (idx + 1) * 1.8
          );
        });
      }

      // A hop enters with the signal; the previous hop remains legible but
      // recedes so the active location is always unambiguous.
      threatNodeRefs.current.forEach((node, idx) => {
        if (!node) return;
        const nodeStart = 26 + idx * 1.8;
        masterTimeline.fromTo(
          node,
          { opacity: 0, y: 16, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 1.35 },
          nodeStart
        );
        masterTimeline.set(node, { attr: { "data-active": "true" } }, nodeStart);
        if (idx < threatNodeRefs.current.length - 1) {
          masterTimeline.set(node, { attr: { "data-active": "false" } }, nodeStart + 1.8);
        }
        if (idx > 0) {
          masterTimeline.to(threatNodeRefs.current[idx - 1], { opacity: 0.46, scale: 0.97, duration: 0.8 }, nodeStart);
        }
      });

      // Diagnosis waits for the sink impact rather than competing with the
      // live trace or the environment earlier in the sequence.
      threatWordRefs.current.forEach((w, idx) => {
        if (!w) return;
        masterTimeline.fromTo(
          w,
          { clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", x: -20, opacity: 0 },
          { clipPath: "inset(0 0% 0 0)", filter: "blur(0px)", x: 0, opacity: 1, ease: "power3.out", duration: 1.5 },
          37 + idx * 0.5
        );
      });

      // Detonation marker on Dangerous Sink
      if (threatSinkRef.current) {
        masterTimeline.fromTo(
          threatSinkRef.current,
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, ease: "back.out(1.8)", duration: 1.2 },
          36
        );
        masterTimeline.to(threatSinkRef.current, { boxShadow: "0 0 28px 8px rgba(217,44,36,0.5)", duration: 0.7, yoyo: true, repeat: 1 }, 36);
      }
      if (threatNodeRefs.current[5]) {
        masterTimeline.to(threatNodeRefs.current[5], { scale: 1.05, duration: 0.7, yoyo: true, repeat: 1 }, 36);
      }

      // Threat Trace physical exit into 3D space
      masterTimeline.to(
        threatRef.current,
        {
          opacity: 0,
          scale: 1.04,
          ease: "power2.inOut",
          duration: 4,
        },
        41
      );
      masterTimeline.set(threatRef.current, { display: "none", pointerEvents: "none" }, 45);

      // ── 4. NARRATIVE STATE 03 — SECURITY TOPOLOGY (45% to 70%) ──
      // The last horizontal trace opens into the topology through a thin
      // crimson-like aperture, rather than cutting to a separate scene.
      const topologyElement = topologyRef.current?.element;
      masterTimeline.set(topologyElement, { display: "flex", pointerEvents: "auto", transformOrigin: "50% 50%" }, 40.5);
      masterTimeline.fromTo(
        topologyElement,
        { opacity: 0, scale: 0.985, clipPath: "inset(48% 0 48% 0)" },
        { opacity: 1, scale: 1, clipPath: "inset(0% 0 0% 0)", ease: "power2.out", duration: 4.5 },
        41
      );

      // Camera journey through 3D Three.js space
      const topoProxy = { progress: 0 };
      masterTimeline.to(
        topoProxy,
        {
          progress: 1,
          ease: "none",
          duration: 23,
          onUpdate: () => {
            topologyRef.current?.setProgress(topoProxy.progress);
          },
        },
        46
      );

      // Typography arrives only as the camera reaches each newly discovered
      // layer of the graph. Completed phrases remain in place for the rest of
      // the journey and reverse exactly with scroll.
      topoPhraseRefs.current.forEach((phrase, index) => {
        if (!phrase) return;
        phrase.querySelectorAll("[data-topology-word]").forEach((word, wordIndex) => {
          masterTimeline.fromTo(
            word,
            { clipPath: "inset(0 100% 0 0)", filter: "blur(10px)", y: 16, opacity: 0 },
            { clipPath: "inset(0 0% 0 0)", filter: "blur(0px)", y: 0, opacity: 1, ease: "power3.out", duration: 1.25 },
            48 + index * 3.6 + wordIndex * 0.18
          );
        });
      });

      // Embedded 3D HUD reveals
      if (topoAlertRef.current) {
        masterTimeline.fromTo(
          topoAlertRef.current,
          { opacity: 0, y: 15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, ease: "back.out(1.4)", duration: 3 },
          58
        );
      }

      // Topology exit: the camera commits to the isolated sink, whose spatial
      // view narrows into the analysis viewport instead of fading away.
      masterTimeline.to(
        topologyElement,
        {
          opacity: 0,
          scale: 1.28,
          xPercent: 7,
          clipPath: "inset(28% 22% 28% 22%)",
          transformOrigin: "72% 54%",
          ease: "power2.inOut",
          duration: 4.5,
        },
        66.5
      );
      masterTimeline.set(topologyElement, { display: "none", pointerEvents: "none" }, 71);

      // ── 5. NARRATIVE STATE 04 — ANALYSIS CORE (70% to 90%) ────
      // The sink resolves into a code surface entering from the same focal side.
      masterTimeline.set(analysisRef.current, { display: "flex", pointerEvents: "auto", transformOrigin: "72% 54%" }, 68.5);
      masterTimeline.fromTo(
        analysisRef.current,
        { opacity: 0, scale: 0.86, xPercent: 7, clipPath: "inset(26% 22% 26% 22%)" },
        { opacity: 1, scale: 1, xPercent: 0, clipPath: "inset(0% 0 0% 0)", ease: "power2.out", duration: 4 },
        68.5
      );

      // Taint line physically traces down code gutter
      if (analysisTraceRef.current) {
        masterTimeline.fromTo(
          analysisTraceRef.current,
          { height: 0, opacity: 0 },
          { height: 108, opacity: 1, ease: "power1.inOut", duration: 4 },
          74
        );
      }

      // The signal starts at the untrusted input and lands on the raw query.
      // These are DOM style changes only, so scrub and reverse stay exact.
      if (analysisCodeLineRefs.current[1]) {
        masterTimeline.to(analysisCodeLineRefs.current[1], { backgroundColor: "rgba(53,191,255,0.14)", boxShadow: "inset 3px 0 0 #35BFFF", duration: 1.4 }, 74);
        masterTimeline.to(analysisCodeLineRefs.current[1], { backgroundColor: "rgba(53,191,255,0.045)", boxShadow: "inset 0 0 0 transparent", duration: 0.8 }, 76);
      }
      if (analysisCodeLineRefs.current[2]) {
        masterTimeline.to(analysisCodeLineRefs.current[2], { backgroundColor: "rgba(217,44,36,0.17)", boxShadow: "inset 3px 0 0 #D92C24, 0 0 22px rgba(217,44,36,0.2)", duration: 1.2 }, 76.2);
      }

      // DETECT stage: Line 03 isolated with crimson diagnostic box
      if (analysisDetectRef.current) {
        masterTimeline.fromTo(
          analysisDetectRef.current,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, ease: "power2.out", duration: 1.3 },
          78
        );
        masterTimeline.to(analysisDetectRef.current, { boxShadow: "0 0 30px rgba(217,44,36,0.34)", duration: 0.7, yoyo: true, repeat: 1 }, 79);
      }
      if (analysisExplainRef.current) {
        masterTimeline.fromTo(analysisExplainRef.current, { opacity: 0, y: 5 }, { opacity: 1, y: 0, ease: "power2.out", duration: 1.2 }, 80);
      }

      // FIX stage: Code physically transforms into parameterized query
      if (analysisFixRef.current && analysisDetectRef.current) {
        masterTimeline.to(
          analysisDetectRef.current,
          { opacity: 0, display: "none", duration: 2 },
          81
        );
        masterTimeline.fromTo(
          analysisFixRef.current,
          { opacity: 0, display: "none", scale: 0.98 },
          { opacity: 1, display: "flex", scale: 1, ease: "power2.out", duration: 3 },
          82
        );
        if (analysisCodeLineRefs.current[2]) {
          masterTimeline.to(analysisCodeLineRefs.current[2], { opacity: 0.34, duration: 1.2 }, 81.4);
        }
      }

      // Triumphant remediation CTA emerges
      if (analysisCtaRef.current) {
        masterTimeline.fromTo(
          analysisCtaRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, ease: "back.out(1.5)", duration: 3 },
          84
        );
      }

      // ── 6. FINAL STATE & HERO → CARD TRANSITION (90% to 100%) ─
      // After reaching the final frame and triumphant fix state:
      // smoothly scale the entire Hero component down into a smaller card,
      // revealing the normal page around it before pin releases.
      masterTimeline.to(
        heroCardRef.current,
        {
          scale: finalCardScale,
          borderRadius: "28px",
          boxShadow:
            "0 35px 90px -15px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.12)",
          ease: "power2.inOut",
          duration: 10,
        },
        90
      );
    };

    initMasterTimeline();

    return () => {
      if (masterTimeline) masterTimeline.kill();
    };
  }, []);

  return (
    /* ── OUTER TALL SCROLL TRACK (One Persistent Master Scene) ────── */
    <div
      ref={outerWrapperRef}
      className="relative w-full bg-black"
      style={{ height: "700vh" }}
    >
      {/* ── STICKY PINNED VIEWPORT CONTAINER ───────────────────────── */}
      <div
        ref={pinnedStageRef}
        className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#000000]"
      >
        {/* ── CINEMATIC HERO CARD (SCALES DOWN INTO CARD AT 90-100%) ── */}
        <div
          ref={heroCardRef}
          className="relative w-full h-full overflow-hidden flex flex-col justify-between origin-center will-change-transform bg-black"
          style={{ transform: "scale(1)", borderRadius: "0px" }}
        >
          {/* SVG Rough Filter for button & scribble edges */}
          <svg width="0" height="0" className="absolute pointer-events-none">
            <defs>
              <filter id="rough-edge" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" seed="1" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>

          {/* ── CANVAS: SCROLL-DRIVEN VIDEO FRAME SEQUENCE ─────────── */}
          <FrameSequenceCanvas ref={frameCanvasRef} />

          {/* Static Backup (Frame 0) */}
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

          {/* ── CINEMATIC OVERLAYS & TEXTURES ───────────────────────── */}
          <div className="absolute inset-0 z-[2] pointer-events-none bg-[linear-gradient(to_right,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_25%,rgba(0,0,0,0)_60%)]" />
          <div className="absolute inset-0 z-[2] pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0)_15%)]" />
          <div className="absolute inset-0 z-[2] pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0)_20%)]" />

          {/* Gritty Newspaper & Paper Noise Texture */}
          <div
            className="absolute inset-0 pointer-events-none z-[3] opacity-[0.035]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "256px 256px",
            }}
          />

          {/* ── 01 — HERO UI (DOMINANT IN 0–25%) ─────────────────────── */}
          <div
            ref={heroUIRef}
            className="absolute inset-0 z-[15] flex flex-col justify-between pointer-events-auto"
          >
            {/* Target Crosshair */}
            <div
              ref={crosshairRef}
              className="absolute left-[-15px] top-[45%] z-[10] w-[60px] h-[60px] pointer-events-none"
            >
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

              <a
                href="#"
                className="inline-flex items-center gap-1.5 px-[clamp(12px,1.5vw,22px)] py-[clamp(5px,0.8vh,8px)] border-[1.5px] border-[#E8E3D7]/40 bg-black/50 text-[#F2EFE6] font-[family-name:var(--font-space-mono)] font-bold text-[clamp(0.6rem,0.8vw,0.75rem)] uppercase tracking-[0.1em] shrink-0 transition-colors hover:bg-[#E8E3D7]/15 hover:border-[#E8E3D7]/80 shadow-sm [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,6px_100%,0_calc(100%-6px))]"
              >
                Get Started →
              </a>
            </header>

            {/* Main Hero Content Area */}
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

            {/* Handwritten Editorial Note */}
            <div className="absolute right-[clamp(20px,4vw,60px)] bottom-[clamp(40px,8vh,100px)] z-[15] hidden max-w-[clamp(160px,12vw,220px)] font-[family-name:var(--font-caveat)] font-bold text-[clamp(1.4rem,1.8vw,1.8rem)] leading-[1.1] text-[#E8E3D7]/90 -rotate-[4deg] opacity-95 pointer-events-none drop-shadow-[1px_2px_3px_rgba(0,0,0,0.6)] sm:block">
              BUILD <span className="text-[#D92C24]">SAFER</span> SOFTWARE<br />
              FOR A <span className="text-[#D92C24]">STRONGER</span> TOMORROW.
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[20] flex flex-col items-center gap-2 opacity-60">
              <span className="font-[family-name:var(--font-space-mono)] text-[0.6rem] text-[#F2EFE6]/60 uppercase tracking-[0.2em]">SCROLL</span>
              <div className="w-[1px] h-8 bg-gradient-to-b from-[#F2EFE6]/60 to-transparent animate-pulse" />
            </div>
          </div>

          {/* ── 02 — THREAT TRACE EXPERIENCE (25% to 45%) ───────────── */}
          <ThreatTrace
            ref={threatRef}
            registerHeadRef={threatHeadRef}
            registerWordRef={(el, i) => (threatWordRefs.current[i] = el)}
            registerNodeRef={(el, i) => (threatNodeRefs.current[i] = el)}
            registerPathRef={threatPathRef}
            registerTracerRef={threatTracerRef}
            registerMobilePathRef={threatMobilePathRef}
            registerMobileTracerRef={threatMobileTracerRef}
            registerSinkAlertRef={threatSinkRef}
          />

          {/* ── 03 — SECURITY TOPOLOGY EXPERIENCE (45% to 70%) ──────── */}
          <SecurityTopology
            ref={topologyRef}
            registerHeadlineRef={topoHeadRef}
            registerHeadlinePhraseRef={(el, i) => (topoPhraseRefs.current[i] = el)}
            registerAlertRef={topoAlertRef}
            registerStatsRef={topoStatsRef}
          />

          {/* ── 04 — ANALYSIS CORE EXPERIENCE (70% to 90%) ──────────── */}
          <AnalysisCore
            ref={analysisRef}
            registerPipelineRef={analysisPipeRef}
            registerTraceLineRef={analysisTraceRef}
            registerCodeLineRef={(el, i) => (analysisCodeLineRefs.current[i] = el)}
            registerDetectBoxRef={analysisDetectRef}
            registerExplainRef={analysisExplainRef}
            registerFixBoxRef={analysisFixRef}
            registerFinalCtaRef={analysisCtaRef}
          />
        </div>
      </div>
    </div>
  );
}
