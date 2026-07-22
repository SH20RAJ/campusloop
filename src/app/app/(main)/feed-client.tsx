"use client";

import { useState, useEffect } from "react";
import { useFeed, useStories } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { StoryRing } from "@/components/ui/story-ring";
import {
  InlineCommunitiesWidget,
  InlineDatingWidget,
  InlineHashtagsWidget,
  InlineReferralWidget,
} from "@/components/ui/inline-feed-widgets";
import {
  Sparkles,
  Plus,
  Globe,
  School,
  ListFilter,
} from "lucide-react";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import useSWR from "swr";

interface MyProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  institution?: { name: string } | null;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((r) => r.json() as Promise<T>);

export function FeedClient() {
  const [showFilters, setShowFilters] = useState(false);
  
  // Dashboard state
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("GLOBAL");
  const [type, setType] = useState<string>("ALL");
  const [sort, setSort] = useState<string>("latest");
  const [visibility, setVisibility] = useState<string>("all");

  const { 
    feed, 
    isLoading: feedLoading, 
    isLoadingMore, 
    isReachingEnd, 
    size, 
    setSize 
  } = useFeed(scope, type, sort, visibility);
  
  const { stories, mutate: mutateStories, isLoading: storiesLoading } = useStories();
  const { data: profile } = useSWR<MyProfile>("/api/profile/me", fetcher);

  // Infinite scroll trigger ref and observer
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef || isReachingEnd || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef);
    return () => observer.disconnect();
  }, [loadMoreRef, isReachingEnd, isLoadingMore, setSize]);

  const activeFiltersCount = 
    (scope !== "GLOBAL" ? 1 : 0) + 
    (type !== "ALL" ? 1 : 0) + 
    (sort !== "latest" ? 1 : 0) + 
    (visibility !== "all" ? 1 : 0);

  const resetFilters = () => {
    setScope("GLOBAL");
    setType("ALL");
    setSort("latest");
    setVisibility("all");
  };

  return (
    <main className="mx-auto flex w-full flex-col min-h-screen max-w-2xl bg-background text-foreground pb-20">
      {/* ─── Premium Header ─── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-foreground">
              Campus <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Pulse</span>
            </span>
          </div>

          {/* Scope selection pill */}
          <div className="flex rounded-full bg-muted/65 p-0.5 border border-border/40 shadow-sm text-[10px] font-bold">
            <button
              onClick={() => setScope("CAMPUS")}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer",
                scope === "CAMPUS" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <School className="h-3 w-3" />
              {profile?.institution?.name?.split(",")[0] || "My College"}
            </button>
            <button
              onClick={() => setScope("GLOBAL")}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer",
                scope === "GLOBAL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Globe className="h-3 w-3" />
              Global
            </button>
          </div>
        </div>

        {/* Minimal Sub-navigation/Filters bar */}
        <div className="flex items-center justify-between border-t border-border/10 pt-2.5">
          {/* Sort links */}
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            {[
              { id: "latest", label: "Latest" },
              { id: "trending", label: "Trending" },
              { id: "top_voted", label: "Top Voted" },
              { id: "most_discussed", label: "Discussed" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={cn(
                  "hover:text-foreground transition-colors cursor-pointer relative py-0.5",
                  sort === s.id && "text-foreground"
                )}
              >
                {s.label}
                {sort === s.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary animate-in fade-in" />
                )}
              </button>
            ))}
          </div>

          {/* Toggle filter drawer button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex h-7 items-center gap-1 rounded-xl px-2 text-[10px] font-bold border transition-all cursor-pointer",
              showFilters || activeFiltersCount > 1 // scope & sort active by default
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-transparent text-muted-foreground hover:bg-muted/50"
            )}
          >
            <ListFilter className="h-3 w-3" />
            <span>Identity/Filter</span>
          </button>
        </div>

        {/* Advanced Filters Dropdown */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out border-t border-transparent bg-muted/10 rounded-2xl",
            showFilters ? "max-h-[160px] border-border/30 pb-3.5 pt-3 px-3.5 mt-2" : "max-h-0 pb-0 pt-0"
          )}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Identity filter */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Show Posts By</span>
              <div className="flex rounded-lg bg-muted/65 p-0.5 border border-border/40 text-[9px] font-bold">
                <button
                  onClick={() => setVisibility("all")}
                  className={cn(
                    "flex-1 py-1 rounded-md transition-all cursor-pointer",
                    visibility === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setVisibility("anonymous")}
                  className={cn(
                    "flex-1 py-1 rounded-md transition-all cursor-pointer",
                    visibility === "anonymous" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Anonymous
                </button>
                <button
                  onClick={() => setVisibility("public")}
                  className={cn(
                    "flex-1 py-1 rounded-md transition-all cursor-pointer",
                    visibility === "public" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Public
                </button>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Category</span>
              <div className="flex rounded-lg bg-muted/65 p-0.5 border border-border/40 text-[9px] font-bold">
                <button
                  onClick={() => setType("ALL")}
                  className={cn(
                    "flex-1 py-1 rounded-md transition-all cursor-pointer",
                    type === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setType("CONFESSION")}
                  className={cn(
                    "flex-1 py-1 rounded-md transition-all cursor-pointer",
                    type === "CONFESSION" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Confess
                </button>
                <button
                  onClick={() => setType("POLL")}
                  className={cn(
                    "flex-1 py-1 rounded-md transition-all cursor-pointer",
                    type === "POLL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Polls
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-3 text-[10px] font-bold">
            <button onClick={resetFilters} className="text-primary hover:underline cursor-pointer">
              Reset Filters
            </button>
          </div>
        </div>
      </header>

      {/* ─── Story Ring ─── */}
      <div className="w-full">
        {storiesLoading ? (
          <div className="flex gap-4 px-4 py-5 overflow-x-auto border-b border-border/40 bg-card/20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="h-14 w-14 rounded-full bg-muted/65 shimmer-effect" />
                <div className="h-2.5 w-10 bg-muted/65 rounded shimmer-effect" />
              </div>
            ))}
          </div>
        ) : (
          <StoryRing users={stories || []} mutateStories={mutateStories} />
        )}
      </div>

      {/* ─── Quick Composer Box ─── */}
      <div className="px-4 pt-4">
        <Link href="/app/post/new">
          <div className="flex items-center gap-3 bg-card/45 hover:bg-card/85 border border-border/45 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm">
            <Avatar className="h-9 w-9 border border-border/60 shadow-inner shrink-0">
              <AvatarImage src={profile?.avatarUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {profile?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-xs text-muted-foreground font-semibold">
              Share a confession, drop a poll, or ask your campus...
            </div>
            <div className="h-7 w-7 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Plus className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* ─── Main Feed List ─── */}
      <div className="flex flex-col px-4 pt-4 gap-4.5">
        {feedLoading && size === 1 ? (
          <FeedSkeleton />
        ) : feed && feed.length > 0 ? (
          <>
            {feed.map((post, idx) => (
              <div key={post.id} className="space-y-4.5">
                <FeedCard post={post} currentUserId={profile?.id} />
                {idx === 2 && <InlineCommunitiesWidget />}
                {idx === 6 && <InlineDatingWidget />}
                {idx === 10 && <InlineHashtagsWidget />}
                {idx === 14 && <InlineReferralWidget />}
              </div>
            ))}
            
            {/* Load more trigger anchor */}
            {!isReachingEnd && (
              <div 
                ref={setLoadMoreRef} 
                className="flex items-center justify-center py-8 text-xs font-bold text-muted-foreground/80"
              >
                <span className="animate-pulse">Loading more posts...</span>
              </div>
            )}

            {isReachingEnd && (
              <div className="text-center py-10 text-[11px] font-bold text-muted-foreground/50 select-none">
                You've looped through all posts! 🎉
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-card-dark rounded-3xl p-6 border border-border/40 my-4 mx-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 mb-4">
              <Sparkles className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              Your feed is quiet
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs px-4 leading-relaxed">
              No posts matched your active filter settings. Try resetting filters or post something yourself!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
