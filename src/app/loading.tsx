"use client";

import { BrandLogoIcon } from "@/components/ui/brand-logo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center gap-6">
        {/* Glowing Background Orb */}
        <div className="absolute size-40 rounded-full bg-gradient-to-tr from-primary/30 to-violet-500/20 blur-3xl animate-pulse" />

        {/* Modern Multi-Ring Loop Loader */}
        <div className="relative flex size-20 items-center justify-center">
          {/* Outer Rotating Gradient Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-indigo-500 animate-spin duration-1000" />
          
          {/* Inner Counter-Rotating Ring */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-violet-500 border-l-rose-500 animate-[spin_1.5s_linear_infinite_reverse]" />

          {/* Center Brand Icon */}
          <div className="relative z-10 flex items-center justify-center animate-pulse">
            <BrandLogoIcon size="md" className="size-8 drop-shadow-md" />
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="h-1 w-36 overflow-hidden rounded-full bg-muted/60">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-500 via-primary to-rose-500 animate-[loading-progress_1.2s_ease-in-out_infinite]" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">
            CampusLoop
          </p>
        </div>
      </div>
    </div>
  );
}
