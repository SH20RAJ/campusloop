"use client";

import { FeaturedCampusCard } from "@/components/discover/featured-campus-card";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import type { UserProfile } from "@/db/schema";
import { useColleges } from "@/hooks/use-colleges";
import { useFeed } from "@/hooks/use-feed";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
Globe,
MoreHorizontal,
Search,
ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect,useMemo,useRef,useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const TABS = [
  { id: "EXPLORE", label: "Explore" },
  { id: "TRENDING", label: "Trending" },
  { id: "COLLEGES", label: "Colleges" },
  { id: "CONFESSIONS", label: "Confessions" },
] as const;

interface TrendItem {
  category: string;
  topic: string;
  postCount: number;
  formattedCount: string;
  href: string;
}

interface NewsItem {
  id: string;
  headline: string;
  category: string;
  timeAgo: string;
  postCount: string;
  authorName?: string;
  authorAvatar?: string | null;
  href: string;
}

interface TrendsResponse {
  trends: TrendItem[];
  news: NewsItem[];
  scope: string;
  collegeName: string;
}

export function DiscoverFeed() {
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [activeTab, setActiveTab] = useState<"EXPLORE" | "TRENDING" | "COLLEGES" | "CONFESSIONS">("EXPLORE");
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});

  // Dynamic trends from API
  const { data: trendsData } = useSWR<TrendsResponse>(
    `/api/trends?scope=${scope}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 20000 }
  );

  // Suggested peers for inline "Who to follow"
  const { data: suggestedPeers } = useSWR<UserProfile[]>(
    "/api/profile/suggested",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const feedType = activeTab === "CONFESSIONS" ? "CONFESSION" : undefined;
  const { feed, isLoading: feedLoading, isLoadingMore, isReachingEnd, setSize } = useFeed(scope, feedType);
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

  function handleFollowToggle(peerId: string, peerName: string) {
    setFollowedIds((prev) => {
      const nextState = !prev[peerId];
      if (nextState) {
        toast.success(`Connected with ${peerName}!`);
      }
      return { ...prev, [peerId]: nextState };
    });
  }

  const trends = trendsData?.trends || [];
  const news = trendsData?.news || [];
  const collegeName = trendsData?.collegeName || "Your Campus";

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
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* ─── Twitter/X Style Explore Header ─── */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 pt-3 backdrop-blur-xl border-b border-border/30 space-y-3">
        {/* Scope Pill Switcher & Search Bar */}
        <div className="flex items-center gap-2.5">
          {/* Scope Selector (Around Campus vs Global) */}
          <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => setScope("CAMPUS")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                scope === "CAMPUS"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {collegeName}
            </button>
            <button
              type="button"
              onClick={() => setScope("GLOBAL")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                scope === "GLOBAL"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="size-3" />
              <span>India</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${scope === "CAMPUS" ? collegeName : "all campuses"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-full bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all"
            />
          </div>
        </div>

        {/* Twitter Tabs (Explore, Trending, Colleges, Confessions) */}
        <div className="flex border-b border-border/30">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 pb-3 pt-1 text-center text-xs font-bold transition-colors cursor-pointer",
                  isActive ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                )}
              >
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

      {/* ─── TAB 1: EXPLORE VIEW (Matching Screenshot 2 & 3) ─── */}
      {activeTab === "EXPLORE" && (
        <div className="space-y-4 pt-3">
          {/* Today's Campus News / Top Discussion Card */}
          {news.length > 0 && (
            <div className="border-b border-border/30 pb-3 divide-y divide-border/20">
              <div className="px-4 pb-2">
                <h2 className="text-[17px] font-black text-foreground tracking-tight">
                  Today&apos;s Campus Buzz
                </h2>
              </div>
              {news.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block px-4 py-3 hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <p className="text-sm font-black text-foreground group-hover:underline leading-snug">
                    {item.headline}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <span>{item.timeAgo}</span>
                    <span>·</span>
                    <span className="truncate">{item.category}</span>
                    <span>·</span>
                    <span>{item.postCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Trending Hashtags Section */}
          {trends.length > 0 && (
            <div className="border-b border-border/30 pb-3 divide-y divide-border/20">
              <div className="px-4 pb-2 flex items-center justify-between">
                <h2 className="text-[17px] font-black text-foreground tracking-tight">
                  {scope === "CAMPUS" ? `Trending in ${collegeName}` : "Trending in India"}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("TRENDING")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              {trends.slice(0, 4).map((trend) => (
                <Link
                  key={trend.topic}
                  href={trend.href}
                  className="flex items-start justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground font-medium truncate">
                      {trend.category}
                    </p>
                    <p className="text-sm font-bold text-foreground group-hover:underline truncate">
                      {trend.topic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trend.formattedCount}
                    </p>
                  </div>
                  <MoreHorizontal className="size-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          )}

          {/* Inline "Who to follow" Section (Matching Screenshot 3) */}
          {suggestedPeers && suggestedPeers.length > 0 && (
            <div className="border-b border-border/30 pb-3 divide-y divide-border/20">
              <div className="px-4 pb-2">
                <h2 className="text-[17px] font-black text-foreground tracking-tight">
                  Who to follow
                </h2>
              </div>

              {suggestedPeers.slice(0, 3).map((peer) => {
                const isFollowed = Boolean(followedIds[peer.id]);
                return (
                  <div
                    key={peer.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <Link
                      href={`/@${peer.username}`}
                      className="flex items-center gap-3 min-w-0 flex-1 group"
                    >
                      <Avatar className="size-10 shrink-0 border border-border/40">
                        <AvatarImage src={peer.avatarUrl || ""} />
                        <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                          {peer.displayName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-foreground truncate group-hover:underline flex items-center gap-1">
                          <span>{peer.displayName}</span>
                          {peer.points >= 150 && (
                            <ShieldCheck className="size-3.5 text-[#1d9bf0] shrink-0" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{peer.username}
                        </p>
                      </div>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleFollowToggle(peer.id, peer.displayName)}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-xs font-black transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs",
                        isFollowed
                          ? "border border-border/60 bg-transparent text-foreground hover:border-destructive/40 hover:text-destructive"
                          : "bg-foreground text-background hover:opacity-90"
                      )}
                    >
                      {isFollowed ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Posts For You Feed */}
          <div className="px-4 space-y-4">
            <h2 className="text-[17px] font-black text-foreground tracking-tight pt-2">
              Posts For You
            </h2>

            {feedLoading ? (
              <FeedSkeleton />
            ) : feed && feed.length > 0 ? (
              feed.map((post) => <FeedCard key={post.id} post={post} />)
            ) : (
              <div className="py-16 text-center text-xs text-muted-foreground">
                No posts found for this campus. Be the first to share a vibe!
              </div>
            )}

            <div ref={loadMoreRef} className="py-6 text-center">
              {isLoadingMore && <FeedSkeleton />}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TRENDING VIEW (Matching Screenshot 4) ─── */}
      {activeTab === "TRENDING" && (
        <div className="divide-y divide-border/20 pt-2">
          {/* Hero Banner (Matching Screenshot 4) */}
          <div className="p-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-black p-6 text-white shadow-md">
              <div className="space-y-2 relative z-10 max-w-sm">
                <h3 className="text-lg font-black tracking-tight text-white">
                  {scope === "CAMPUS" ? `${collegeName} Trending` : "Global Campus Trending"}
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Real-time hashtags, active discussions, and hot confessions across verified students.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("EXPLORE")}
                  className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Explore Feed
                </button>
              </div>
            </div>
          </div>

          {/* Numbered Trends (Matching Screenshot 4: 1 · Trending in India, 2 · etc.) */}
          {trends.length > 0 ? (
            trends.map((trend, index) => (
              <Link
                key={trend.topic}
                href={trend.href}
                className="flex items-start justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    {index + 1} · {trend.category}
                  </p>
                  <p className="text-base font-black text-foreground group-hover:underline truncate">
                    {trend.topic}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {trend.formattedCount}
                  </p>
                </div>
                <MoreHorizontal className="size-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 mt-1" />
              </Link>
            ))
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No trending topics recorded yet.
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: COLLEGES DIRECTORY VIEW ─── */}
      {activeTab === "COLLEGES" && (
        <div className="px-4 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
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
      )}

      {/* ─── TAB 4: CONFESSIONS FEED VIEW ─── */}
      {activeTab === "CONFESSIONS" && (
        <div className="px-4 pt-4 space-y-4">
          {feedLoading ? (
            <FeedSkeleton />
          ) : feed && feed.length > 0 ? (
            feed.map((post) => <FeedCard key={post.id} post={post} />)
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No confessions found for this scope.
            </div>
          )}

          <div ref={loadMoreRef} className="py-6 text-center">
            {isLoadingMore && <FeedSkeleton />}
          </div>
        </div>
      )}
    </main>
  );
}
