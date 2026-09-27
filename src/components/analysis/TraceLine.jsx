"use client";

import React from "react";

export function TraceLine({ registerTraceLineRef }) {
  return (
    <div ref={registerTraceLineRef} className="absolute bottom-auto left-4 top-[4.3rem] w-px bg-[#D92C24] shadow-[0_0_10px_#D92C24] will-change-transform md:left-6" style={{ height: 0, opacity: 0 }}>
      <i className="absolute -left-[3px] -top-1 h-[7px] w-[7px] rounded-full bg-[#D92C24] shadow-[0_0_10px_#D92C24]" />
    </div>
  );
}
