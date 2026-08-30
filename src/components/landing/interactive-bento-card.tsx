"use client";

import type React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface InteractiveBentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function InteractiveBentoCard({
  children,
  className,
  glowColor = "rgba(255, 90, 95, 0.15)",
}: InteractiveBentoCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative h-full rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-1.5 hover:shadow-2xl hover:border-primary/50",
        className
      )}
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Radial Spotlight follows cursor at 120fps GPU speed */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Shimmer light sweep */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-1000 ease-in-out z-0" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">{children}</div>
    </div>
  );
}
