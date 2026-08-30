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
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
Globe,
MoreHorizontal,
Search,
ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname,useRouter,useSearchParams } from "next/navigation";
import { useEffect,useMemo,useRef,useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const TABS = [
  { id: "EXPLORE", label: "Explore" },
  { id: "TRENDING", label: "Trending" },
  { id: "COLLEGES", label: "Colleges" },
  { id: "CONFESSIONS", label: "Confessions" },
] as const;

type DiscoverTab = (typeof TABS)[number]["id"];

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read initial state from URL query parameters
  const rawScope = searchParams.get("scope");
  const initialScope: "CAMPUS" | "GLOBAL" = rawScope === "GLOBAL" ? "GLOBAL" : "CAMPUS";

  const rawTab = (searchParams.get("tab") || "EXPLORE").toUpperCase();
  const validTabs: DiscoverTab[] = ["EXPLORE", "TRENDING", "COLLEGES", "CONFESSIONS"];
  const initialTab: DiscoverTab = validTabs.includes(rawTab as DiscoverTab)
    ? (rawTab as DiscoverTab)
    : "EXPLORE";

  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">(initialScope);
  const [activeTab, setActiveTab] = useState<DiscoverTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegesPage, setCollegesPage] = useState(1);
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});

  // Sync state when URL search params change externally
  useEffect(() => {
    const currentScope = searchParams.get("scope") === "GLOBAL" ? "GLOBAL" : "CAMPUS";
    if (currentScope !== scope) {
      setScope(currentScope);
    }

    const currentTabRaw = (searchParams.get("tab") || "EXPLORE").toUpperCase();
    const currentTab = validTabs.includes(currentTabRaw as DiscoverTab)
      ? (currentTabRaw as DiscoverTab)
      : "EXPLORE";
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  function handleScopeChange(newScope: "CAMPUS" | "GLOBAL") {
    sounds.tap();
    haptics.light();
    setScope(newScope);
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", newScope);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleTabChange(newTab: DiscoverTab) {
    sounds.pop();
    haptics.light();
    setActiveTab(newTab);
    setCollegesPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab.toLowerCase());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Dynamic live trends from real database
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

  // Discover Algorithmic Feed Tuning
  const feedType = activeTab === "CONFESSIONS" ? "CONFESSION" : undefined;
  const feedSort =
    activeTab === "TRENDING"
      ? "trending"
      : activeTab === "CONFESSIONS"
      ? "trending"
      : "for_you";

  const { feed, isLoading: feedLoading, isLoadingMore, isReachingEnd, setSize } = useFeed(
    scope,
    feedType,
    feedSort
  );
  const { colleges, isLoading: collegesLoading } = useColleges(120);

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

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (activeTab === "COLLEGES") {
      setCollegeSearch(searchQuery);
      setCollegesPage(1);
    } else {
      router.push(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const trends = trendsData?.trends || [];
  const news = trendsData?.news || [];
  const collegeName = trendsData?.collegeName || "Your Campus";

  // Filter feed by in-page search query
  const filteredFeed = useMemo(() => {
    if (!feed) return [];
    if (!searchQuery.trim()) return feed;
    const q = searchQuery.toLowerCase();
    return feed.filter(
      (p) =>
        p.body.toLowerCase().includes(q) ||
        p.author?.displayName?.toLowerCase().includes(q) ||
        p.author?.username?.toLowerCase().includes(q) ||
        p.institution?.name?.toLowerCase().includes(q)
    );
  }, [feed, searchQuery]);

  const effectiveCollegeQuery = collegeSearch || searchQuery;

  const searchedColleges = useMemo(() => {
    if (!colleges) return [];
    if (!effectiveCollegeQuery.trim()) return colleges;
    const q = effectiveCollegeQuery.toLowerCase();
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q)
    );
  }, [colleges, effectiveCollegeQuery]);

  const COLLEGES_PER_PAGE = 16;
  const totalCollegePages = Math.max(1, Math.ceil(searchedColleges.length / COLLEGES_PER_PAGE));
  const paginatedColleges = useMemo(() => {
    const start = (collegesPage - 1) * COLLEGES_PER_PAGE;
    return searchedColleges.slice(start, start + COLLEGES_PER_PAGE);
  }, [searchedColleges, collegesPage]);

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
              onClick={() => handleScopeChange("CAMPUS")}
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
              onClick={() => handleScopeChange("GLOBAL")}
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
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative flex-1 pb-3 pt-1 text-center text-xs font-bold transition-colors cursor-pointer",
                  isActive
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
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

      {/* ─── TAB 1: EXPLORE VIEW ─── */}
      {activeTab === "EXPLORE" && (
        <div className="space-y-4 pt-3">
          {/* Today's Campus News / Top Discussion Card */}
          {news.length > 0 && !searchQuery.trim() && (
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
          {trends.length > 0 && !searchQuery.trim() && (
            <div className="border-b border-border/30 pb-3 divide-y divide-border/20">
              <div className="px-4 pb-2 flex items-center justify-between">
                <h2 className="text-[17px] font-black text-foreground tracking-tight">
                  {scope === "CAMPUS" ? `Trending in ${collegeName}` : "Trending in India"}
                </h2>
                <button
                  type="button"
                  onClick={() => handleTabChange("TRENDING")}
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
                    <p className="text-xs text-muted-foreground">{trend.formattedCount}</p>
                  </div>
                  <MoreHorizontal className="size-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          )}

          {/* Inline "Who to follow" Section */}
          {suggestedPeers && suggestedPeers.length > 0 && !searchQuery.trim() && (
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
              {searchQuery.trim()
                ? `Results for "${searchQuery}"`
                : scope === "CAMPUS"
                ? `Posts for You in ${collegeName}`
                : "Discovery Feed Across India"}
            </h2>

            {feedLoading ? (
              <FeedSkeleton />
            ) : filteredFeed && filteredFeed.length > 0 ? (
              filteredFeed.map((post) => <FeedCard key={post.id} post={post} />)
            ) : (
              <div className="py-16 text-center text-xs text-muted-foreground">
                No posts found {searchQuery.trim() ? `matching "${searchQuery}"` : "for this scope"}.
              </div>
            )}

            {!searchQuery.trim() && (
              <div ref={loadMoreRef} className="py-6 text-center">
                {isLoadingMore && <FeedSkeleton />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: TRENDING VIEW ─── */}
      {activeTab === "TRENDING" && (
        <div className="divide-y divide-border/20 pt-2">
          {/* Hero Banner */}
          {!searchQuery.trim() && (
            <div className="p-4">
              <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-900 via-indigo-950 to-black p-6 text-white shadow-md">
                <div className="space-y-2 relative z-10 max-w-sm">
                  <h3 className="text-lg font-black tracking-tight text-white">
                    {scope === "CAMPUS" ? `${collegeName} Trending` : "Global Campus Trending"}
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Real-time hashtags, active discussions, and viral posts across verified students.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTabChange("EXPLORE")}
                    className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Explore Feed
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Numbered Trends */}
          {!searchQuery.trim() && (
            trends.length > 0 ? (
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
                    <p className="text-xs text-muted-foreground">{trend.formattedCount}</p>
                  </div>
                  <MoreHorizontal className="size-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 mt-1" />
                </Link>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No trending topics recorded yet.
              </div>
            )
          )}

          {/* Trending Ranked Posts Feed */}
          <div className="px-4 pt-4 space-y-4">
            <h2 className="text-[17px] font-black text-foreground tracking-tight">
              {searchQuery.trim()
                ? `Trending Results for "${searchQuery}"`
                : scope === "CAMPUS"
                ? `Top Trending in ${collegeName}`
                : "Viral Posts Across India"}
            </h2>

            {feedLoading ? (
              <FeedSkeleton />
            ) : filteredFeed && filteredFeed.length > 0 ? (
              filteredFeed.map((post) => <FeedCard key={post.id} post={post} />)
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No trending posts found {searchQuery.trim() ? `matching "${searchQuery}"` : "yet"}.
              </div>
            )}

            {!searchQuery.trim() && (
              <div ref={loadMoreRef} className="py-6 text-center">
                {isLoadingMore && <FeedSkeleton />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: COLLEGES DIRECTORY VIEW WITH PAGINATION ─── */}
      {activeTab === "COLLEGES" && (
        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={collegeSearch}
                onChange={(e) => {
                  setCollegeSearch(e.target.value);
                  setCollegesPage(1);
                }}
                placeholder="Search 1,350+ Indian colleges..."
                className="w-full h-10 rounded-full border border-border/50 bg-muted/40 pl-9 pr-4 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
              />
            </div>
            {collegeSearch && (
              <button
                type="button"
                onClick={() => {
                  setCollegeSearch("");
                  setCollegesPage(1);
                }}
                className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
            <span>
              Showing {searchedColleges.length > 0 ? (collegesPage - 1) * COLLEGES_PER_PAGE + 1 : 0} -{" "}
              {Math.min(collegesPage * COLLEGES_PER_PAGE, searchedColleges.length)} of{" "}
              {searchedColleges.length} Indian college hubs
            </span>
            <span>
              Page {collegesPage} of {totalCollegePages}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {collegesLoading ? (
              <div className="col-span-2 space-y-2">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : paginatedColleges.length > 0 ? (
              paginatedColleges.map((college, i) => (
                <FeaturedCampusCard key={college.id} college={college} index={i} />
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-xs text-muted-foreground">
                No college hubs found matching &ldquo;{effectiveCollegeQuery}&rdquo;.
              </div>
            )}
          </div>

          {/* Colleges Pagination Controls */}
          {totalCollegePages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 pb-4">
              <button
                type="button"
                disabled={collegesPage <= 1}
                onClick={() => {
                  setCollegesPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalCollegePages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalCollegePages > 5) {
                    if (collegesPage > 3) {
                      pageNum = collegesPage - 2 + i;
                      if (pageNum > totalCollegePages) pageNum = totalCollegePages - 4 + i;
                    }
                  }
                  const isCurrent = pageNum === collegesPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCollegesPage(pageNum);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={cn(
                        "size-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        isCurrent
                          ? "bg-foreground text-background font-black shadow-xs"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={collegesPage >= totalCollegePages}
                onClick={() => {
                  setCollegesPage((p) => Math.min(totalCollegePages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: CONFESSIONS FEED VIEW ─── */}
      {activeTab === "CONFESSIONS" && (
        <div className="px-4 pt-4 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-[17px] font-black text-foreground tracking-tight">
              {searchQuery.trim()
                ? `Confession Results for "${searchQuery}"`
                : scope === "CAMPUS"
                ? `Anonymous Confessions in ${collegeName}`
                : "Confessions Across Indian Campuses"}
            </h2>
          </div>

          {feedLoading ? (
            <FeedSkeleton />
          ) : filteredFeed && filteredFeed.length > 0 ? (
            filteredFeed.map((post) => <FeedCard key={post.id} post={post} />)
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No confessions found {searchQuery.trim() ? `matching "${searchQuery}"` : "for this scope"}.
            </div>
          )}

          {!searchQuery.trim() && (
            <div ref={loadMoreRef} className="py-6 text-center">
              {isLoadingMore && <FeedSkeleton />}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
