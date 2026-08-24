"use client";

import { BrandLogoIcon } from "@/components/ui/brand-logo";

export default function MainAppLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center gap-4">
        {/* Ambient Violet Glow */}
        <div className="absolute size-28 rounded-full bg-primary/20 blur-3xl animate-pulse" />

        {/* Pulsing Brand Mark */}
        <div className="relative z-10">
          <BrandLogoIcon size="lg" className="size-10 drop-shadow-md" />
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 h-1 w-28 rounded-full bg-muted/60 overflow-hidden">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 via-primary to-purple-500 animate-[loading-progress_1.4s_ease-in-out_infinite]" />
        </div>

        <p className="relative z-10 text-[11px] font-bold text-muted-foreground">
          Updating live feed...
        </p>
      </div>
    </div>
  );
}
