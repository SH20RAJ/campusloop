"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";

const LEADERBOARD_RANKS = [
  {
    rank: 1,
    college: "BIT Mesra",
    state: "Ranchi, Jharkhand",
    lp: "12,840 LP",
    students: "4,892 verified",
    badge: "#1 Campus Champion",
    accent: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    rank: 2,
    college: "IIT Delhi",
    state: "Hauz Khas, New Delhi",
    lp: "11,920 LP",
    students: "4,310 verified",
    badge: "Rising Rival",
    accent: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
  },
  {
    rank: 3,
    college: "BITS Pilani",
    state: "Pilani, Rajasthan",
    lp: "10,450 LP",
    students: "3,780 verified",
    badge: "Top Tier",
    accent: "text-amber-700 bg-amber-700/10 border-amber-700/20",
  },
  {
    rank: 4,
    college: "VIT Vellore",
    state: "Vellore, Tamil Nadu",
    lp: "9,640 LP",
    students: "5,120 verified",
    badge: "Active Loop",
    accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
];

export function LeaderboardRivalrySection() {
  return (
    <LandingSection id="leaderboard" bg="subtle">
      <LandingContainer>
        <LandingSectionHeader
          badge="Gamification & Pride"
          headlineMain="Inter-college rivalry."
          headlineHighlight="Powered by Loop Points."
          description="Every verified student signup, helpful notes contribution, and thoughtful campus poll response earns Loop Points (LP) for your college leaderboard ranking."
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Explanation */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Put your university at the top of India&apos;s campus map.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When your campus loop hits threshold activity, verified perks unlock
              automatically: campus-wide dark themes, priority hackathon invites, and
              exclusive student merchant discounts.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                  +50
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Verify your official college email
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-bold text-xs">
                  +100
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Upload verified PYQs or lecture summaries
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 font-bold text-xs">
                  +25
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Upvoted answer on campus discussion threads
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/colleges"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all 1,350+ campus standings &rarr;
              </Link>
            </div>
          </div>

          {/* Right: Leaderboard Card */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-[#0E131F]/80 p-5 sm:p-7 shadow-xs backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-amber-500" />
                  <span className="text-xs font-bold text-foreground">
                    National Campus Leaderboard
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Demo Leaderboard Data
                </span>
              </div>

              <div className="space-y-2.5">
                {LEADERBOARD_RANKS.map((item) => (
                  <div
                    key={item.college}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-3.5 text-xs transition-all hover:border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex size-7 items-center justify-center rounded-full font-mono text-xs font-bold border ${item.accent}`}
                      >
                        #{item.rank}
                      </span>
                      <div>
                        <span className="font-bold text-foreground text-sm block">
                          {item.college}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.state} • {item.students}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-foreground block font-mono">
                        {item.lp}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
