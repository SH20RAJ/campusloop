"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import useSWR from "swr";
import { useFeed } from "@/hooks/use-feed";
import { useColleges } from "@/hooks/use-colleges";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  HelpCircle,
  Heart,
  Flame,
  School,
  ArrowUpRight,
  MapPin,
  Users,
  Search,
  TrendingUp,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { cn } from "@/lib/utils";

interface College {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
  postCount: number;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => res.json() as Promise<T>);

const TABS = [
  { id: "TRENDING", label: "Trending", icon: Flame },
  { id: "CONFESSION", label: "Confessions", icon: Heart },
  { id: "QUESTION", label: "Questions", icon: HelpCircle },
] as const;

const CAMPUS_COLORS = [
  "from-blue-500/10 to-cyan-500/5",
  "from-violet-500/10 to-purple-500/5",
  "from-emerald-500/10 to-teal-500/5",
  "from-amber-500/10 to-orange-500/5",
  "from-rose-500/10 to-pink-500/5",
  "from-indigo-500/10 to-blue-500/5",
];

const CAMPUS_GLOWS = [
  "hover:border-blue-500/30 hover:shadow-blue-500/5",
  "hover:border-purple-500/30 hover:shadow-purple-500/5",
  "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
  "hover:border-amber-500/30 hover:shadow-amber-500/5",
  "hover:border-rose-500/30 hover:shadow-rose-500/5",
  "hover:border-indigo-500/30 hover:shadow-indigo-500/5",
];

