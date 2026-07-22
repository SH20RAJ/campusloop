"use client";

import { useState } from "react";
import { Award, Zap, Sparkles, Trophy, ArrowRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";
import Link from "next/link";

const TOP_CAMPUSES = [
  { rank: 1, name: "BITS Pilani", points: 48250, badge: "👑 #1 Active Campus", color: "from-amber-500 to-yellow-500", border: "border-amber-500/40" },
  { rank: 2, name: "IIT Bombay", points: 42100, badge: "🔥 Trending", color: "from-slate-400 to-zinc-400", border: "border-border" },
  { rank: 3, name: "Delhi University", points: 39400, badge: "⚡ High Activity", color: "from-amber-700 to-orange-700", border: "border-border" },
  { rank: 4, name: "VIT Vellore", points: 34900, badge: "🚀 Fast Growing", color: "from-indigo-500 to-blue-500", border: "border-border" },
  { rank: 5, name: "NIT Trichy", points: 31200, badge: "✨ Verified Hub", color: "from-emerald-500 to-teal-500", border: "border-border" },
];

export function LeaderboardShowcase() {
  const [invites, setInvites] = useState(5);
  const [postsCount, setPostsCount] = useState(10);

  // Calculate projected LP
  const calculatedPoints = invites * 20 + postsCount * 5;

  function getRankBadge(pts: number) {
    if (pts >= 500) {
      return { title: "Campus Legend 👑", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: Trophy };
    }
    if (pts >= 150) {
      return { title: "Campus Talker 👑", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Award };
    }
    if (pts >= 50) {
      return { title: "Loop Starter ⚡", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Zap };
    }
    return { title: "Campus Newbie 🌱", color: "bg-slate-500/10 text-slate-500 border-slate-500/20", icon: Star };
  }

  const currentRank = getRankBadge(calculatedPoints);
  const RankIcon = currentRank.icon;

  return (
    <section className="border-t border-border/60 bg-background py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">
            <Trophy className="size-3.5 fill-amber-500" />
            Gamification & Campus Ranks
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Reputation you can actually count.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Earn Loop Points (LP) by creating posts, replying to canteen discussions, voting on polls, and inviting classmates. Climb your college leaderboard!
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Top Colleges Live Leaderboard Widget */}
          <Reveal className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold flex items-center gap-2">
                <Trophy className="size-5 text-amber-500" /> Top College Leaderboard
              </h3>
              <Badge variant="outline" className="text-[10px]">Updated Daily</Badge>
            </div>

            <Card className="border border-border bg-card shadow-lg overflow-hidden">
              <CardContent className="p-0 divide-y divide-border/60">
                {TOP_CAMPUSES.map((campus) => (
                  <div
                    key={campus.rank}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white bg-gradient-to-br ${campus.color} shadow-sm`}>
                        #{campus.rank}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">{campus.name}</p>
                        <span className="text-[10px] text-muted-foreground font-semibold">{campus.badge}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-primary tabular-nums">
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
              <h3 className="font-heading text-lg font-bold flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> Test Your Campus Rank Calculator
              </h3>
              <Badge variant="secondary" className="text-[10px]">Interactive Demo</Badge>
            </div>

            <Card className="border border-primary/20 bg-primary/[0.03] shadow-lg p-6 space-y-6 relative overflow-hidden">
              <div className="pointer-events-none absolute -right-10 -bottom-10 size-40 rounded-full bg-primary/10 blur-2xl" />

              {/* Live Rank Result Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Campus Rank</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full border ${currentRank.color}`}>
                    <RankIcon className="size-3.5" />
                    {currentRank.title}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-foreground tabular-nums">{calculatedPoints}</span>
                  <span className="text-xl font-bold text-primary">LP</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You earn <strong className="text-foreground">20 LP per friend invite</strong> and <strong className="text-foreground">5 LP per post</strong>.
                </p>
              </div>

              {/* Sliders / Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
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
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-2">
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
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Link href="/join?mode=signup" className="w-full">
                  <Button className="w-full gap-2 font-bold shadow-md shadow-primary/10">
                    Get Verified & Claim Your LP <ArrowRight className="size-4" />
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
