"use client";

import { useState } from "react";
import { Users, Hash, Gift, ArrowRight, Check, Heart, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

// ──────── 1. Suggested Communities Widget ────────

const SUGGESTED_COMMUNITIES = [
  { id: "comm-1", name: "Coding@Campus", members: 142, desc: "LeetCode, hackathons & DSA" },
  { id: "comm-2", name: "Canteen Tea & Gossip", members: 289, desc: "Canteen debates & campus spills" },
  { id: "comm-3", name: "Exam Backlog Survivors", members: 310, desc: "Notes, pyqs & last minute prep" },
];

export function InlineCommunitiesWidget() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  function toggleJoin(id: string) {
    setJoined((prev) => {
      const isJoined = !prev[id];
      if (isJoined) toast.success("Joined community!");
      return { ...prev, [id]: isJoined };
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground leading-tight">Communities for You</h4>
            <p className="text-[10px] text-muted-foreground">Join student circles on your campus</p>
          </div>
        </div>
        <Link href="/app/communities" className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5">
          See All <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {SUGGESTED_COMMUNITIES.map((comm) => (
          <div key={comm.id} className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
            <div>
              <p className="text-xs font-bold text-foreground leading-tight">{comm.name}</p>
              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{comm.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] font-semibold text-muted-foreground">{comm.members} members</span>
              <Button
                size="sm"
                variant={joined[comm.id] ? "default" : "outline"}
                onClick={() => toggleJoin(comm.id)}
                className="h-6 px-2 text-[10px] font-bold cursor-pointer"
              >
                {joined[comm.id] ? <Check className="size-2.5 mr-1" /> : <UserPlus className="size-2.5 mr-1" />}
                {joined[comm.id] ? "Joined" : "Join"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────── 2. Campus Dating / Matchmaking Teaser Widget ────────

export function InlineDatingWidget() {
  return (
    <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 via-card to-card p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {/* Student Avatars Stack */}
        <div className="flex -space-x-2.5 shrink-0">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            alt="Verified Student"
            className="size-9 rounded-full border-2 border-background object-cover shadow-sm"
          />
          <img
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
            alt="Verified Student"
            className="size-9 rounded-full border-2 border-background object-cover shadow-sm"
          />
          <img
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
            alt="Verified Student"
            className="size-9 rounded-full border-2 border-background object-cover shadow-sm"
          />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-foreground">Campus Matchmaking</h4>
            <Badge variant="outline" className="text-[9px] border-pink-500/30 text-pink-500 bg-pink-500/10 font-bold">Zero Catfish</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Swipe on verified classmates from your university. Meet people worth meeting.
          </p>
        </div>
      </div>

      <Link href="/app/dating" className="shrink-0">
        <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs h-8 gap-1 shadow-sm cursor-pointer hover:opacity-95">
          <Heart className="size-3.5 fill-white" /> Start Swiping
        </Button>
      </Link>
    </div>
  );
}

// ──────── 3. Trending Hashtags Widget ────────

const TRENDING_TAGS = [
  { tag: "LateNightTea", posts: "128 posts" },
  { tag: "CanteenDebate", posts: "94 posts" },
  { tag: "EndsemSurvivors", posts: "210 posts" },
  { tag: "HostelLife", posts: "156 posts" },
  { tag: "ExamMemes", posts: "320 posts" },
];

export function InlineHashtagsWidget() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Hash className="size-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-foreground leading-tight">Trending Campus Topics</h4>
          <p className="text-[10px] text-muted-foreground">What everyone is talking about right now</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {TRENDING_TAGS.map((item) => (
          <Link key={item.tag} href={`/app/hashtag/${item.tag}`}>
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-bold text-foreground hover:border-primary/40 hover:text-primary transition-all cursor-pointer">
              #{item.tag}
              <span className="text-[9px] text-muted-foreground font-normal">({item.posts})</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ──────── 4. Referral / Ambassador Perk Widget ────────

export function InlineReferralWidget() {
  function handleCopy() {
    navigator.clipboard.writeText("https://campusloop.space/join");
    toast.success("CampusLoop link copied! Share it in your batch group 🚀");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          <Gift className="size-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-foreground">Earn 20 LP per Verified Invite</h4>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Bring your classmates onboard to unlock your Campus Ambassador rank!
          </p>
        </div>
      </div>
      <Button size="sm" onClick={handleCopy} variant="outline" className="shrink-0 font-bold text-xs h-8 gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer">
        <Sparkles className="size-3.5" /> Copy Invite Link
      </Button>
    </div>
  );
}
