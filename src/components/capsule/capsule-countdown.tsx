"use client";

import { useEffect, useState } from "react";

interface CapsuleCountdownProps {
  targetDate: string | Date;
}

export function CapsuleCountdown({ targetDate }: CapsuleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    function calculateTime() {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <span className="text-xs font-black text-emerald-500 uppercase tracking-wider bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
        Officially Unlocked!
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
      <div className="flex flex-col items-center bg-background/80 border border-border/40 px-2 py-1 rounded-lg">
        <span className="text-sm font-black tabular-nums">{timeLeft.days}</span>
        <span className="text-[9px] text-muted-foreground uppercase font-sans">Days</span>
      </div>
      <span className="text-muted-foreground font-black">:</span>
      <div className="flex flex-col items-center bg-background/80 border border-border/40 px-2 py-1 rounded-lg">
        <span className="text-sm font-black tabular-nums">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-[9px] text-muted-foreground uppercase font-sans">Hrs</span>
      </div>
      <span className="text-muted-foreground font-black">:</span>
      <div className="flex flex-col items-center bg-background/80 border border-border/40 px-2 py-1 rounded-lg">
        <span className="text-sm font-black tabular-nums">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-[9px] text-muted-foreground uppercase font-sans">Min</span>
      </div>
      <span className="text-muted-foreground font-black">:</span>
      <div className="flex flex-col items-center bg-background/80 border border-border/40 px-2 py-1 rounded-lg">
        <span className="text-sm font-black tabular-nums text-amber-500">
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="text-[9px] text-muted-foreground uppercase font-sans">Sec</span>
      </div>
    </div>
  );
}