export function DiscoverFeed() {
  const [activeTab, setActiveTab] = useState<"TRENDING" | "CONFESSION" | "QUESTION">("TRENDING");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [showCollegeSearch, setShowCollegeSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const feedType = activeTab === "TRENDING" ? undefined : activeTab;
  const { 
    feed, 
    isLoading: feedLoading, 
    isLoadingMore, 
    isReachingEnd, 
    setSize 
  } = useFeed("GLOBAL", feedType);

  const { colleges, isLoading: collegesLoading } = useColleges(50);

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

  const filteredFeed = feed?.filter((post) =>
    selectedCollegeId ? post.institutionId === selectedCollegeId : true
  );

  const selectedCollege = colleges?.find((c) => c.id === selectedCollegeId);

  // Filter colleges by search
  const searchedColleges = useMemo(() => {
    if (!colleges) return [];
    if (!collegeSearch.trim()) return colleges;
    const q = collegeSearch.toLowerCase();
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q)
    );
  }, [colleges, collegeSearch]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/80 px-4 pt-4 pb-0 backdrop-blur-xl border-b border-border space-y-4">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              Discover
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              What&apos;s happening across all campuses.
            </p>
          </div>
        </div>

        {/* College Selector with Search */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <School className="size-3" /> Explore Campuses
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowCollegeSearch(!showCollegeSearch);
                  if (!showCollegeSearch) {
                    setTimeout(() => searchRef.current?.focus(), 100);
                  }
                }}
                className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Search className="size-3" />
                {showCollegeSearch ? "Close" : "Search"}
              </button>
              {selectedCollege && (
                <button
                  onClick={() => {
                    setSelectedCollegeId(null);
                    setCollegeSearch("");
                  }}
                  className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Search Input */}
          <AnimatePresence>
            {showCollegeSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="relative pb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={collegeSearch}
                    onChange={(e) => setCollegeSearch(e.target.value)}
                    placeholder="Search by name, state, or city..."
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground/60 focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* College Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative">
            <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent z-10" />
            <button
              onClick={() => {
                setSelectedCollegeId(null);
                setCollegeSearch("");
              }}
              className={cn(
                "relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer",
                selectedCollegeId === null
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
              )}
            >
              All Campuses
            </button>
            {collegesLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-full shrink-0" />
                ))}
              </div>
            ) : (
              (collegeSearch ? searchedColleges : colleges)
                ?.slice(0, 20)
                .map((col) => (
                  <button
                    key={col.id}
                    onClick={() => {
                      setSelectedCollegeId(col.id);
                      setCollegeSearch("");
                      setShowCollegeSearch(false);
                    }}
                    className={cn(
                      "relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer",
                      selectedCollegeId === col.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
                    )}
                  >
                    {col.name}
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Animated Tabs */}
        <div className="relative flex border-b border-border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 pb-3 pt-1 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                <Icon className={cn("size-3.5", isActive && "text-primary")} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="discover-tab-indicator"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Featured Campuses Grid */}
      <AnimatePresence mode="wait">
        {!selectedCollegeId && !feedLoading && (
          <motion.div
            key="featured-campuses"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="px-4 pt-6 pb-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                Featured Campuses
              </h2>
            </div>

            {collegesLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
                  >
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/2 rounded-lg" />
                    <Skeleton className="h-7 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(collegeSearch ? searchedColleges : colleges)
                  ?.slice(0, 6)
                  .map((college, i) => (
                    <Link
                      key={college.id}
                      href={`/app/college/${college.slug || college.id}`}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br p-4 transition-all duration-300",
                        "hover:-translate-y-0.5 hover:shadow-md",
                        CAMPUS_COLORS[i % CAMPUS_COLORS.length],
                        CAMPUS_GLOWS[i % CAMPUS_GLOWS.length]
                      )}
                    >
                      {/* Decorative dot */}
                      <div className="pointer-events-none absolute -right-3 -top-3 size-16 rounded-full bg-primary/[0.03] blur-xl" />

                      <div className="relative flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {college.name}
                          </h3>
                          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="size-2.5 shrink-0" />
                            {college.state}
                            {college.district ? `, ${college.district}` : ""}
                          </p>
                        </div>
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/50 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:border-primary/30">
                          <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold bg-background/50 rounded-lg px-2.5 py-1.5 w-fit border border-border/40">
                        <Users className="size-3" />
                        {college.postCount}{" "}
                        {college.postCount === 1 ? "post" : "posts"} in the loop
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed Section */}
      <div className="flex flex-col px-4 pt-4 pb-24 gap-4">
        {/* Feed section header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            {selectedCollege ? (
              <>
                <School className="size-3 text-primary" />
                Posts from {selectedCollege?.name ?? "selected campus"}
              </>
            ) : (
              <>
                <Shuffle className="size-3" />
                {activeTab === "TRENDING"
                  ? "Trending across campuses"
                  : activeTab === "CONFESSION"
                    ? "Anonymous confessions"
                    : "Campus questions"}
              </>
            )}
          </h3>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {filteredFeed?.length ?? 0} posts
          </span>
        </div>

        {/* Feed List with AnimatePresence */}
        {feedLoading ? (
          <FeedSkeleton />
        ) : filteredFeed && filteredFeed.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredFeed.map((post, i) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(i * 0.03, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <FeedCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : null}

        {filteredFeed && filteredFeed.length > 0 && !isReachingEnd && (
          <div
            ref={setLoadMoreRef}
            className="flex items-center justify-center py-8 text-xs font-bold text-muted-foreground/80"
          >
            <span className="animate-pulse">Loading more posts...</span>
          </div>
        )}

        {filteredFeed && filteredFeed.length > 0 && isReachingEnd && (
          <div className="text-center py-10 text-[11px] font-bold text-muted-foreground/50 select-none">
            You&apos;ve reached the end of the loop! 🎉
          </div>
        )}

        {(!filteredFeed || filteredFeed.length === 0) && !feedLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-card/50 px-6"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 mb-4 ring-1 ring-border/50">
              {activeTab === "CONFESSION" ? (
                <Heart className="size-6 text-pink-400/60" />
              ) : activeTab === "QUESTION" ? (
                <HelpCircle className="size-6 text-orange-400/60" />
              ) : (
                <Lightbulb className="size-6 text-amber-400/60" />
              )}
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              {selectedCollege
                ? "No posts from this campus yet"
                : "Nothing trending right now"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px] mx-auto leading-relaxed">
              {selectedCollege
                ? `Be the first from ${selectedCollege?.name ?? "this campus"} to share something!`
                : activeTab === "CONFESSION"
                  ? "No anonymous confessions yet. The bravest voices start the loop."
                  : activeTab === "QUESTION"
                    ? "No questions yet. Ask something your campus needs answering."
                    : "Nothing trending yet. Check back later or switch tabs."}
            </p>
            <Link
              href="/app/post/new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="size-3.5" />
              Create a post
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
