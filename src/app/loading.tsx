"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Securing gate...",
  "Loading loops...",
  "Syncing feed...",
  "Verifying...",
];

export default function Loading() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#09070F] text-white">
      {/* Background Glow - Very subtle */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,99,255,0.04)_0%,transparent_55%)]" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Minimal Central Logo & Ring */}
        <div className="relative flex items-center justify-center">
          {/* Single clean rotating circle */}
          <div className="absolute size-20 rounded-full border border-primary/10" />
          <div className="absolute size-20 rounded-full border border-t-primary animate-spin" />
          
          {/* Logo */}
          <div className="relative size-12 rounded-xl bg-[#120E22] p-2.5 border border-border/40 shadow-[0_4px_20px_rgba(108,99,255,0.08)]">
            <img
              src="/logo.png"
              alt="CampusLoop"
              className="size-full object-cover rounded-md"
            />
          </div>
        </div>

        {/* Minimal Text Status */}
        <div className="flex flex-col items-center gap-1 h-10 text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-primary/80 font-bold">
            CampusLoop
          </span>
          <p className="text-xs text-muted-foreground">
            {MESSAGES[msgIdx]}
          </p>
        </div>
      </div>
    </div>
  );
}
