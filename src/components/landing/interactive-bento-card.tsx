"use client";

import { cn } from "@/lib/utils";
import React,{ useRef,useState } from "react";

interface InteractiveBentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function InteractiveBentoCard({
  children,
  className,
  glowColor = "rgba(var(--primary-rgb, 255, 90, 95), 0.15)",
}: InteractiveBentoCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative h-full rounded-3xl border border-border/80 bg-card overflow-hidden transition-all duration-300 ease-out",
        "hover:-translate-y-2 hover:shadow-2xl hover:border-primary/50",
        className
      )}
    >
      {/* Radial Spotlight follows cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Shimmer light sweep */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-1000 ease-in-out z-0" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
