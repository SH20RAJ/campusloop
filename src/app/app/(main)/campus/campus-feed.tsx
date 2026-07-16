"use client";

import { useState } from "react";
import { useFeed, useStories } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { StoryRing } from "@/components/ui/story-ring";
import {
  Flame,
  Sparkles,
  Clock,
  MessageCircle,
  Heart,
  HelpCircle,
  ListFilter,
  Globe,
  School,
  UserX,
  UserCheck,
  Users2,
  TrendingUp,
} from "lucide-react";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { cn } from "@/lib/utils";

export function CampusFeed() {
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filter state
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [type, setType] = useState<string>("ALL");
  const [sort, setSort] = useState<string>("latest");
  const [visibility, setVisibility] = useState<string>("all");

  const { feed, isLoading: feedLoading } = useFeed(scope, type, sort, visibility);
  const { stories, mutate: mutateStories, isLoading: storiesLoading } = useStories();

  const activeFiltersCount = 
    (scope !== "CAMPUS" ? 1 : 0) + 
    (type !== "ALL" ? 1 : 0) + 
    (sort !== "latest" ? 1 : 0) + 
    (visibility !== "all" ? 1 : 0);

  const resetFilters = () => {
    setScope("CAMPUS");
    setType("ALL");
    setSort("latest");
    setVisibility("all");
  };

  return (
    <main className="mx-auto flex w-full flex-col min-h-screen">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-orange-500 text-[10px] font-bold text-white shadow-sm">
              CL
            </div>
            <h1 className="text-base font-extrabold tracking-tight">
              Campus <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Feed</span>
            </h1>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-all cursor-pointer",
              showFilters || activeFiltersCount > 0
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
            )}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* ─── Advanced Filter Panel ─── */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out border-t border-transparent bg-muted/20",
            showFilters ? "max-h-[380px] border-border/50 pb-4 pt-3.5" : "max-h-0 pb-0 pt-0"
          )}
        >
          <div className="px-4 space-y-4">
            {/* Grid layout for categories */}
            <div className="grid grid-cols-2 gap-4">
              {/* Scope filter */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Scope</span>
                <div className="flex rounded-lg bg-muted p-0.5 border border-border/60">
                  <button
                    onClick={() => setScope("CAMPUS")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                      scope === "CAMPUS" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    <School className="h-3 w-3" />
                    Local
                  </button>
                  <button
                    onClick={() => setScope("GLOBAL")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                      scope === "GLOBAL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    <Globe className="h-3 w-3" />
                    Global
                  </button>
                </div>
              </div>

              {/* Visibility Filter */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Identity</span>
                <div className="flex rounded-lg bg-muted p-0.5 border border-border/60">
                  <button
                    onClick={() => setVisibility("all")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                      visibility === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    <Users2 className="h-3 w-3" />
                    All
                  </button>
                  <button
                    onClick={() => setVisibility("anonymous")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                      visibility === "anonymous" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    <UserX className="h-3 w-3" />
                    Anon
                  </button>
                  <button
                    onClick={() => setVisibility("public")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                      visibility === "public" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    <UserCheck className="h-3 w-3" />
                    Public
                  </button>
                </div>
              </div>
            </div>

            {/* Sorting options */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Sort By</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "latest", label: "Latest", icon: Clock },
                  { id: "trending", label: "Trending", icon: Flame },
                  { id: "top_voted", label: "Top Voted", icon: TrendingUp },
                  { id: "most_discussed", label: "Most Discussed", icon: MessageCircle },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSort(s.id)}
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer",
                        sort === s.id
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Categories */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Category</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "ALL", label: "All Posts", icon: Sparkles },
                  { id: "CONFESSION", label: "Confessions", icon: Heart },
                  { id: "POLL", label: "Polls", icon: MessageCircle },
                  { id: "QUESTION", label: "Questions", icon: HelpCircle },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer",
                        type === t.id
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset option */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Stories Ring ─── */}
      <div className="w-full">
        {storiesLoading ? (
          <div className="flex gap-4 px-4 py-5 overflow-x-auto border-b border-border/50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
                <div className="h-2.5 w-10 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <StoryRing users={stories || []} />
        )}
      </div>

      {/* ─── Feed ─── */}
      <div className="flex flex-col px-4 pt-4 pb-16 gap-4">
        {feedLoading ? (
          <FeedSkeleton />
        ) : feed && feed.length > 0 ? (
          feed.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 mb-4">
              <Sparkles className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              Your feed is quiet
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs px-4">
              No posts matched your active filter settings. Try resetting filters or post something yourself!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
