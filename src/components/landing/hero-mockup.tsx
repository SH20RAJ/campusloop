"use client";

import {
  BarChart3,
  CheckCircle2,
  Flame,
  Heart,
  Lock,
  MessageSquare,
  Search,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { StatusPill } from "@/components/landing/landing-design-system";
import { cn } from "@/lib/utils";

export function HeroMockup() {
  const [activeMode, setActiveMode] = useState<"anonymous" | "real">("anonymous");
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("feed");

  const pollVotes = {
    option1: pollVoted === 0 ? 86 : 84,
    option2: pollVoted === 1 ? 16 : 14,
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* ─── Ambient Glow Backdrop ─── */}
      <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-xl opacity-70" />

      {/* ─── Main Product Canvas Container ─── */}
      <div className="relative rounded-3xl border border-zinc-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0E131F]/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] backdrop-blur-2xl overflow-hidden">
        {/* ─── Top Window Bar / Navigation (Inspired by Reference 1 & 2) ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/70 dark:border-white/5 bg-zinc-50/70 dark:bg-[#111726]/70 px-4 sm:px-6 py-3">
          {/* Brand + Live Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs">
                CL
              </div>
              <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground">
                CampusLoop
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              BIT Mesra Hub
            </div>
          </div>

          {/* Segmented View Switcher */}
          <div className="flex items-center rounded-full border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0B0F17]/80 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("feed")}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
                activeTab === "feed"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Feed & Confessions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("polls")}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
                activeTab === "polls"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Live Polls
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("communities")}
              className={cn(
                "hidden sm:inline-block rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
                activeTab === "communities"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Communities
            </button>
          </div>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
              <Search className="size-3" />
              <span>Search campus...</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-medium">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-foreground font-semibold">Aayush S.</span>
              <span className="text-muted-foreground text-[10px] hidden sm:inline">CSE &apos;26</span>
            </div>
          </div>
        </div>

        {/* ─── Dashboard Body: Left Rail + Center Feed + Right Contextual Panel ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
          {/* Left Vertical Dock Rail */}
          <div className="hidden lg:flex md:col-span-1 border-r border-zinc-200/70 dark:border-white/5 bg-zinc-50/40 dark:bg-[#111726]/40 flex-col items-center justify-between py-4">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs"
                title="Feed"
              >
                <MessageSquare className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                title="Communities"
              >
                <Users className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                title="Match"
              >
                <Heart className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                title="Polls"
              >
                <BarChart3 className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                title="Leaderboard"
              >
                <Trophy className="size-4" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-500" />
            </div>
          </div>

          {/* Center Main Stage */}
          <div className="col-span-1 md:col-span-8 lg:col-span-7 p-4 sm:p-6 space-y-5">
            {/* Stage Header with Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  Campus Feed & Dispatches
                  <StatusPill status="live" label="Syncing" />
                </h3>
                <p className="text-xs text-muted-foreground">
                  Zero foreign-key leaks • PII safety shield active
                </p>
              </div>

              {/* Dual-State Mode Switcher */}
              <div className="flex items-center rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveMode("anonymous")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    activeMode === "anonymous"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Lock className="size-3" /> Anonymous Mode
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode("real")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    activeMode === "real"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <UserCheck className="size-3" /> Real Name
                </button>
              </div>
            </div>

            {/* Dynamic Post Card based on Mode */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-card p-4 sm:p-5 shadow-xs transition-all space-y-3">
              {activeMode === "anonymous" ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20 text-xs">
                        🎭
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">
                            @anon_bitm26
                          </span>
                          <span className="rounded-full bg-purple-500/10 px-2 py-0.2 text-[10px] font-semibold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            Identity Escrow
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Hostel 7 • 12m ago
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> PII Scrubbed
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    Hostel 7 mess committee finally agreed to keep the hot paratha
                    counter running till 2 AM during End-Sem week! Also, anyone who
                    found an AirPods Pro case near the SAC fountain, please ping me on
                    CampusLoop chat:{" "}
                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      [Phone Number Masked by Safety Shield]
                    </span>
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                        <Flame className="size-3.5" /> 84 Agrees
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3.5" /> 19 Replies
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70">
                      Encrypted Escrow #E91A
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-2xs">
                        AS
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">
                            Aayush Sharma
                          </span>
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          <span className="text-[11px] text-muted-foreground">
                            CSE &apos;26
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          BIT Mesra Main Campus • 45m ago
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Smart India Hackathon
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                    Forming a 4-person squad for Smart India Hackathon (SIH 2026). We
                    have 2 full-stack devs and are looking for 1 UI/UX designer and 1
                    embedded/IoT specialist from 2nd or 3rd year. Drop a comment or
                    connect directly!
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Users className="size-3.5" /> 12 Interested
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3.5" /> 7 Comments
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Connect &rarr;
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Interactive Campus Poll Mockup */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-card p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <BarChart3 className="size-3.5 text-blue-600" />
                  Campus Senate Live Poll
                </div>
                <StatusPill status="healthy" label="Live Voting" />
              </div>

              <p className="text-xs sm:text-sm font-semibold text-foreground">
                Should the Central Library remain open 24x7 during the upcoming Mid-Sem
                and End-Sem examination weeks?
              </p>

              <div className="space-y-2 pt-1">
                {/* Option 1 */}
                <button
                  type="button"
                  onClick={() => setPollVoted(0)}
                  className={cn(
                    "w-full text-left rounded-xl border p-2.5 text-xs font-medium transition-all relative overflow-hidden",
                    pollVoted === 0
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-border/60 hover:border-border hover:bg-muted/40"
                  )}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-500/15 rounded-xl transition-all duration-500"
                    style={{ width: `${pollVotes.option1}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Yes, 24x7 with night canteen access
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {pollVotes.option1}%
                    </span>
                  </div>
                </button>

                {/* Option 2 */}
                <button
                  type="button"
                  onClick={() => setPollVoted(1)}
                  className={cn(
                    "w-full text-left rounded-xl border p-2.5 text-xs font-medium transition-all relative overflow-hidden",
                    pollVoted === 1
                      ? "border-blue-500/50 bg-blue-500/5"
                      : "border-border/60 hover:border-border hover:bg-muted/40"
                  )}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/10 rounded-xl transition-all duration-500"
                    style={{ width: `${pollVotes.option2}%` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Normal hours (10 PM closing is enough)
                    </span>
                    <span className="font-bold text-muted-foreground">
                      {pollVotes.option2}%
                    </span>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>1,248 verified student votes cast</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Tap to vote
                </span>
              </div>
            </div>
          </div>

          {/* Right Contextual Inspection Panel (Inspired by Reference 2) */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4 border-t md:border-t-0 md:border-l border-zinc-200/70 dark:border-white/5 bg-zinc-50/50 dark:bg-[#111726]/50 p-4 sm:p-5 space-y-5">
            {/* Node Metadata Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Selected Hub
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ACTIVE LOOP
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Birla Institute of Technology
                </h4>
                <p className="text-xs text-muted-foreground">Mesra, Ranchi • Est. 1955</p>
              </div>

              {/* Quick Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-xl border border-border/50 bg-card p-2.5">
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    Verified Students
                  </span>
                  <span className="text-sm font-bold text-foreground">4,892</span>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-2.5">
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    Verification Rate
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    99.8%
                  </span>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-2.5">
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    Active Societies
                  </span>
                  <span className="text-sm font-bold text-foreground">34 Clubs</span>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-2.5">
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    Identity Escrow
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    256-bit AES
                  </span>
                </div>
              </div>
            </div>

            {/* Trending on Campus */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Trending on Campus
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between rounded-lg bg-card/80 p-2 text-xs">
                  <span className="font-semibold text-foreground">#EndSemSchedule</span>
                  <span className="text-[10px] text-muted-foreground">342 posts</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-card/80 p-2 text-xs">
                  <span className="font-semibold text-foreground">#Hostel7MessMenu</span>
                  <span className="text-[10px] text-muted-foreground">189 posts</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-card/80 p-2 text-xs">
                  <span className="font-semibold text-foreground">#SIH2026Teams</span>
                  <span className="text-[10px] text-muted-foreground">124 posts</span>
                </div>
              </div>
            </div>

            {/* Campus Leaderboard Pill */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <Trophy className="size-3.5" /> Campus Rivalry
                </span>
                <span className="text-xs font-bold text-foreground">#1 BIT Mesra</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Loop Points</span>
                <span className="font-bold text-foreground">12,840 LP</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-blue-500/20 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
