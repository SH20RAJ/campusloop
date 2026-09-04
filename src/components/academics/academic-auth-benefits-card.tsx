"use client";

import { Bookmark, ChevronRight, GraduationCap, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AcademicAuthBenefitsCardProps {
  returnTo?: string;
  className?: string;
}

export function AcademicAuthBenefitsCard({ returnTo, className }: AcademicAuthBenefitsCardProps) {
  const signInUrl = `/handler/sign-in${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  return (
    <div
      className={cn(
        "rounded-3xl border border-indigo-500/30 bg-linear-to-br from-indigo-500/10 via-card to-card p-5 sm:p-6 shadow-md relative overflow-hidden space-y-4",
        className
      )}
    >
      {/* Background glow & badge */}
      <div className="absolute -top-10 -right-10 size-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <GraduationCap className="size-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
            Student Perks &amp; Verification
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
          <Zap className="size-3 fill-current" />
          <span>+50 LP Welcome Bonus</span>
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-snug">
          Supercharge Your Semester on CampusLoop
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Reading and downloading notes is 100% free for everyone. Sign in with your college email to
          unlock your personal vault and earn campus clout.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-card/80 border border-border/50">
          <div className="flex size-7 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
            <Bookmark className="size-3.5 fill-current" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-foreground">Personal Academic Vault</p>
            <p className="text-[11px] text-muted-foreground">
              Save formula sheets, notes &amp; PYQs across all 8 semesters
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-card/80 border border-border/50">
          <div className="flex size-7 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
            <MessageSquare className="size-3.5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-foreground">Ask Doubts &amp; Reviews</p>
            <p className="text-[11px] text-muted-foreground">
              Direct discussions with branch toppers and verified seniors
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-card/80 border border-border/50">
          <div className="flex size-7 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
            <Zap className="size-3.5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-foreground">AI Study Cram &amp; Formulas</p>
            <p className="text-[11px] text-muted-foreground">
              Instant 15-minute exam summaries and key concept breakdowns
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-card/80 border border-border/50">
          <div className="flex size-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
            <ShieldCheck className="size-3.5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-foreground">Verified Student Clout</p>
            <p className="text-[11px] text-muted-foreground">
              Earn Loop Points (LP) for verified answers &amp; notes uploads
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/30">
        <span className="text-[11px] text-muted-foreground">
          Takes 20 seconds • Free for all Indian college students
        </span>
        <Link
          href={signInUrl}
          onClick={() => sounds.tap()}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>Claim 50 LP &amp; Unlock Vault</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
