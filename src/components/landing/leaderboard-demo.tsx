"use client";

import { useState } from "react";
import { Award, Zap, Sparkles, Trophy, ArrowRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";
import Link from "next/link";

const TOP_CAMPUSES = [
  { rank: 1, name: "BITS Pilani", points: 48250, badge: "#1 Active Campus" },
  { rank: 2, name: "IIT Bombay", points: 42100, badge: "Trending" },
  { rank: 3, name: "Delhi University", points: 39400, badge: "High Chaos" },
  { rank: 4, name: "VIT Vellore", points: 34900, badge: "Fast Growing" },
  { rank: 5, name: "NIT Trichy", points: 31200, badge: "Verified Hub" },
];

export function LeaderboardShowcase() {
  const [invites, setInvites] = useState(5);
  const [postsCount, setPostsCount] = useState(10);

  // Calculate projected LP
  const calculatedPoints = invites * 20 + postsCount * 5;

  function getRankBadge(pts: number) {
    if (pts >= 500) {
      return { title: "Campus Legend 👑", icon: Trophy };
    }
    if (pts >= 150) {
      return { title: "Campus Talker 💬", icon: Award };
    }
    if (pts >= 50) {
      return { title: "Loop Starter ⚡", icon: Zap };
    }
    return { title: "Backlog Survivor ☕", icon: Star };
  }

  const currentRank = getRankBadge(calculatedPoints);
  const RankIcon = currentRank.icon;

  return (
    <section className="border-t border-border/60 bg-background py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Trophy className="size-3.5 text-primary" />
            Gamification & Campus Ranks
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Reputation you can flex when your GPA won&apos;t.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Earn Loop Points (LP) by posting confessions, settling canteen debates, and bringing classmates who actually reply.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Top Colleges Live Leaderboard Widget */}
          <Reveal className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-bold flex items-center gap-2">
                <Trophy className="size-4 text-muted-foreground" /> Top College Rankings
              </h3>
              <Badge variant="outline" className="text-[10px]">Updated Live</Badge>
            </div>

            <Card className="border border-border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-0 divide-y divide-border/60">
                {TOP_CAMPUSES.map((campus) => (
                  <div
                    key={campus.rank}
                    className="flex items-center justify-between p-3.5 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-foreground border border-border/60">
                        #{campus.rank}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">{campus.name}</p>
                        <span className="text-[10px] text-muted-foreground font-semibold">{campus.badge}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-primary tabular-nums">
                        {campus.points.toLocaleString("en-IN")} LP
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Reveal>

          {/* Interactive LP Calculator Widget */}
          <Reveal delay={0.1} className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-bold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Test Your Campus Rank Calculator
              </h3>
              <Badge variant="secondary" className="text-[10px]">Interactive Demo</Badge>
            </div>

            <Card className="border border-border bg-card shadow-sm p-5 space-y-5">
              {/* Live Rank Result Card */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Campus Rank</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    <RankIcon className="size-3" />
                    {currentRank.title}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground tabular-nums">{calculatedPoints}</span>
                  <span className="text-base font-bold text-primary">LP</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You earn <strong className="text-foreground">20 LP per friend invite</strong> and <strong className="text-foreground">5 LP per post</strong>.
                </p>
              </div>

              {/* Sliders / Inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Classmates Invited (+20 LP each)</span>
                    <span className="text-primary font-bold">{invites} Friends</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={invites}
                    onChange={(e) => setInvites(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Confessions / Polls Posted (+5 LP each)</span>
                    <span className="text-primary font-bold">{postsCount} Posts</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={postsCount}
                    onChange={(e) => setPostsCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="pt-1">
                <Link href="/join?mode=signup" className="w-full">
                  <Button className="w-full gap-1.5 font-semibold text-xs">
                    Get Verified & Claim Your LP <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
