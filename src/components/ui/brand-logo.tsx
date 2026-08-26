"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  href?: string;
}

export function BrandLogoIcon({ size = "md", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizeMap = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
    xl: "size-12",
  };

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeMap[size], "shrink-0 transition-transform duration-300 hover:scale-105", className)}
    >
      <defs>
        {/* Main continuous loop gradient */}
        <linearGradient id="cl-loop-grad" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="35%" stopColor="#7C3AED" />
          <stop offset="70%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>

        {/* Inner shadow/depth overlay */}
        <linearGradient id="cl-accent-glow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="0.4" />
        </linearGradient>

        <filter id="cl-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7C3AED" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Outer Continuous Mobius-Loop "C" Shape */}
      <path
        d="M85 30C75 18 58 15 42 22C24 30 14 48 16 68C18 86 32 102 52 105C72 108 90 95 96 78C97.5 73.5 94.5 69 90 69C85.5 69 82.5 72.5 80.5 76C75.5 87 61 93 48 88C35 83 27 70 28 57C29 44 38 33 50 30C60 27 70 31 77 38C80 41 85 41 88 38C91 35 90 31 85 30Z"
        fill="url(#cl-loop-grad)"
        filter="url(#cl-shadow)"
      />

      {/* Dynamic Inner Node Accent */}
      <circle cx="88" cy="35" r="9" fill="url(#cl-accent-glow)" />
      <circle cx="88" cy="35" r="5" fill="#FFFFFF" />
    </svg>
  );
}

export function BrandLogo({
  className,
  size = "md",
  showWordmark = true,
  href = "/app",
}: BrandLogoProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none group", className)}>
      <BrandLogoIcon size={size} />
      {showWordmark && (
        <span
          className={cn(
            "font-black tracking-tight text-foreground transition-colors group-hover:text-primary leading-none",
            size === "sm" && "text-sm",
            size === "md" && "text-lg",
            size === "lg" && "text-xl",
            size === "xl" && "text-2xl"
          )}
        >
          Campus<span className="text-primary font-black">Loop</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
