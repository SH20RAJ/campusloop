"use client";

import { FeaturedCampusCard } from "@/components/discover/featured-campus-card";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { useColleges } from "@/hooks/use-colleges";
import { useFeed } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import {
Cake,
Compass,
Flame,
Heart,
HelpCircle,
School,
Search,
Users,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
import Link from "next/link";
import { useEffect,useMemo,useRef,useState } from "react";

const TABS = [
  { id: "TRENDING", label: "Trending", icon: Flame },
  { id: "CONFESSION", label: "Confessions", icon: Heart },
  { id: "QUESTION", label: "Questions", icon: HelpCircle },
  { id: "COLLEGES", label: "Colleges", icon: School },
] as const;

export function DiscoverFeed() {
  const [activeTab, setActiveTab] = useState<"TRENDING" | "CONFESSION" | "QUESTION" | "COLLEGES">("TRENDING");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [collegeSearch, setCollegeSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const feedType = activeTab === "TRENDING" || activeTab === "COLLEGES" ? undefined : activeTab;
  const { feed, isLoading: feedLoading, isLoadingMore, isReachingEnd, setSize } = useFeed("GLOBAL", feedType);
  const { colleges, isLoading: collegesLoading } = useColleges(60);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || isReachingEnd || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setSize((s) => s + 1);
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, setSize]);

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
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 pt-3.5 pb-0 backdrop-blur-xl border-b border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Compass className="size-4" />
            </div>
            <h1 className="text-base font-black tracking-tight text-foreground">Discover</h1>
          </div>

          <span className="text-[10px] font-bold text-muted-foreground">All India Campuses</span>
        </div>

        {/* ─── Fast Exploration Category Quick Hub (Interlinking all key sections) ─── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Link
            href="/app/dating"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold shrink-0 transition-colors shadow-2xs"
          >
            <Heart className="size-3.5" />
            <span>Matches</span>
          </Link>

          <Link
            href="/app/communities"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold shrink-0 transition-colors shadow-2xs"
          >
            <Users className="size-3.5" />
            <span>Communities</span>
          </Link>

          <Link
            href="/app/colleges"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0 transition-colors shadow-2xs"
          >
            <School className="size-3.5" />
            <span>Colleges</span>
          </Link>

          <Link
            href="/app/birthdays"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold shrink-0 transition-colors shadow-2xs"
          >
            <Cake className="size-3.5" />
            <span>Birthdays</span>
          </Link>

          <Link
            href="/app/confessions"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0 transition-colors shadow-2xs"
          >
            <Flame className="size-3.5" />
            <span>Confessions</span>
          </Link>
        </div>

        {/* Animated Tabs */}
        <div className="relative flex border-b border-border/30">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 pb-2.5 pt-1 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                  isActive ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-3.5", isActive && "text-primary")} />
                <span>{tab.label}</span>
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

      {/* ─── Dedicated Colleges Tab View ─── */}
      {activeTab === "COLLEGES" ? (
        <div className="px-4 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={collegeSearch}
              onChange={(e) => setCollegeSearch(e.target.value)}
              placeholder="Search 1,350+ Indian colleges..."
              className="w-full h-10 rounded-full border border-border/50 bg-muted/40 pl-9 pr-4 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {collegesLoading ? (
              <div className="col-span-2 space-y-2">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : searchedColleges.length > 0 ? (
              searchedColleges.slice(0, 16).map((college, i) => (
                <FeaturedCampusCard key={college.id} college={college} index={i} />
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-xs text-muted-foreground">
                No college hubs found matching &ldquo;{collegeSearch}&rdquo;.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col px-4 pt-3 pb-24 gap-3.5">

          {selectedCollege && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
              <span className="text-xs font-bold text-primary truncate">
                Filtered by {selectedCollege.name}
              </span>
              <button
                onClick={() => setSelectedCollegeId(null)}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {feedLoading ? (
            <FeedSkeleton />
          ) : filteredFeed && filteredFeed.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredFeed.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <FeedCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-muted-foreground">
              <Compass className="size-10 text-muted-foreground/40" />
              <p className="text-xs font-bold text-foreground">No posts found in this feed</p>
              <p className="text-[11px]">Be the first from your campus to share a story or confession.</p>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="py-4 text-center">
            {isLoadingMore && <FeedSkeleton />}
            {isReachingEnd && filteredFeed && filteredFeed.length > 0 && (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                You&apos;ve reached the end of the feed
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
