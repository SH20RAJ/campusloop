"use client";

import { Bookmark, ChevronRight, GraduationCap, MessageSquare, ShieldCheck, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AcademicAuthBenefitsCardProps {
  returnTo?: string;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function AcademicAuthBenefitsCard({
  returnTo,
  className,
  dismissible = true,
  onDismiss,
}: AcademicAuthBenefitsCardProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (dismissible && typeof window !== "undefined") {
      const stored = localStorage.getItem("campusloop_dismissed_academic_perks");
      if (stored === "true") {
        setIsDismissed(true);
      }
    }
  }, [dismissible]);

  function handleDismiss() {
    sounds.tap();
    haptics.light();
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("campusloop_dismissed_academic_perks", "true");
    }
    onDismiss?.();
  }

  if (!isMounted || isDismissed) {
    return null;
  }

  const signInUrl = `/handler/sign-in${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  return (
    <div
      className={cn(
        "rounded-3xl border border-indigo-500/25 bg-linear-to-br from-indigo-500/10 via-card/90 to-card p-4 sm:p-5 shadow-sm relative overflow-hidden backdrop-blur-md transition-all duration-300",
        className
      )}
    >
      {/* Subtle ambient light */}
      <div className="absolute -top-12 -right-12 size-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row: Badge, Perks title & Close Button */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 text-[11px] font-black uppercase tracking-wider">
            <GraduationCap className="size-3.5" />
            <span>Student Perks</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
            <Zap className="size-3 fill-current" />
            <span>+50 LP Welcome Bonus</span>
          </span>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="size-7 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Main Pitch & CTA Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-snug">
            Supercharge Your Semester on CampusLoop
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            Free direct downloads for everyone. Join with your student email to organize study stacks, save
            PYQs, and earn campus clout.
          </p>
        </div>

        <Link
          href={signInUrl}
          onClick={() => sounds.tap()}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <span>Claim 50 LP &amp; Unlock Vault</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Compact Perks Micro-Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-border/25 text-xs font-semibold">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/40">
          <Bookmark className="size-3.5 text-amber-400 shrink-0" />
          <span className="truncate text-[11px] text-foreground/90">Personal Vault</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/40">
          <MessageSquare className="size-3.5 text-indigo-400 shrink-0" />
          <span className="truncate text-[11px] text-foreground/90">Ask Seniors &amp; Doubts</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/40">
          <Zap className="size-3.5 text-purple-400 shrink-0" />
          <span className="truncate text-[11px] text-foreground/90">15-Min AI Cram</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/40">
          <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
          <span className="truncate text-[11px] text-foreground/90">Verified Clout</span>
        </div>
      </div>
    </div>
  );
}
