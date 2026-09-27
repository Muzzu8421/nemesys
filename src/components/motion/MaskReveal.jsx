"use client";

import React, { forwardRef } from "react";

/**
 * MaskReveal Component
 * Provides accessible, GPU-accelerated masked line/box reveals
 * with blur-to-sharp transitions and editorial offsets.
 */
export const MaskReveal = forwardRef(function MaskReveal(
  {
    children,
    as: Component = "div",
    className = "",
    style = {},
    direction = "up", // 'up' | 'left'
    ...props
  },
  ref
) {
  return (
    <Component
      ref={ref}
      className={`overflow-hidden will-change-transform ${className}`}
      style={{
        clipPath: direction === "left" ? "inset(0 100% 0 0)" : "inset(0 0 100% 0)",
        opacity: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * WordReveal Component
 * Splits text into individual masked word spans for editorial stagger.
 * Leaves an accessible aria-label on the parent container.
 */
export const WordReveal = forwardRef(function WordReveal(
  {
    text,
    className = "",
    wordClassName = "",
    highlightWords = [],
    highlightClass = "text-[#D92C24]",
    registerWordRef,
    ...props
  },
  ref
) {
  const words = text.split(" ");

  return (
    <div
      ref={ref}
      className={`flex flex-wrap items-baseline gap-x-[0.28em] gap-y-1 ${className}`}
      aria-label={text}
      {...props}
    >
      {words.map((word, i) => {
        const isHighlighted = highlightWords.includes(word.replace(/[^a-zA-Z]/g, ""));
        return (
          <span
            key={i}
            ref={(el) => {
              if (registerWordRef) registerWordRef(el, i);
            }}
            className={`inline-block overflow-hidden will-change-transform ${isHighlighted ? highlightClass : ""} ${wordClassName}`}
            style={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
});

/**
 * CharReveal Component
 * Splits short high-impact statements into individual character spans with 3D perspective.
 */
export const CharReveal = forwardRef(function CharReveal(
  {
    text,
    className = "",
    charClassName = "",
    registerCharRef,
    ...props
  },
  ref
) {
  const chars = text.split("");

  return (
    <div
      ref={ref}
      className={`inline-block overflow-hidden ${className}`}
      style={{ perspective: "800px" }}
      aria-label={text}
      {...props}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          ref={(el) => {
            if (registerCharRef) registerCharRef(el, i);
          }}
          className={`inline-block will-change-transform ${charClassName}`}
          style={{ opacity: 0 }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
});
