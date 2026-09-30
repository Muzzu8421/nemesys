"use client";

import React from "react";

export function TracePath({ registerPathRef, registerTracerRef, registerMobilePathRef, registerMobileTracerRef }) {
  return (
    <>
      <svg className="pointer-events-none absolute left-0 top-1/2 z-0 hidden h-10 w-full -translate-y-1/2 overflow-visible md:block" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 20 H950" fill="none" stroke="rgba(242,239,230,0.12)" strokeWidth="1" strokeDasharray="4 6" />
        <path ref={registerPathRef} d="M50 20 H950" fill="none" stroke="#D92C24" strokeWidth="2" strokeDasharray="900" strokeDashoffset="900" style={{ filter: "drop-shadow(0 0 7px rgba(217,44,36,.95))" }} />
        <circle ref={registerTracerRef} cx="50" cy="20" r="5" fill="#D92C24" style={{ filter: "drop-shadow(0 0 8px #D92C24)", opacity: 0 }} />
      </svg>
      <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible md:hidden" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        <path d="M250 100 H750 V300 H250 V500 H750" fill="none" stroke="rgba(242,239,230,0.12)" strokeWidth="2" strokeDasharray="6 9" />
        <path ref={registerMobilePathRef} d="M250 100 H750 V300 H250 V500 H750" fill="none" stroke="#D92C24" strokeWidth="3" strokeDasharray="1300" strokeDashoffset="1300" style={{ filter: "drop-shadow(0 0 8px rgba(217,44,36,.95))" }} />
        <circle ref={registerMobileTracerRef} cx="250" cy="100" r="8" fill="#D92C24" style={{ filter: "drop-shadow(0 0 9px #D92C24)", opacity: 0 }} />
      </svg>
    </>
  );
}
