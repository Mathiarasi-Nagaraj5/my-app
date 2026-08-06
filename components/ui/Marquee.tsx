"use client";

import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  speed?: number; // seconds
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  speed = 20,
  direction = "left",
  pauseOnHover = true,
  className = "",
}: MarqueeProps) {
  return (
    <div
      className={`overflow-hidden whitespace-nowrap ${className} ${
        pauseOnHover ? "group" : ""
      }`}
    >
      <div
        className={`inline-flex min-w-max gap-12 ${
          direction === "left"
            ? "animate-marquee"
            : "animate-marquee-reverse"
        } ${pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""}`}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}