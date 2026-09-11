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
        "rounded-2xl border border-border/40 bg-card/40 p-4 sm:p-5 shadow-xs relative overflow-hidden backdrop-blur-md transition-all space-y-3",
        className
      )}
    >
      {/* Header Row: Badge, Perks title & Close Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border/50 text-[11px] font-bold">
            <GraduationCap className="size-3.5" />
            <span>Student Account</span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted/60 text-muted-foreground border border-border/40 flex items-center gap-1">
            <Zap className="size-3 text-amber-400" />
            <span>+50 LP Bonus</span>
          </span>
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="size-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Main Pitch & CTA Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight leading-snug">
            Save PYQs and organize your study stack
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Free downloads for everyone. Sign in with your college email for unlimited downloads and personal study vaults.
          </p>
        </div>

        <Link
          href={signInUrl}
          onClick={() => sounds.tap()}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-foreground text-background hover:opacity-90 transition-all active:scale-95 shrink-0 cursor-pointer shadow-xs"
        >
          <span>Claim 50 LP &amp; Sign In</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Compact Perks Micro-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/20 text-xs font-medium">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30">
          <Bookmark className="size-3 text-muted-foreground shrink-0" />
          <span className="truncate text-[11px] text-foreground/90">Personal Vault</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30">
          <MessageSquare className="size-3 text-muted-foreground shrink-0" />
          <span className="truncate text-[11px] text-foreground/90">Senior Doubts</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30">
          <Zap className="size-3 text-muted-foreground shrink-0" />
          <span className="truncate text-[11px] text-foreground/90">AI Study Tutor</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 border border-border/30">
          <ShieldCheck className="size-3 text-muted-foreground shrink-0" />
          <span className="truncate text-[11px] text-foreground/90">Verified Clout</span>
        </div>
      </div>
    </div>
  );
}
