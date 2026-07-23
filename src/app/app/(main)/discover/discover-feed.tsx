"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useFeed } from "@/hooks/use-feed";
import { useColleges } from "@/hooks/use-colleges";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, HelpCircle, Heart, Flame, School, Search, TrendingUp, Shuffle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { cn } from "@/lib/utils";
import { FeaturedCampusCard } from "@/components/discover/featured-campus-card";

const TABS = [
  { id: "TRENDING", label: "Trending", icon: Flame },
  { id: "CONFESSION", label: "Confessions", icon: Heart },
  { id: "QUESTION", label: "Questions", icon: HelpCircle },
] as const;

export function DiscoverFeed() {
  const [activeTab, setActiveTab] = useState<"TRENDING" | "CONFESSION" | "QUESTION">("TRENDING");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [showCollegeSearch, setShowCollegeSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const feedType = activeTab === "TRENDING" ? undefined : activeTab;
  const { feed, isLoading: feedLoading, isLoadingMore, isReachingEnd, setSize } = useFeed("GLOBAL", feedType);
  const { colleges, isLoading: collegesLoading } = useColleges(50);

  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef || isReachingEnd || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setSize((s) => s + 1);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              Discover
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">What's happening across all campuses.</p>
          </div>
        </div>

        {/* College Selector Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <School className="size-3" /> Explore Campuses
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowCollegeSearch(!showCollegeSearch);
                  if (!showCollegeSearch) setTimeout(() => searchRef.current?.focus(), 100);
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

          <AnimatePresence>
            {showCollegeSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
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
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground/60 focus:border-primary/30 focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative">
            <button
              onClick={() => {
                setSelectedCollegeId(null);
                setCollegeSearch("");
              }}
              className={cn(
                "relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer",
                selectedCollegeId === null
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
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
              (collegeSearch ? searchedColleges : colleges)?.slice(0, 20).map((col) => (
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
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
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
            className="px-4 pt-6 pb-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                Featured Campuses
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(collegeSearch ? searchedColleges : colleges)?.slice(0, 6).map((college, i) => (
                <FeaturedCampusCard key={college.id} college={college} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed Section */}
      <div className="flex flex-col px-4 pt-4 pb-24 gap-4">
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
              >
                <FeedCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/50 px-6 space-y-2">
            <Lightbulb className="size-8 text-amber-500 mx-auto" />
            <h3 className="font-semibold text-foreground text-sm">No posts found</h3>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
              Be the first from this campus to share something on CampusLoop!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
