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
      // The robot is centered in the source composition. Keep that focal point
      // in portrait crops instead of applying the former desktop offset.
      oX = (cW - dW) * 0.5;
    }

    ctx.clearRect(0, 0, cW, cH);
    ctx.drawImage(img, oX, oY, dW, dH);
  };

  const loadFrame = (frameIndex) => {
    if (typeof window === "undefined") return null;

    const index = Math.max(0, Math.min(totalFrames - 1, Math.round(frameIndex)));
    const images = imagesRef.current;
    if (images[index]) return images[index];

    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => {
      if (Math.round(playheadRef.current.frame) === index) drawFrame(index);
    };
    image.src = getFrameUrl(index);
    images[index] = image;
    return image;
  };

  const preloadFrameWindow = (frameIndex) => {
    if (typeof window === "undefined") return;

    const current = Math.max(0, Math.min(totalFrames - 1, Math.round(frameIndex)));
    const width = window.innerWidth;
    const { behind, ahead } = width < 640
      ? { behind: 2, ahead: 6 }
      : width < 1024
        ? { behind: 4, ahead: 10 }
        : { behind: 6, ahead: 18 };

    // Prioritize the frame under the playhead and upcoming scroll direction.
    loadFrame(current);
    for (let offset = 1; offset <= ahead; offset += 1) loadFrame(current + offset);
    for (let offset = 1; offset <= behind; offset += 1) loadFrame(current - offset);
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
    preloadFrameWindow(playheadRef.current.frame);
  };

  // Expose imperative handle for GSAP control
  useImperativeHandle(ref, () => ({
    setFrame(frameIndex) {
      playheadRef.current.frame = frameIndex;
      preloadFrameWindow(frameIndex);
    },
    getPlayhead() {
      return playheadRef.current;
    },
    getTotalFrames() {
      return totalFrames;
    },
    forceRender() {
      preloadFrameWindow(playheadRef.current.frame);
      drawFrame(playheadRef.current.frame);
    },
  }));

  useEffect(() => {
    // Frame zero renders immediately; subsequent requests follow the
    // scroll playhead instead of preloading the full sequence on entry.
    loadFrame(0);
    preloadFrameWindow(0);
    window.addEventListener("resize", resize);
    resize();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [totalFrames, frameBaseUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[0] block pointer-events-none"
    />
  );
});
