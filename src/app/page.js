import CinematicHero from "@/components/CinematicHero";

export default function Home() {
  return (
    <div className="bg-black selection:bg-[#D92C24]/40 selection:text-[#F2EFE6]">
      {/* 
        Single Full-Screen Pinned Cinematic Experience:
        - Scroll-controlled extracted frame sequence on canvas
        - 01 HERO → 02 THE THREAT → 03 WHY NEMESYS → 04 HOW IT WORKS
        - Final frame reached → smooth scale-down into card → pin released
      */}
      <CinematicHero />

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[#F2EFE6]/5 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-16 justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-xs">
            <span className="font-[family-name:var(--font-anton)] text-[2rem] text-[#F2EFE6] tracking-[0.05em] uppercase leading-none">
              NEMESYS
            </span>
            <p className="font-[family-name:var(--font-ibm-plex)] text-[0.8rem] text-[#77736B] leading-[1.7]">
              Advanced static analysis and AI-powered security for modern development teams.
            </p>
            <div className="flex gap-3 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#D92C24]" />
              <div className="w-2 h-2 rounded-full bg-[#77736B]/40" />
              <div className="w-2 h-2 rounded-full bg-[#77736B]/40" />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-3">
              <h4 className="font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#F2EFE6] uppercase tracking-[0.2em] mb-1">Product</h4>
              {["Features", "How It Works", "Pricing", "Changelog"].map((item) => (
                <a key={item} href="#" className="font-[family-name:var(--font-ibm-plex)] text-[0.8rem] text-[#77736B] hover:text-[#F2EFE6] transition-colors">
                  {item}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#F2EFE6] uppercase tracking-[0.2em] mb-1">Docs</h4>
              {["Getting Started", "API Reference", "Integrations", "Security"].map((item) => (
                <a key={item} href="#" className="font-[family-name:var(--font-ibm-plex)] text-[0.8rem] text-[#77736B] hover:text-[#F2EFE6] transition-colors">
                  {item}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#F2EFE6] uppercase tracking-[0.2em] mb-1">Company</h4>
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <a key={item} href="#" className="font-[family-name:var(--font-ibm-plex)] text-[0.8rem] text-[#77736B] hover:text-[#F2EFE6] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#F2EFE6]/5">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#77736B] uppercase tracking-[0.1em]">
              © 2026 NEMESYS LTD. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8">
              {["PRIVACY", "TERMS OF USE"].map((item) => (
                <a key={item} href="#" className="font-[family-name:var(--font-space-mono)] text-[0.65rem] text-[#77736B] uppercase tracking-[0.1em] hover:text-[#F2EFE6] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
