"use client";

import { ArrowRight, Check, Compass, Eye, MessageCircle, Repeat2, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AnimateHeart, AnimateShieldCheck } from "@/components/ui/animated-icon";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState({ nescafe: 42, backgate: 58 });
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(48);
  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(6);

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

  function handleToggleLike() {
    sounds.pop();
    haptics.light();
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
    }
  }

  function handleToggleRepost() {
    sounds.pop();
    haptics.light();
    if (isReposted) {
      setIsReposted(false);
      setRepostCount((c) => c - 1);
    } else {
      setIsReposted(true);
      setRepostCount((c) => c + 1);
    }
  }

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-x-clip">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-full -translate-x-1/2 max-w-4xl bg-gradient-to-b from-[#1D9BF0]/10 via-[#1D9BF0]/5 to-transparent blur-3xl" />

      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        {/* ──────── LEFT COLUMN: Positioning, Headline & Direct CTAs ──────── */}
        <div className="flex flex-col items-start text-left space-y-6 lg:col-span-7">
          {/* Eyebrow & Pilot Status */}
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 text-xs font-semibold text-foreground">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="font-mono text-[#1D9BF0] font-bold uppercase tracking-wider text-[11px]">
              VERIFIED CAMPUS TIMELINE
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <span className="text-foreground/80 font-mono text-[11px]">Active pilot at BIT Mesra</span>
          </div>

          {/* Core H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
            Your campus,
            <br />
            <span className="text-[#1D9BF0]">finally on its own network.</span>
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
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-8 text-[15px] font-bold text-white shadow-lg shadow-[#1D9BF0]/20 transition-all active:scale-98 cursor-pointer"
              >
                <span>Enter Campus Feed</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-8 text-[15px] font-bold text-white shadow-lg shadow-[#1D9BF0]/20 transition-all active:scale-98 cursor-pointer"
              >
                <span>Get verified with college email</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            )}

            <Link
              href="/colleges"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border/60 bg-card hover:bg-muted hover:border-border px-6 text-[15px] font-bold text-foreground transition-all active:scale-98 cursor-pointer"
            >
              <Compass className="mr-2 size-4 text-[#1D9BF0]" />
              <span>Explore a campus</span>
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-foreground/90 border border-border/40">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>College-email verified</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-foreground/90 border border-border/40">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Anonymous mode</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-foreground/90 border border-border/40">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>Free for students</span>
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN: Twitter/Grok Live Campus Feed Artifact ──────── */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
            {/* Campus Hub Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-foreground">BIT Mesra Campus Hub</span>
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    bitmesra.ac.in · 100% Verified
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20">
                PILOT LIVE
              </span>
            </div>

            {/* Flat Timeline Row: Post Item */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                    <AnimateShieldCheck className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-foreground">Anonymous Student</span>
                      <span className="font-mono text-[11px] text-muted-foreground">@anon_hostel</span>
                      <span className="text-muted-foreground/50 text-xs">·</span>
                      <span className="font-mono text-[11px] text-muted-foreground">2h</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Hostel 11 · Confessions
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold text-[#1D9BF0] bg-[#1D9BF0]/10 px-2 py-0.5 rounded-full">
                  #campus-pulse
                </span>
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed font-normal">
                The IC ground winter fog at 1 AM with cutting chai hits completely different than any cafe in
                Ranchi. Midsem prep is stressful, but this campus makes it memorable.
              </p>

              {/* Twitter Interaction Row with Signature Colors */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors cursor-pointer group"
                >
                  <MessageCircle className="size-3.5 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-[11px]">14</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleRepost}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors cursor-pointer group",
                    isReposted ? "text-emerald-500" : "hover:text-emerald-500"
                  )}
                >
                  <Repeat2 className="size-3.5 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-[11px]">{repostCount}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors cursor-pointer group",
                    isLiked ? "text-rose-500" : "hover:text-rose-500"
                  )}
                >
                  <AnimateHeart className="size-3.5 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-[11px]">{likeCount}</span>
                </button>
                <div className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors cursor-pointer">
                  <Eye className="size-3.5" />
                  <span className="font-mono text-[11px]">1.2K</span>
                </div>
              </div>
            </div>

            {/* Live Canteen Poll Micro-Artifact */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Live Canteen Poll</span>
                <span className="font-mono text-[11px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-foreground/90 font-medium">
                Best late-night Maggi &amp; chai spot right now?
              </p>

              <div className="space-y-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleVote("nescafe")}
                  className={cn(
                    "w-full text-left p-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-all cursor-pointer",
                    hasVoted
                      ? "bg-[#1D9BF0]/10 border-[#1D9BF0]/30 text-foreground"
                      : "bg-background border-border/60 hover:border-[#1D9BF0]/50 text-foreground"
                  )}
                >
                  <span>Nescafe Booth near R&amp;D</span>
                  <span className="font-mono font-bold text-[#1D9BF0]">
                    {hasVoted ? `${votes.nescafe}%` : "Vote"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVote("backgate")}
                  className={cn(
                    "w-full text-left p-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-all cursor-pointer",
                    hasVoted
                      ? "bg-muted/60 border-border/80 text-foreground"
                      : "bg-background border-border/60 hover:border-[#1D9BF0]/50 text-foreground"
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
            <div className="pt-0.5 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                <Sparkles className="size-3 text-[#1D9BF0]" />
                <span>One verified account · Verified BIT Mesra students only</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
