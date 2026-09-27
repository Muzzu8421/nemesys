"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const TOTAL_FRAMES = 227;

/**
 * FrameSequenceCanvas
 * Highly optimized canvas-based video frame sequence renderer.
 * Handles intelligent progressive preloading, 16:9 aspect ratio cover,
 * and high-DPI crisp rendering outside React state updates.
 */
export const FrameSequenceCanvas = forwardRef(function FrameSequenceCanvas(
  { totalFrames = TOTAL_FRAMES, frameBaseUrl = "/frames/frame-" },
  ref
) {
  const canvasRef = useRef(null);
  const imagesRef = useRef(new Array(totalFrames));
  const playheadRef = useRef({ frame: 0 });
  const lastDrawnFrameRef = useRef(-1);
  const rafIdRef = useRef(null);

  const getFrameUrl = (index) => {
    const num = String(index + 1).padStart(4, "0");
    return `${frameBaseUrl}${num}.webp`;
  };

  const drawFrame = (frameNum) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const idx = Math.max(0, Math.min(totalFrames - 1, Math.round(frameNum)));
    const images = imagesRef.current;

    // Retrieve exact or closest loaded frame
    let img = images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let r = 1; r < 25; r++) {
        const prev = images[idx - r];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
        const next = images[idx + r];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Draw in CSS pixels. The backing store is larger on high-DPI displays,
    // but using it here after the context scale would crop/zoom the frame.
    const cW = canvas.clientWidth || canvas.width;
    const cH = canvas.clientHeight || canvas.height;
    if (cW === 0 || cH === 0) return;

    const imgW = img.naturalWidth || 1920;
    const imgH = img.naturalHeight || 1080;
    const cRatio = cW / cH;
    const imgRatio = imgW / imgH;

    let dW, dH, oX = 0, oY = 0;
    if (cRatio > imgRatio) {
      dW = cW;
      dH = cW / imgRatio;
      oY = (cH - dH) / 2;
    } else {
      dH = cH;
      dW = cH * imgRatio;
      oX = (cW - dW) / 2;
    }

    ctx.clearRect(0, 0, cW, cH);
    ctx.drawImage(img, oX, oY, dW, dH);
    lastDrawnFrameRef.current = idx;
  };

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(playheadRef.current.frame);
  };

  // Expose imperative handle for GSAP control
  useImperativeHandle(ref, () => ({
    setFrame(frameIndex) {
      playheadRef.current.frame = frameIndex;
    },
    getPlayhead() {
      return playheadRef.current;
    },
    getTotalFrames() {
      return totalFrames;
    },
    forceRender() {
      drawFrame(playheadRef.current.frame);
    },
  }));

  useEffect(() => {
    const images = imagesRef.current;
    let isMounted = true;

    // 1. Instant load of frame 0 for zero-latency initial hero view
    const initialImg = new window.Image();
    initialImg.src = getFrameUrl(0);
    images[0] = initialImg;
    initialImg.onload = () => {
      if (isMounted) {
        resize();
        drawFrame(0);
      }
    };

    // 2. Intelligent progressive batch loading
    const loadRemainingFrames = () => {
      // Immediate batch (first 25 frames)
      for (let i = 1; i < Math.min(25, totalFrames); i++) {
        const img = new window.Image();
        img.src = getFrameUrl(i);
        images[i] = img;
      }

      // Medium priority: keyframes across the timeline (every 4th frame)
      for (let i = 25; i < totalFrames; i += 4) {
        const img = new window.Image();
        img.src = getFrameUrl(i);
        images[i] = img;
      }

      // Background fill-in
      for (let i = 25; i < totalFrames; i++) {
        if (!images[i]) {
          const img = new window.Image();
          img.src = getFrameUrl(i);
          images[i] = img;
        }
      }
    };

    const timer = setTimeout(loadRemainingFrames, 150);
    window.addEventListener("resize", resize);
    resize();

    // 3. Smooth rAF render loop
    const renderLoop = () => {
      if (Math.round(playheadRef.current.frame) !== lastDrawnFrameRef.current) {
        drawFrame(playheadRef.current.frame);
      }
      rafIdRef.current = requestAnimationFrame(renderLoop);
    };
    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [totalFrames, frameBaseUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[0] block pointer-events-none"
    />
  );
});
