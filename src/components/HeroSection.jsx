"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subtle ink-textured styling for the main typography using CSS background-clip
  const inkBleedWhite = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E"), linear-gradient(#F2EFE6, #F2EFE6)`,
    backgroundBlendMode: 'multiply',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const inkBleedRed = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.25'/%3E%3C/svg%3E"), linear-gradient(#D92C24, #D92C24)`,
    backgroundBlendMode: 'multiply',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] bg-black overflow-hidden flex flex-col">
      
      {/* ── SVG FILTERS (For scribbles and button edges) ───────────── */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="rough-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" seed="1" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* ── BACKGROUND IMAGE ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/image1.jpg"
          alt="Hero background"
          fill
          priority
          quality={95}
          className="object-cover object-[center_top] w-full h-full"
          sizes="100vw"
        />
      </div>

      {/* ── LOCALIZED OVERLAYS FOR TEXT READABILITY ──────────────────── */}
      {/* Removed artificial backdrops/blur as requested to display image natively */}

      {/* ── TARGET CROSSHAIR (Left edge) ─────────────────────────────── */}
      <div className="absolute left-[-15px] top-[45%] z-[10] w-[60px] h-[60px] pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-80" style={{ filter: "url(#rough-edge)" }}>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#D92C24" strokeWidth="2.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#D92C24" strokeWidth="2.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#D92C24" strokeWidth="2.5" />
        </svg>
      </div>

      {/* ── NAVIGATION ───────────────────────────────────────────────── */}
      <header className="relative z-[20] flex items-center justify-between px-[clamp(16px,3vw,52px)] py-[clamp(14px,2.5vh,28px)] shrink-0">
        <a href="#" className="flex items-center gap-1.5 no-underline shrink-0 group">
          <span className="text-[#D92C24] text-[0.85rem] leading-none">▲</span>
          <span className="font-[family-name:var(--font-anton)] text-[clamp(1.1rem,1.8vw,1.5rem)] text-[#F2EFE6] tracking-[0.05em] uppercase leading-none drop-shadow-md">
            NEMESYS
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-[clamp(16px,2.5vw,40px)] absolute left-1/2 -translate-x-1/2">
          {["Features", "How It Works", "Pricing", "Docs", "Blog"].map((item) => (
            <a key={item} href="#" className="font-[family-name:var(--font-space-mono)] text-[clamp(0.6rem,0.8vw,0.75rem)] font-medium text-[#E8E3D7]/75 uppercase tracking-[0.1em] hover:text-[#F2EFE6] transition-colors whitespace-nowrap">
              {item}
            </a>
          ))}
        </nav>

        <a href="#" className="hidden md:inline-flex items-center gap-1.5 px-[clamp(12px,1.5vw,22px)] py-[clamp(5px,0.8vh,8px)] border-[1.5px] border-[#E8E3D7]/40 bg-black/50 text-[#F2EFE6] font-[family-name:var(--font-space-mono)] font-bold text-[clamp(0.6rem,0.8vw,0.75rem)] uppercase tracking-[0.1em] shrink-0 transition-colors hover:bg-[#E8E3D7]/15 hover:border-[#E8E3D7]/80 shadow-sm [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,6px_100%,0_calc(100%-6px))]">
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

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
      <div className="relative z-[15] flex-1 flex items-end px-[clamp(16px,3vw,52px)] pb-[clamp(32px,6vh,64px)] max-w-full lg:max-w-[62%]">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col w-full relative">

          {/* Main Headline: SECURE / YOUR / CODE */}
          <div className="relative flex flex-col leading-[0.92] mb-[clamp(8px,2vh,20px)] mt-auto pt-[clamp(20px,4vh,60px)] z-[20] [filter:drop-shadow(4px_4px_0_#000)_drop-shadow(-1px_-1px_0_#000)_drop-shadow(0_15px_40px_rgba(0,0,0,0.9))]">
            
            <div className="font-[family-name:var(--font-anton)] font-normal text-[clamp(4.5rem,9.5vw,11.5rem)] uppercase tracking-[-0.02em]">
              <div style={inkBleedWhite}>SECURE</div>
              <div className="flex flex-wrap items-baseline mt-1">
                <span style={inkBleedWhite} className="mr-[clamp(10px,2vw,20px)]">YOUR</span>
                <span className="relative inline-block">
                  <span style={inkBleedRed} className="relative z-10">CODE</span>
                  
                  {/* Signature red scribble exactly under CODE */}
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

          {/* Supporting description (IBM Plex Mono for editorial copy) */}
          <p className="font-[family-name:var(--font-ibm-plex)] font-medium text-[clamp(14px,1.2vw,16px)] text-[#E8E3D7]/90 leading-[1.45] max-w-[clamp(280px,36vw,540px)] m-0 mb-[clamp(16px,3vh,32px)] tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.9)] relative z-[10]">
            NEMESYS helps developers find and fix security<br className="hidden sm:block"/>
            vulnerabilities in their code using advanced<br className="hidden sm:block"/>
            static analysis and AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-[clamp(12px,2vw,24px)] flex-wrap mb-[clamp(24px,4vh,48px)] relative z-[10]">
            
            {/* Primary Ripped Tape Button */}
            <a href="#" className="relative group inline-flex items-center justify-center px-[clamp(20px,3vw,36px)] py-[clamp(12px,2vh,20px)] no-underline">
              {/* SVG Rough Background */}
              <svg className="absolute inset-0 w-full h-full text-[#D92C24] transition-colors group-hover:text-[#E52B2B]" preserveAspectRatio="none" viewBox="0 0 200 60" style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.7)) url(#rough-edge)" }}>
                <path d="M5,10 Q25,3 100,5 T195,8 Q198,30 194,52 Q100,58 6,55 Q2,30 5,10 Z" fill="currentColor" />
              </svg>
              <span className="relative z-10 font-[family-name:var(--font-space-mono)] text-[clamp(0.75rem,1vw,0.9rem)] font-bold text-[#F2EFE6] uppercase tracking-[0.08em] flex items-center gap-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
                Get Started Free <span className="text-[1.2em]">→</span>
              </span>
            </a>

            {/* Secondary Rough Outline Button */}
            <a href="#" className="relative group inline-flex items-center justify-center px-[clamp(18px,2.8vw,32px)] py-[clamp(10px,1.8vh,18px)] no-underline">
              {/* SVG Rough Outline Background */}
              <svg className="absolute inset-0 w-full h-full text-[#E8E3D7] transition-all group-hover:text-[#F2EFE6]" preserveAspectRatio="none" viewBox="0 0 200 60" style={{ filter: "drop-shadow(3px 3px 0px rgba(0,0,0,0.5)) url(#rough-edge)" }}>
                <path d="M8,12 Q40,5 100,8 T192,12 Q196,30 190,50 Q100,55 10,50 Q4,30 8,12 Z" fill="rgba(0,0,0,0.4)" stroke="currentColor" strokeWidth="2.5" className="group-hover:fill-[rgba(232,227,215,0.1)] transition-all" />
              </svg>
              <span className="relative z-10 font-[family-name:var(--font-space-mono)] text-[clamp(0.75rem,1vw,0.9rem)] font-bold text-[#F2EFE6] uppercase tracking-[0.08em] flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.2em] h-[1.2em]">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                View on GitHub
              </span>
            </a>
          </div>

          {/* Statistics Block */}
          <div className="flex items-start gap-[clamp(16px,3vw,36px)] pt-[clamp(8px,1vh,16px)] relative z-[10]">
            <div className="flex flex-col gap-1.5 relative">
              <span className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none tracking-[-0.01em] [text-shadow:2px_2px_0_rgba(0,0,0,0.8)]">10K+</span>
              <span className="font-[family-name:var(--font-ibm-plex)] text-[clamp(10px,0.75vw,12px)] font-medium text-[#E8E3D7]/90 uppercase tracking-[0.05em] leading-[1.3]">Vulnerabilities<br />Detected</span>
            </div>
            
            {/* Red Diagonal Slash */}
            <div className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none opacity-80 select-none">/</div>
            
            <div className="flex flex-col gap-1.5 relative">
              <span className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none tracking-[-0.01em] [text-shadow:2px_2px_0_rgba(0,0,0,0.8)]">500+</span>
              <span className="font-[family-name:var(--font-ibm-plex)] text-[clamp(10px,0.75vw,12px)] font-medium text-[#E8E3D7]/90 uppercase tracking-[0.05em] leading-[1.3]">Projects<br />Secured</span>
            </div>
            
            {/* Red Diagonal Slash */}
            <div className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none opacity-80 select-none">/</div>
            
            <div className="flex flex-col gap-1.5 relative">
              <span className="font-[family-name:var(--font-anton)] text-[clamp(2.2rem,3.5vw,3.5rem)] text-[#D92C24] leading-none tracking-[-0.01em] [text-shadow:2px_2px_0_rgba(0,0,0,0.8)]">99%</span>
              <span className="font-[family-name:var(--font-ibm-plex)] text-[clamp(10px,0.75vw,12px)] font-medium text-[#E8E3D7]/90 uppercase tracking-[0.05em] leading-[1.3]">Developer<br />Satisfaction</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Handwritten Editorial Note (Caveat Bold) */}
      <div className="absolute right-[clamp(20px,4vw,60px)] bottom-[clamp(40px,8vh,100px)] z-[15] max-w-[clamp(160px,12vw,220px)] font-[family-name:var(--font-caveat)] font-bold text-[clamp(1.4rem,1.8vw,1.8rem)] leading-[1.1] text-[#E8E3D7]/90 -rotate-[4deg] opacity-95 pointer-events-none drop-shadow-[1px_2px_3px_rgba(0,0,0,0.6)]">
        BUILD <span className="text-[#D92C24]">SAFER</span> SOFTWARE<br/>
        FOR A <span className="text-[#D92C24]">STRONGER</span> TOMORROW.
      </div>

    </section>
  );
}
