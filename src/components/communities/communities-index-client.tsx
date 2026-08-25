"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users2,
  Plus,
  Search,
  Lock,
  Globe,
  EyeOff,
  Flame,
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { FeedPost } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";

export interface CommunityItem {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  privacy: "PUBLIC" | "PRIVATE" | "UNLISTED" | string;
  category: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  points?: number;
  creatorId: string;
  createdAt: Date;
  members: { id: string; communityId: string; userId: string; role: string; status: string }[];
  creator: { id: string; username: string; displayName: string };
}

interface CommunitiesIndexClientProps {
  initialCommunities: CommunityItem[];
  initialPosts?: FeedPost[];
  profileId: string;
}

const CATEGORIES = [
  "All",
  "Joined",
  "Tech & Coding",
  "Music & Arts",
  "Gaming & Anime",
  "Sports & Fitness",
  "Academics & Placements",
  "Memes & Culture",
  "General",
];

export function CommunitiesIndexClient({
  initialCommunities,
  initialPosts = [],
  profileId,
}: CommunitiesIndexClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"directory" | "feed">("directory");

  const filteredCommunities = initialCommunities.filter((c) => {
    // Hide UNLISTED communities unless the user is a member
    const isMember = c.members.some((m) => m.userId === profileId);
    if (c.privacy === "UNLISTED" && !isMember) {
      return false;
    }

    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(search.toLowerCase());

    if (selectedCategory === "Joined") {
      return matchesSearch && isMember;
    }
    if (selectedCategory !== "All") {
      return matchesSearch && c.category.toLowerCase() === selectedCategory.toLowerCase();
    }
    return matchesSearch;
  });

  function getInitialsGradient(name: string) {
    const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-indigo-500 to-violet-500",
      "from-purple-500 to-pink-500",
      "from-blue-500 to-indigo-500",
      "from-violet-500 to-fuchsia-500",
      "from-fuchsia-500 to-rose-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-amber-500",
      "from-cyan-500 to-blue-500",
    ];
    return gradients[charCodeSum % gradients.length];
  }

  const joinedCount = initialCommunities.filter((c) =>
    c.members.some((m) => m.userId === profileId)
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col min-h-screen pb-24 px-3 sm:px-4 pt-3 gap-5 select-none animate-in fade-in">
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-card p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <Users2 className="size-6 text-primary" /> Campus Communities
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                Sub-Hubs
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium max-w-lg leading-relaxed">
              Interest groups, student clubs, secret study branches, and campus discussion hubs.
            </p>
          </div>

          <Link
            href="/app/communities/new"
            className="px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Create Community</span>
          </Link>
        </div>

        {/* Metric Bar */}
        <div className="flex items-center gap-4 pt-4 mt-4 border-t border-border/40 text-xs font-semibold text-muted-foreground">
          <span className="text-foreground">
            <strong className="text-foreground font-black">{initialCommunities.length}</strong> Total Hubs
          </span>
          <span>•</span>
          <span className="text-foreground">
            <strong className="text-foreground font-black">{joinedCount}</strong> Joined
          </span>
          <span>•</span>
          <span className="text-foreground flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-500" /> Student Verified
          </span>
        </div>
      </div>

      {/* ─── View Toggle (Directory vs Feed) ─── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("directory")}
            className={cn(
              "px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
              viewMode === "directory"
                ? "bg-foreground text-background font-black shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Explore Hubs ({initialCommunities.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode("feed")}
            className={cn(
              "px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
              viewMode === "feed"
                ? "bg-foreground text-background font-black shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Flame className="size-3 text-amber-500" />
            <span>Community Feed</span>
          </button>
        </div>
      </div>

      {/* ─── DIRECTORY VIEW ─── */}
      {viewMode === "directory" && (
        <div className="space-y-4">
          {/* Search & Category Pills */}
          <div className="space-y-2.5">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search communities by name, topic, or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-full border border-border/50 bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs",
                    selectedCategory === cat
                      ? "bg-foreground text-background font-black"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat === "Joined" ? `Joined (${joinedCount})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Communities Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredCommunities.map((c) => {
              const isMember = c.members.some((m) => m.userId === profileId);
              const membersCount = c.members.length;

              return (
                <div
                  key={c.id}
                  className="rounded-3xl bg-card p-4.5 hover:bg-muted/30 transition-all flex flex-col justify-between space-y-3.5 shadow-2xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/app/communities/${c.slug || c.id}`} className="flex items-center gap-3 min-w-0">
                        <div
                          className={`size-12 rounded-2xl bg-gradient-to-br ${getInitialsGradient(
                            c.name
                          )} flex items-center justify-center text-white text-base font-black shadow-md shrink-0`}
                        >
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                            c/{c.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
                            <span>{membersCount} {membersCount === 1 ? "member" : "members"}</span>
                            <span>•</span>
                            <span className="text-primary font-bold">{c.category || "General"}</span>
                          </div>
                        </div>
                      </Link>

                      {/* Privacy Badge */}
                      <div className="shrink-0">
                        {c.privacy === "PRIVATE" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Lock className="size-2.5" /> Private
                          </span>
                        ) : c.privacy === "UNLISTED" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <EyeOff className="size-2.5" /> Secret
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted/70 text-muted-foreground flex items-center gap-1">
                            <Globe className="size-2.5" /> Public
                          </span>
                        )}
                      </div>
                    </div>

                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                    <Link
                      href={`/app/communities/${c.slug || c.id}`}
                      className="font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Enter Hub</span>
                      <span>→</span>
                    </Link>

                    <JoinCommunityButton communityId={c.id} initialIsMember={isMember} />
                  </div>
                </div>
              );
            })}

            {filteredCommunities.length === 0 && (
              <div className="col-span-full py-16 text-center rounded-3xl bg-card text-muted-foreground text-xs font-semibold space-y-3 shadow-2xs">
                <Compass className="size-8 mx-auto text-muted-foreground/40" />
                <p className="font-bold text-foreground">No communities found in this category.</p>
                <Link
                  href="/app/communities/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Found This Community</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── COMMUNITY FEED VIEW ─── */}
      {viewMode === "feed" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3.5">
            {initialPosts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={profileId} />
            ))}

            {initialPosts.length === 0 && (
              <div className="text-center py-16 rounded-3xl bg-card text-muted-foreground text-xs font-semibold space-y-2 shadow-2xs">
                <Sparkles className="size-8 mx-auto text-muted-foreground/40" />
                <p className="font-bold text-foreground">No community discussions posted yet.</p>
                <p>Join a community to start the first conversation!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
