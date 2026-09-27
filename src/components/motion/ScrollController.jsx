"use client";

import { useEffect, useImperativeHandle, forwardRef, useRef } from "react";

/**
 * Ref-driven ScrollTrigger adapter. `onProgress` is intentionally imperative
 * so WebGL/canvas scenes can update without React renders on scroll.
 */
export const ScrollController = forwardRef(function ScrollController(
  { trigger, start = "top bottom", end = "bottom top", scrub = true, onProgress },
  ref
) {
  const progressRef = useRef(0);
  const triggerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getProgress: () => progressRef.current,
    refresh: () => triggerRef.current?.refresh(),
  }), []);

  useEffect(() => {
    let active = true;
    let scrollTrigger;
    (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!active || !trigger) return;
      gsap.registerPlugin(ScrollTrigger);
      scrollTrigger = ScrollTrigger.create({
        trigger,
        start,
        end,
        scrub,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          onProgress?.(self.progress, self);
        },
      });
      triggerRef.current = scrollTrigger;
    })();
    return () => {
      active = false;
      scrollTrigger?.kill();
      triggerRef.current = null;
    };
  }, [trigger, start, end, scrub, onProgress]);

  return null;
});
