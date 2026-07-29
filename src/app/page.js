import Image from "next/image";
import { HackerBackground } from "@/components/ui/hacker-background";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-neon-purple selection:text-white">
      
      {/* ============================
          HERO SECTION
          ============================ */}
      <section className="hero-section">
        {/* Hacker Background */}
        <HackerBackground
          color="#22d3ee"
          fontSize={10}
          speed={2}
          className="opacity-80"
        />

        {/* Top Navbar */}
        <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5 md:py-6">
          <a href="#" className="flex items-center no-underline">
            <Image
              src="/logo.png"
              alt="Nemesys Logo"
              width={140}
              height={40}
              className="h-11 w-auto object-contain"
            />
          </a>

          <div className="hidden lg:flex items-center gap-0 bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-md">
            <a href="#" className="px-5 py-2 text-sm text-white/70 no-underline rounded-full transition-colors duration-200 font-normal whitespace-nowrap hover:text-white hover:bg-white/5">Product</a>
            <a href="#" className="px-5 py-2 text-sm text-white/70 no-underline rounded-full transition-colors duration-200 font-normal whitespace-nowrap hover:text-white hover:bg-white/5">Pricing</a>
            <a href="#" className="px-5 py-2 text-sm text-white/70 no-underline rounded-full transition-colors duration-200 font-normal whitespace-nowrap hover:text-white hover:bg-white/5">How it works</a>
            <a href="#" className="px-5 py-2 text-sm text-white/70 no-underline rounded-full transition-colors duration-200 font-normal whitespace-nowrap hover:text-white hover:bg-white/5">About</a>
            <a href="#" className="px-5 py-2 text-sm text-white/70 no-underline rounded-full transition-colors duration-200 font-normal whitespace-nowrap hover:text-white hover:bg-white/5">Resources</a>
            <a href="#" className="px-6 py-2 text-sm text-white bg-white/10 font-medium rounded-full ml-1 transition-all duration-200 hover:bg-white/20 whitespace-nowrap">Get started</a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between px-8 md:px-12 pt-16 md:pt-20 pb-16 gap-10 md:gap-16 max-w-[1400px] mx-auto">
          {/* Left side - Text */}
          <div className="flex-1 max-w-full lg:max-w-[550px] pt-5">
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.15] text-white mb-6 tracking-[-0.02em] italic">
              Your next big<br />
              <span className="text-accent-blue italic">decision</span> deserves<br />
              a straight answer
            </h1>
            <p className="text-base leading-[1.7] text-white/50 mb-10 max-w-[420px] font-light">
              Ask your finances anything, in plain English.<br />
              No more stitching together Stripe, accounting, and<br />
              spreadsheets — just answers, instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <a href="#" className="px-6 py-3 text-sm font-medium text-white bg-transparent border border-white/30 rounded-full cursor-pointer transition-all duration-300 no-underline hover:bg-white/10 hover:border-white/50">Get started</a>
              <a href="#" className="px-6 py-3 text-sm font-medium text-white bg-white/10 border border-white/10 rounded-full cursor-pointer transition-all duration-300 no-underline hover:bg-white/15 hover:border-white/20">See how it works</a>
            </div>
          </div>

          {/* Right side - Dashboard Mockup */}
          <div className="hero-dashboard">
            {/* Sidebar Panel (white/light) */}
            <div className="dashboard-sidebar">
              <div className="sidebar-header">
                <div className="sidebar-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="sidebar-brand">Nemesys</span>
              </div>

              <div className="sidebar-new-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New conversation
              </div>

              <div className="sidebar-label">Recent</div>
              <div className="sidebar-item">Q2 gross margin variance</div>
              <div className="sidebar-item">Runway with 3 new hires</div>
              <div className="sidebar-item">May burn vs plan</div>
              <div className="sidebar-item">ARR bridge for the board</div>
              <div className="sidebar-item">Vendor spend anomalies</div>
            </div>

            {/* Main Chat Panel (dark) */}
            <div className="dashboard-main">
              <div className="main-header">
                <div className="main-logo-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <div className="main-greeting">Good morning, A...</div>
                </div>
              </div>

              <div className="main-subtext">Ask anything about your numbers.</div>

              <div className="main-input-area">
                <div className="main-input-text">What changed since last month?</div>
                <div className="main-input-row">
                  <div className="main-input-avatar"></div>
                  <div className="main-input-select">
                    Fields 6 
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="main-suggestions">
                <div className="suggestion-chip">What's our runway if we hire 5 engineers?</div>
                <div className="suggestion-chip">Compare May &amp; ...</div>
                <div className="suggestion-chip">Which customers drive ARR this quarter?</div>
                <div className="suggestion-chip">Build the ARR bridge ...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-24">

        {/* Large Highlighted Paragraph */}
        <section className="py-12 px-4 max-w-5xl mx-auto text-center">
          <p className="text-2xl md:text-4xl lg:text-5xl font-medium leading-relaxed text-gray-400">
            Nemesys is the brainchild of a group who have <span className="text-neon-green font-semibold">linked up with elite cybersecurity engineers</span> and compiler designers to create an advanced static analysis system. This enterprise scanning console can <span className="text-neon-purple font-semibold">execute deep inspections on CRITICAL INFRASTRUCTURE</span>, which are <span className="text-neon-pink font-semibold">state-of-the-art in their nature!</span>
          </p>
        </section>

        {/* Bento Box Features Grid */}
        <section className="flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Elevate Your Security Pipeline</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Discover a new realm of threat protection with our state-of-the-art engine. Our AI-driven system revolutionizes the way you engage with code, providing timely alerts for vulnerabilities across various environments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Bento Large Card 1 */}
            <div className="glass-card lg:col-span-2 rounded-[2rem] p-8 md:p-12 flex flex-col justify-between group overflow-hidden">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">Dynamic Alert System</h3>
                <p className="text-gray-400 max-w-md">Our console is equipped with a dynamic alert system that triggers automatic notifications for critical vulnerabilities.</p>
              </div>
              {/* UI Mockup embedded in card */}
              <div className="ui-mockup-window w-full max-w-md mx-auto group-hover:transform group-hover:scale-105 transition-transform duration-500">
                <div className="ui-header"><div className="ui-dot r"/><div className="ui-dot y"/><div className="ui-dot g"/></div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="bg-black/50 p-4 rounded-lg border border-red-500/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold">!</div>
                    <div>
                      <p className="text-white font-semibold text-sm">Critical SQL Injection</p>
                      <p className="text-red-400 text-xs">src/api/users.js - Line 42</p>
                    </div>
                  </div>
                  <div className="bg-black/50 p-4 rounded-lg border border-yellow-500/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">?</div>
                    <div>
                      <p className="text-white font-semibold text-sm">Unsafe Dependency</p>
                      <p className="text-yellow-400 text-xs">package.json - lodash@4.17.15</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Small Card 1 */}
            <div className="glass-card lg:col-span-1 rounded-[2rem] p-8 md:p-12 flex flex-col items-center text-center justify-center group overflow-hidden">
              <div className="h-48 flex items-center justify-center mb-6">
                <div className="geo-cube animate-float">
                  <div className="front"></div><div className="back"></div><div className="right"></div>
                  <div className="left"></div><div className="top"></div><div className="bottom"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Deep Analysis</h3>
              <p className="text-gray-400 text-sm">Tracks dependencies and vulnerabilities seamlessly.</p>
            </div>

            {/* Bento Small Card 2 */}
            <div className="glass-card lg:col-span-1 rounded-[2rem] p-8 md:p-12 flex flex-col items-center text-center justify-center group overflow-hidden">
              <div className="h-48 flex items-center justify-center mb-6">
                <div className="geo-cylinder animate-float-delayed mt-10"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Data Integrity</h3>
              <p className="text-gray-400 text-sm">Ensuring your databases remain impenetrable.</p>
            </div>

            {/* Bento Large Card 2 */}
            <div className="glass-card lg:col-span-2 rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center group overflow-hidden gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">Strategic Patch Management</h3>
                <p className="text-gray-400">When limits are hit, open vulnerabilities gracefully close, creating an opportunity for automated AI patch generation.</p>
              </div>
              <div className="flex-1 ui-mockup-window w-full h-48 flex items-end p-4 gap-2 group-hover:opacity-80 transition-opacity">
                {/* Fake Chart bars */}
                {[40, 70, 30, 90, 50, 80, 20, 60, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-neon-cyan/50 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Massive Footer */}
      <footer className="mt-32 border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-16 md:gap-8 justify-between">
          
          {/* Giant Logo Left Side */}
          <div className="flex-1 flex items-center justify-center md:justify-start">
            <div className="relative">
              {/* Giant Glowing Triangle */}
              <div className="w-0 h-0 
                border-l-[100px] border-l-transparent
                border-b-[180px] border-b-neon-green
                border-r-[100px] border-r-transparent
                filter drop-shadow-[0_0_50px_rgba(34,197,94,0.6)]
                opacity-80
                transform -rotate-12
              "></div>
              {/* Inner cutout for styling */}
              <div className="w-0 h-0 
                border-l-[80px] border-l-transparent
                border-b-[150px] border-b-black
                border-r-[80px] border-r-transparent
                absolute top-6 left-5
                transform -rotate-12
              "></div>
              <div className="absolute top-1/2 left-[120%] -translate-y-1/2 text-4xl font-bold text-white tracking-widest hidden lg:block">
                NEMESYS
              </div>
            </div>
          </div>

          {/* Links Right Side */}
          <div className="flex-[1.5] grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold mb-2">Services</h4>
              <a href="#" className="text-gray-400 hover:text-white">Basis</a>
              <a href="#" className="text-gray-400 hover:text-white">Market</a>
              <a href="#" className="text-gray-400 hover:text-white">Trading Station</a>
              <a href="#" className="text-gray-400 hover:text-white">Console</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold mb-2">Learn</h4>
              <a href="#" className="text-gray-400 hover:text-white">Track Record</a>
              <a href="#" className="text-gray-400 hover:text-white">Tokenomics</a>
              <a href="#" className="text-gray-400 hover:text-white">Roadmap</a>
              <a href="#" className="text-gray-400 hover:text-white">Whitepaper</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold mb-2">About</h4>
              <a href="#" className="text-gray-400 hover:text-white">Company</a>
              <a href="#" className="text-gray-400 hover:text-white">Team</a>
              <a href="#" className="text-gray-400 hover:text-white">Roadmap</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center border border-yellow-500/20 rounded-xl p-4 bg-yellow-500/5">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold mb-2">!</div>
              <p className="text-yellow-500 text-xs text-center">This site has a fancy design</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>Copyright 2026 Nemesys Ltd. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">PRIVACY</a>
              <a href="#" className="hover:text-white">TERMS OF USE</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
