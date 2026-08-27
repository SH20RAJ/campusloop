"use client";

import { FeaturedCampusCard } from "@/components/discover/featured-campus-card";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { useColleges } from "@/hooks/use-colleges";
import { useFeed } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import {
Compass,
Flame,
Heart,
HelpCircle,
School,
Search,
X,
} from "lucide-react";
import { AnimatePresence,motion } from "motion/react";
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
      {/* ─── Twitter/X Style Explore Header ─── */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 pt-3 backdrop-blur-xl border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-black tracking-tight text-foreground">Explore</h1>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground">
            All India Campuses
          </span>
        </div>

        {/* Clean Twitter Style Animated Tabs */}
        <div className="flex border-b border-border/30">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 pb-3 pt-1 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                  isActive ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                )}
              >
                <Icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="discover-tab-indicator"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Colleges Directory View ─── */}
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
              className="w-full h-10 rounded-full border border-border/50 bg-muted/40 pl-9 pr-4 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
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
        <div className="flex flex-col px-4 pt-3 pb-24 gap-4">
          {/* Active Filter Pill */}
          {selectedCollege && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-card border border-border/60 shadow-xs">
              <span className="text-xs font-bold text-foreground truncate">
                Filtered by {selectedCollege.name}
              </span>
              <button
                onClick={() => setSelectedCollegeId(null)}
                className="flex size-6 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
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
