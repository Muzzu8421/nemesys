"use client";

import React, { useLayoutEffect, useRef } from "react";

/**
 * Standalone editorial text reveal for content outside the master experience
 * timeline. For scrubbed scene copy, pass refs to the existing timeline instead.
 */
export function SplitReveal({
  text,
  by = "word",
  trigger,
  start = "top 82%",
  stagger = 0.06,
  className = "",
  wordClassName = "",
}) {
  const rootRef = useRef(null);
  const parts = by === "line" ? text.split("\n") : text.split(" ");

  useLayoutEffect(() => {
    let active = true;
    let context;
    (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!active || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const items = rootRef.current.querySelectorAll("[data-split-part]");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      context = gsap.context(() => {
        gsap.fromTo(items,
          { clipPath: "inset(0 100% 0 0)", filter: reducedMotion ? "none" : "blur(8px)", y: reducedMotion ? 0 : 14, opacity: 0 },
          {
            clipPath: "inset(0 0% 0 0)",
            filter: "blur(0px)",
            y: 0,
            opacity: 1,
            duration: reducedMotion ? 0.01 : 0.75,
            stagger: reducedMotion ? 0 : stagger,
            ease: "power3.out",
            scrollTrigger: trigger ? { trigger, start, once: true } : undefined,
          }
        );
      }, rootRef);
    })();
    return () => {
      active = false;
      context?.revert();
    };
  }, [trigger, start, stagger]);

  return (
    <span ref={rootRef} className={className} aria-label={text}>
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          <span data-split-part className={`inline-block will-change-transform ${wordClassName}`}>{part}</span>
          {by === "word" && index < parts.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}
