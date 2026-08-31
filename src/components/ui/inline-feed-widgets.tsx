"use client";

import { ArrowRight, BookOpen, Clock, Flame, Gift, Hash, Heart, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { TrendingHashtag } from "@/lib/trending-hashtags";
import { cn } from "@/lib/utils";

// ──────── 1. Suggested Communities Widget (Twitter / X Timeline Style) ────────

const SUGGESTED_COMMUNITIES = [
  {
    id: "comm_music",
    name: "Music Jams & Dhwani",
    slug: "music-jams",
    members: 17,
    desc: "Acoustic jams, Bitotsav battle of bands, and indie chords 🎸",
  },
  {
    id: "comm_coding",
    name: "Coders Club & Hackers",
    slug: "coders-club",
    members: 18,
    desc: "LeetCode daily grinds, system design & HackBIT squads 💻",
  },
  {
    id: "comm_placements",
    name: "Placement & Career Prep",
    slug: "placement-prep",
    members: 15,
    desc: "Mock interviews, coding test patterns & alumni referrals 💼",
  },
];

export function InlineCommunitiesWidget() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  function toggleJoin(id: string, name: string) {
    setJoined((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        toast.success(`Joined c/${name}! 🚀`);
      }
      return { ...prev, [id]: nextState };
    });
  }

  return (
    <div className="py-2.5 px-4 space-y-3 select-none">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <h3 className="text-[15px] font-black text-foreground tracking-tight">Communities for you</h3>
        </div>
        <Link
          href="/app/communities"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
        >
          Show more
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Communities Stack */}
      <div className="divide-y divide-border/25">
        {SUGGESTED_COMMUNITIES.map((comm) => (
          <div
            key={comm.id}
            className="flex items-center justify-between gap-3 py-2.5 hover:bg-muted/20 transition-colors rounded-xl px-1"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                c/{comm.slug[0].toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/app/communities/${comm.id}`}
                  className="font-bold text-sm text-foreground hover:underline truncate block"
                >
                  {comm.name}
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  <span className="font-medium">c/{comm.slug}</span> · {comm.members} members
                </p>
                <p className="text-[11px] text-muted-foreground/80 truncate">{comm.desc}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleJoin(comm.id, comm.slug)}
              className={cn(
                "rounded-full px-4 py-1 text-xs font-black transition-all cursor-pointer shrink-0 shadow-2xs",
                joined[comm.id]
                  ? "border border-border/70 text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                  : "bg-foreground text-background hover:opacity-90 active:scale-95"
              )}
            >
              {joined[comm.id] ? "Joined" : "Join"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────── 2. Campus Matchmaking Teaser Widget ────────

export function InlineDatingWidget() {
  return (
    <div className="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Sparkles className="size-5 text-primary" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[14px] font-black text-foreground">Campus Match</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Safe &amp; Verified
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-snug truncate">
            Connect with fellow students in a safe space. 100% mutual opt-in matching.
          </p>
        </div>
      </div>

      <Link
        href="/app/matching"
        className="shrink-0 self-start sm:self-center px-4 py-1.5 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs transition-all shadow-2xs active:scale-95 cursor-pointer"
      >
        Explore Match
      </Link>
    </div>
  );
}

// ──────── 3. Trending Hashtags Widget ────────

export function InlineHashtagsWidget() {
  const { data } = useSWR<{ trending: TrendingHashtag[] }>("/api/hashtags/trending?limit=4", fetcher, {
    dedupingInterval: 30000,
  });

  const tags =
    data?.trending && data.trending.length > 0
      ? data.trending.map((t) => ({
          tag: t.tag.replace(/^#/, ""),
          count: t.formattedCount,
        }))
      : [
          { tag: "HostelLife", count: "62 posts" },
          { tag: "BITMesra", count: "39 posts" },
          { tag: "Confession", count: "36 posts" },
          { tag: "CampusHelp", count: "25 posts" },
        ];

  return (
    <div className="py-2.5 px-4 space-y-2 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-primary" />
          <h3 className="text-[15px] font-black text-foreground tracking-tight">Trending on Campus</h3>
        </div>
        <Link href="/app/discover" className="text-xs font-bold text-primary hover:underline cursor-pointer">
          Explore
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {tags.map((item) => (
          <Link
            key={item.tag}
            href={`/app/hashtag/${item.tag}`}
            className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors border border-border/30"
          >
            <div className="min-w-0">
              <p className="font-bold text-xs text-foreground truncate">#{item.tag}</p>
              <p className="text-[10px] text-muted-foreground">{item.count}</p>
            </div>
            <Hash className="size-3.5 text-muted-foreground/60 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ──────── 4. Referral / Ambassador Perk Widget ────────

export function InlineReferralWidget() {
  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://campusloop.space/handler/sign-up");
      toast.success("CampusLoop invite link copied! 🚀");
    }
  }

  return (
    <div className="py-3 px-4 flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <Gift className="size-5" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <h4 className="text-[14px] font-black text-foreground truncate">Invite Classmates · Earn 20 LP</h4>
          <p className="text-xs text-muted-foreground truncate">
            Unlock the verified campus star badge and boost your clout tier.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 px-4 py-1.5 rounded-full border border-border text-foreground font-black text-xs hover:bg-muted/40 transition-all cursor-pointer active:scale-95 shadow-2xs"
      >
        Copy Link
      </button>
    </div>
  );
}

// ──────── 5. Campus Articles Spotlight Widget ────────

export function InlineArticlesWidget() {
  const { data } = useSWR<{ articles: any[] }>("/api/articles?limit=2&sort=popular", fetcher, {
    revalidateIfStale: true,
    dedupingInterval: 30000,
  });

  const articles = data?.articles || [];
  if (articles.length === 0) return null;

  return (
    <div className="py-3 px-4 space-y-3 select-none rounded-2xl border border-border/30 bg-gradient-to-br from-primary/5 via-card to-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <h3 className="text-[15px] font-black text-foreground tracking-tight">Articles & Long Reads</h3>
        </div>
        <Link
          href="/app/articles"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
        >
          Explore all
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {articles.map((art) => (
          <Link
            key={art.id}
            href={`/app/articles/${art.slug}`}
            className="group flex flex-col justify-between rounded-xl border border-border/40 bg-card p-3.5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1 text-[10px]">
                <span className="font-black text-primary uppercase">{art.category || "General"}</span>
                <span className="text-muted-foreground flex items-center gap-1 font-medium">
                  <Clock className="size-2.5" />
                  {art.readingTimeMinutes || 3} min
                </span>
              </div>
              <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {art.title}
              </h4>
              {art.excerpt && <p className="text-[11px] text-muted-foreground line-clamp-2">{art.excerpt}</p>}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/20 pt-2 font-medium">
              <span>@{art.author?.username || "student"}</span>
              <span className="text-primary font-bold group-hover:underline">Read →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
