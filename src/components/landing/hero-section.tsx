"use client";

import {
  ArrowRight,
  Check,
  Compass,
  Heart,
  MessageCircle,
  Repeat2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState({ nescafe: 42, backgate: 58 });

  function handleVote(option: "nescafe" | "backgate") {
    if (hasVoted) return;
    sounds.pop();
    haptics.light();
    setHasVoted(true);
    setVotes((prev) => ({
      ...prev,
      [option]: prev[option] + 1,
    }));
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-x-clip">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-full -translate-x-1/2 max-w-4xl bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />

      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        {/* ──────── LEFT COLUMN: Positioning, Headline & Direct CTAs ──────── */}
        <div className="flex flex-col items-start text-left space-y-6 lg:col-span-7">
          {/* Eyebrow & Pilot Status */}
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm shadow-primary/10">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-primary font-black uppercase tracking-wider text-[11px]">
              The Verified Campus Social Layer
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <span className="text-foreground/80 font-medium text-[11px]">Pilot live at BIT Mesra</span>
          </div>

          {/* Core H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
            Your campus,
            <br />
            <span className="text-primary">finally on its own network.</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
            CampusLoop is a verified student network where you can speak anonymously, connect with classmates,
            discover campus life, and find your people — without random outsiders.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full pt-1">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-primary hover:bg-primary/90 px-8 text-[15px] font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-98 cursor-pointer"
              >
                <span>Enter Campus Feed</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-primary hover:bg-primary/90 px-8 text-[15px] font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-98 cursor-pointer"
              >
                <span>Get verified with college email</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            )}

            <Link
              href="/colleges"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border/80 bg-card/80 hover:bg-muted hover:border-border px-6 text-[15px] font-bold text-foreground transition-all active:scale-98 shadow-xs cursor-pointer"
            >
              <Compass className="mr-2 size-4 text-primary" />
              <span>Explore a campus</span>
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 text-foreground/90 border border-border/60 shadow-2xs">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>College-email verified</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 text-foreground/90 border border-border/60 shadow-2xs">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Anonymous mode</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 text-foreground/90 border border-border/60 shadow-2xs">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Built for students</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 text-foreground/90 border border-border/60 shadow-2xs">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Free for students</span>
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN: Real Product UI Preview (Interactive Teaser) ──────── */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl border border-border/80 bg-card/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            {/* Campus Header Bar */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground">BIT Mesra Campus</span>
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    bitmesra.ac.in · Verified Hub
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                LIVE PILOT
              </span>
            </div>

            {/* Sample Authentic Post 1: Anonymous Confession */}
            <div className="rounded-2xl bg-muted/30 border border-border/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-purple-500/15 text-purple-400 font-black text-xs border border-purple-500/30">
                    🎭
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">Anonymous Student</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">2h ago</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  #campus-pulse
                </span>
              </div>

              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                The IC ground winter fog at 1 AM with cutting chai hits completely different than any cafe in
                Ranchi. Midsem prep is stressful, but this campus makes it memorable.
              </p>

              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-pointer">
                    <Heart className="size-3.5 text-rose-500" /> 48
                  </span>
                  <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                    <MessageCircle className="size-3.5" /> 14
                  </span>
                  <span className="flex items-center gap-1 hover:text-emerald-500 transition-colors cursor-pointer">
                    <Repeat2 className="size-3.5" /> 6
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">Sample campus post</span>
              </div>
            </div>

            {/* Sample Authentic Post 2: Live Canteen Poll */}
            <div className="rounded-2xl bg-muted/30 border border-border/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-blue-500/15 text-blue-400 font-black text-xs border border-blue-500/30">
                    📊
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">Hostel 11 Student</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">Today</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  #canteen-poll
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-foreground">
                Best late-night Maggi &amp; chai spot right now?
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleVote("nescafe")}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer",
                    hasVoted
                      ? "bg-primary/10 border-primary/30 text-foreground"
                      : "bg-background/80 border-border/60 hover:border-primary/50 text-foreground"
                  )}
                >
                  <span>Nescafe Booth near R&amp;D</span>
                  <span className="font-mono font-bold text-primary">
                    {hasVoted ? `${votes.nescafe}%` : "Vote"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVote("backgate")}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer",
                    hasVoted
                      ? "bg-muted/80 border-border/80 text-foreground"
                      : "bg-background/80 border-border/60 hover:border-primary/50 text-foreground"
                  )}
                >
                  <span>Back Gate Night Counter</span>
                  <span className="font-mono font-bold text-muted-foreground">
                    {hasVoted ? `${votes.backgate}%` : "Vote"}
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom verified badge reassurance */}
            <div className="pt-1 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                <span>One verified account · Real classmates only</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
