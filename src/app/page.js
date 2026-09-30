import CinematicExperience from "@/components/experience/CinematicExperience";

export default function Home() {
  return (
    <div className="bg-black selection:bg-[#D92C24]/40 selection:text-[#F2EFE6]">
      {/* 
        NEMESYS — Cinematic Architecture:
        - 01 Cinematic Hero (scroll-controlled frame sequence 0-25%)
        - 02 Threat Trace (living data-flow security trace 25-45%)
        - 03 Security Topology (3D spatial code graph in Three.js 45-70%)
        - 04 Analysis Core (continuous instrumentation INPUT→TRACE→DETECT→FIX 70-90%)
        - Final state: smooth scale-down into card (90-100%) and pin release
      */}
      <CinematicExperience />

      <footer className="border-t border-[#F2EFE6]/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6">
          <span className="font-[family-name:var(--font-anton)] text-xl tracking-[0.05em] text-[#F2EFE6]">NEMESYS</span>
          <p className="font-[family-name:var(--font-space-mono)] text-[0.6rem] uppercase tracking-[0.1em] text-[#77736B]">© 2026 NEMESYS</p>
        </div>
      </footer>
    </div>
  );
}
