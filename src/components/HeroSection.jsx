"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  ChevronRight, 
  ArrowRight, 
  ChevronLeft, 
  ChevronDown, 
  Star, 
  X, 
  Cpu, 
  ArrowDown 
} from "lucide-react";

export default function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [timeString, setTimeString] = useState("6:30pm · 23 June 2026");

  // Keep live time updated in editorial format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).toLowerCase();
      const date = now.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      setTimeString(`${time} · ${date}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const sliderItems = [
    {
      title: "Engineered to protect.",
      tag: "AST TAINT ENGINE",
      metric: "99.8% Precision",
      detail: "Deep traversal across untrusted input sinks",
    },
    {
      title: "Zero false positives.",
      tag: "HEURISTIC PARSER",
      metric: "8ms Latency",
      detail: "Compiler-level static analysis without overhead",
    },
    {
      title: "Autonomous remediation.",
      tag: "AI PATCH SYSTEM",
      metric: "Instant Fixes",
      detail: "Context-aware pull request generation on alert",
    },
  ];

  const handleNextSlide = () => {
    setSliderIndex((prev) => (prev + 1) % sliderItems.length);
  };

  const handlePrevSlide = () => {
    setSliderIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
  };

  const scrollToContent = () => {
    const target = document.getElementById("features-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full lg:h-screen lg:max-h-screen min-h-screen bg-black text-white overflow-hidden flex flex-col justify-between select-none">
      
      {/* =========================================================================
          BACKGROUND VIDEO (Continuous Loop, Subtle Blur)
          ========================================================================= */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none filter blur-[1px] scale-105 z-0"
      >
        <source src="/spacebg.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Vignette & Readability Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10" 
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.6) 80%, rgba(0, 0, 0, 0.85) 100%)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* =========================================================================
          TOP NAVIGATION BAR
          ========================================================================= */}
      <header className="relative z-40 w-full px-6 md:px-12 lg:px-16 pt-5 sm:pt-6 pb-2 flex items-center justify-between max-w-[1700px] mx-auto">
        
        {/* Brand Logo: Official Nemesys Logo on Top Left */}
        <a href="#" className="flex items-center no-underline transition-opacity hover:opacity-85">
          <Image
            src="/icon.png"
            alt="Nemesys Logo"
            width={140}
            height={40}
            priority
            className="h-8 sm:h-9 md:h-10 w-auto object-contain mix-blend-screen"
          />
        </a>

        {/* Center Nav Links with active dot indicator */}
        <nav className="hidden lg:flex items-center gap-8 text-[13.5px] font-medium text-white/70">
          <a href="#" className="relative py-1 text-white font-semibold no-underline flex flex-col items-center">
            <span>Home</span>
            <span className="w-1 h-1 rounded-full bg-white mt-1 shadow-[0_0_8px_white]"></span>
          </a>
          
          <a href="#product" className="flex items-center gap-1 hover:text-white transition-colors no-underline">
            <span>Product</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </a>

          <a href="#scanner" className="hover:text-white transition-colors no-underline">
            Scanner
          </a>

          <a href="#vulnerabilities" className="hover:text-white transition-colors no-underline">
            Vulnerabilities
          </a>

          <a href="#docs" className="hover:text-white transition-colors no-underline">
            Docs
          </a>

          <a href="#partners" className="hover:text-white transition-colors no-underline">
            Partners
          </a>
        </nav>

        {/* Right Info: Timezone / Date & Menu Pill Button (Mobile ONLY) */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">
              Timezone
            </span>
            <span className="text-xs font-semibold text-white/90 tabular-nums">
              {timeString}
            </span>
          </div>

          {/* Menu Button: Visible ONLY on Mobile / Tablet (< lg screens) */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Toggle Menu"
          >
            <span className="text-xs font-bold leading-none">=</span>
            <span className="tracking-wider">MENU</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end">
          <div className="w-4/5 max-w-sm bg-[#0e0f14] border-l border-white/10 h-full shadow-2xl p-8 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Image
                  src="/logo.png"
                  alt="Nemesys Logo"
                  width={120}
                  height={34}
                  className="h-7 w-auto object-contain mix-blend-screen"
                />
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-8 text-base font-medium text-white/80">
                <a 
                  href="#" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-white/10 font-semibold text-white"
                >
                  Home
                </a>
                <a 
                  href="#product" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  Product
                </a>
                <a 
                  href="#scanner" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  Scanner
                </a>
                <a 
                  href="#vulnerabilities" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  Vulnerabilities
                </a>
                <a 
                  href="#docs" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  Docs
                </a>
                <a 
                  href="#partners" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-white/5"
                >
                  Partners
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="text-xs text-white/50 mb-2">Timezone / Status</div>
              <div className="text-xs font-mono font-medium text-white/90 mb-4">{timeString}</div>
              <a 
                href="/login" 
                className="w-full py-3 bg-white text-black rounded-full text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-neutral-200 transition"
              >
                Launch Console <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN HERO BODY (Wide 2-Column Editorial Composition)
          ========================================================================= */}
      <div className="relative z-20 flex-1 max-w-[1700px] w-full mx-auto px-6 md:px-12 lg:px-16 py-2 sm:py-4 lg:py-2 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        
        {/* =======================================================================
            LEFT COLUMN: Editorial Kicker, Headline, Rating, Dual CTAs
            ======================================================================= */}
        <div className="flex-1 w-full lg:max-w-[560px] xl:max-w-[640px] flex flex-col items-start z-30">
          
          {/* Tag / Kicker matching "| Creative Agency" */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/40 font-serif font-light text-base leading-none">|</span>
            <span className="text-[11px] md:text-xs font-semibold tracking-wider uppercase text-white/70">
              Security Intelligence
            </span>
          </div>

          {/* Headline matching "We start from zero, delivering only what mat[ters]" */}
          <h1 className="text-[2.5rem] sm:text-[3.2rem] md:text-[3.7rem] lg:text-[4.1rem] xl:text-[4.5rem] font-bold tracking-[-0.035em] leading-[1.03] text-white mb-5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            We scan from <br />
            zero, delivering <br />
            only what matters.
          </h1>

          {/* Ratings Social Proof matching "★★★★★ 3000+ Customers" */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <div className="flex items-center text-[#ff781f] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#ff781f] text-[#ff781f]" />
              ))}
            </div>
            <span className="text-xs font-semibold tracking-tight text-white/80 ml-1">
              3000+ Repos Secured
            </span>
          </div>

          {/* Dual Action Buttons matching "Chat With Us ->" and "Our Works" */}
          <div className="flex items-center flex-wrap gap-3.5">
            {/* Primary Pill Button with White Circular Arrow Badge */}
            <a 
              href="/login" 
              className="inline-flex items-center gap-3.5 pl-6 pr-2.5 py-2.5 rounded-full bg-white text-black font-semibold text-[13.5px] shadow-lg shadow-black/30 hover:bg-neutral-200 transition-all duration-200 group no-underline active:scale-95"
            >
              <span>Scan Your Code</span>
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </a>

            {/* Secondary Frosted Pill Button */}
            <button 
              onClick={scrollToContent}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-[13.5px] font-medium text-white transition-all duration-200 cursor-pointer active:scale-95"
            >
              Live Analysis
            </button>
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN: Interactive Telemetry Card & Partner Logos
            (Matching the "Design to explore" card and "Our Partners" section)
            ======================================================================= */}
        <div className="w-full lg:w-auto lg:min-w-[360px] xl:min-w-[400px] flex flex-col items-start lg:items-end justify-between z-30 space-y-6 sm:space-y-8">
          
          {/* Interactive Modern Portfolio Card Widget */}
          <div className="w-full max-w-[380px] bg-white/[0.08] border border-white/20 rounded-[28px] p-5 shadow-2xl backdrop-blur-2xl">
            
            {/* Dark Sub-Card Tile */}
            <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white mb-4 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <Cpu className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[10.5px] font-mono uppercase tracking-wider text-neutral-400">
                    {sliderItems[sliderIndex].tag}
                  </div>
                  <div className="text-xs font-bold text-white">
                    {sliderItems[sliderIndex].metric}
                  </div>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70">
                <span className="text-xs font-bold font-mono">0{sliderIndex + 1}</span>
              </div>
            </div>

            {/* Content & Heading matching "Design to explore." */}
            <div className="px-1 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                {sliderItems[sliderIndex].title}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {sliderItems[sliderIndex].detail}
              </p>
            </div>

            {/* Slider Track & Navigation Arrow Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 px-1">
              {/* Progress dots / bar */}
              <div className="flex items-center gap-1.5">
                {sliderItems.map((_, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSliderIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      sliderIndex === idx ? "w-6 bg-white shadow-[0_0_8px_white]" : "w-1.5 bg-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation circle buttons matching "<" and ">" */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevSlide}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextSlide}
                  className="w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center transition-all duration-150 active:scale-95 shadow-sm cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Partner / Ecosystem Logos matching "Our Partners" */}
          <div className="w-full max-w-[380px] flex flex-col items-start lg:items-end">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-white/50 mb-2.5">
              Our Partners
            </span>
            
            {/* Monochrome minimalist brand logos grid */}
            <div className="w-full grid grid-cols-3 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-white/70">
              <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight hover:text-white transition-colors">
                <span className="font-mono text-sm">✦</span> GitHub
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight hover:text-white transition-colors">
                <span className="font-mono text-sm">❖</span> GitLab
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight hover:text-white transition-colors">
                <span className="font-mono text-sm">▲</span> Vercel
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight hover:text-white transition-colors">
                <span className="font-mono text-sm">◈</span> Docker
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight hover:text-white transition-colors">
                <span className="font-mono text-sm">☁</span> AWS
              </div>
              <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight hover:text-white transition-colors">
                <span className="font-mono text-sm">⬡</span> Node.js
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
          OVERSIZED BRAND TEXT: "NEMESYS" (Replacing "ZENRIXA")
          Clear, visible metallic silver/white gradient positioned right above the bottom dock
          ========================================================================= */}
      <div className="relative w-full pointer-events-none select-none flex items-center justify-center overflow-hidden leading-none z-20 -my-2 sm:-my-4 lg:-my-6">
        <span 
          className="text-[14.5vw] sm:text-[15.5vw] lg:text-[16.5vw] font-black tracking-[-0.035em] uppercase text-center block w-full whitespace-nowrap"
          style={{
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0.01) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 35px rgba(255, 255, 255, 0.12)",
          }}
        >
          NEMESYS
        </span>
      </div>

      {/* =========================================================================
          FLOATING BOTTOM CAPSULE DOCK (Matching the frosted dock at bottom)
          "• 99.8% AST Precision" | "• Static Taint Analysis Engine" | "Scroll Down"
          ========================================================================= */}
      <div className="relative z-30 w-full px-6 pb-4 sm:pb-6 pt-1 flex items-center justify-center">
        <div className="w-full max-w-[920px] bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-2xl rounded-full py-2.5 sm:py-3 px-6 sm:px-10 shadow-2xl flex items-center justify-between text-white/90 text-[11px] sm:text-xs font-semibold tracking-wide transition-all duration-300">
          
          {/* Left item */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span>99.8% AST Precision</span>
          </div>

          {/* Center item */}
          <div className="hidden sm:flex items-center gap-2 text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>Static Taint Analysis Engine</span>
          </div>

          {/* Right item with click to scroll */}
          <button 
            onClick={scrollToContent}
            className="flex items-center gap-1.5 text-white hover:text-cyan-300 transition-colors cursor-pointer group"
          >
            <span>Scroll Down</span>
            <ArrowDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
          </button>

        </div>
      </div>

    </section>
  );
}
