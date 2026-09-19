"use client";
import { useRef, useEffect } from "react";
import { motion, useInView, useAnimation, useMotionValue, useMotionTemplate } from "framer-motion";

// Highly Optimized BlurText
export const BlurText = ({ text, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  const words = text.split(" ");
  return (
    <motion.div ref={ref} className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { filter: "blur(8px)", opacity: 0, y: 10 },
            visible: { filter: "blur(0px)", opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.4, delay: delay + i * 0.04, ease: "easeOut" }}
          className="inline-block mr-[0.25em] will-change-transform will-change-filter"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Highly Optimized SpotlightCard (uses MotionValues instead of React State to eliminate re-render lag)
export const SpotlightCard = ({ children, className = "" }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(192,132,252,0.08), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

// Highly Optimized SplitText
export const SplitText = ({ text, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const chars = text.split("");

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.3, delay: delay + i * 0.02 }}
          className="inline-block will-change-transform"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
};

// Static Aurora (Animating huge blurred divs kills GPU performance. This static + CSS mix-blend approach is buttery smooth)
export const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0a0a0a]">
    <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full opacity-[0.12] blur-[120px] bg-[#c084fc] mix-blend-screen" />
    <div className="absolute top-[40%] right-[0%] w-[50vw] h-[50vw] rounded-full opacity-[0.08] blur-[120px] bg-[#818cf8] mix-blend-screen" />
  </div>
);

// Cyber Hacker Rain Background
export const HackerBackground = ({ color = "#a855f7", fontSize = 10, speed = 2, className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const characters = "01010101ASTSECUREVULNTAINTXSSSQLI01";
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speed * 0.5;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, fontSize, speed]);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
};