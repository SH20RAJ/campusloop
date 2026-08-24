"use client";

import { BrandLogoIcon } from "@/components/ui/brand-logo";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center gap-5">
        {/* Pulsing Ambient Glow */}
        <div className="absolute size-32 rounded-full bg-primary/20 blur-3xl animate-pulse" />

        {/* Brand Logo with Smooth Scale Animation */}
        <div className="relative z-10 animate-bounce duration-1000">
          <BrandLogoIcon size="xl" className="size-12 drop-shadow-lg" />
        </div>

        {/* Shimmering Progress Bar */}
        <div className="relative z-10 h-1 w-32 rounded-full bg-muted/60 overflow-hidden">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 via-primary to-purple-500 animate-[loading-progress_1.4s_ease-in-out_infinite]" />
        </div>

        {/* Status Text */}
        <p className="relative z-10 text-xs font-bold text-muted-foreground tracking-wide">
          Connecting to campus loop...
        </p>
      </div>
    </div>
  );
}
