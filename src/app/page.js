import Image from "next/image";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="bg-black font-sans selection:bg-neon-purple selection:text-white relative">
      
      {/* Editorial Hero Section matching Zenrixa reference layout */}
      <HeroSection />

      <main id="features-section" className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-24">

        {/* Large Highlighted Paragraph */}
        <section className="py-8 md:py-12 px-4 max-w-5xl mx-auto text-center">
          <p className="text-xl md:text-3xl lg:text-5xl font-medium leading-relaxed text-gray-400">
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
            <div className="glass-card lg:col-span-2 rounded-[2rem] p-6 md:p-12 flex flex-col lg:flex-row justify-between items-center group overflow-hidden gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Strategic Patch Management</h3>
                <p className="text-gray-400 text-sm md:text-base">When limits are hit, open vulnerabilities gracefully close, creating an opportunity for automated AI patch generation.</p>
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
          <div className="flex-1 flex items-center justify-center md:justify-start overflow-hidden">
            <div className="relative scale-50 md:scale-75 lg:scale-100 origin-center md:origin-left transform transition-transform">
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
              <div className="absolute top-1/2 left-[120%] -translate-y-1/2 text-4xl font-bold text-white tracking-widest hidden md:block">
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
