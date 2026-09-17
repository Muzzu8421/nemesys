"use client";

import React, { useEffect, useRef, useState } from "react";

export const ScrollFrames = ({
  totalFrames = 100,
  framePath = "/frames/frame-",
  extension = ".jpg",
}) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, "0");
      img.src = `${framePath}${paddedIndex}${extension}`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          setLoaded(true);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, [totalFrames, framePath, extension]);

  useEffect(() => {
    if (!loaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const render = (frameIndex) => {
      if (images[frameIndex]) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const img = images[frameIndex];
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    render(0);

    const playhead = { frame: 0 };

    // Need to dynamically import gsap/ScrollTrigger inside useEffect if there are SSR issues,
    // but this is a "use client" component and gsap should be fine here.
    const gsap = require("gsap").default || require("gsap");
    const { ScrollTrigger } = require("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0, // 0 because Lenis already handles the smoothing
      animation: gsap.to(playhead, {
        frame: totalFrames - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => render(playhead.frame)
      })
    });

    const handleResize = () => render(playhead.frame);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      st.kill();
    };
  }, [loaded, images, totalFrames]);

  return (
    <div className="fixed top-0 left-0 w-full h-screen -z-10 bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-80"
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
          Loading visual sequence...
        </div>
      )}
    </div>
  );
};
