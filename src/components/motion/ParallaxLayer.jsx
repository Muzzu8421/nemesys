"use client";

import React, { useLayoutEffect, useRef } from "react";

/** Lightweight transform-only parallax layer with automatic GSAP cleanup. */
export function ParallaxLayer({ children, trigger, speed = 0.08, className = "" }) {
  const layerRef = useRef(null);

  useLayoutEffect(() => {
    let active = true;
    let context;
    (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!active || !layerRef.current || !trigger || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        gsap.to(layerRef.current, {
          yPercent: speed * -100,
          ease: "none",
          scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true },
        });
      }, layerRef);
    })();
    return () => {
      active = false;
      context?.revert();
    };
  }, [trigger, speed]);

  return <div ref={layerRef} className={`will-change-transform ${className}`}>{children}</div>;
}
