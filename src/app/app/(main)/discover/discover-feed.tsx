"use client";

import {
  Globe,
  GraduationCap,
  Hash,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  School,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { FeaturedCampusCard } from "@/components/discover/featured-campus-card";
import { FollowButton } from "@/components/profile/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import type { UserProfile } from "@/db/schema";
import { useColleges } from "@/hooks/use-colleges";
import { type FeedPost, useFeed } from "@/hooks/use-feed";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "EXPLORE", label: "Explore" },
  { id: "TRENDING", label: "Trending" },
  { id: "COLLEGES", label: "Colleges" },
  { id: "CONFESSIONS", label: "Confessions" },
] as const;

type DiscoverTab = (typeof TABS)[number]["id"];
type SearchTab = "ALL" | "PEOPLE" | "POSTS" | "COLLEGES" | "COMMUNITIES";

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

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  officialName?: string | null;
  avatarUrl: string | null;
  headline?: string | null;
  bio?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  points?: number;
  interests?: string[] | null;
  institution?: {
    id: string;
    name: string;
    state?: string | null;
    district?: string | null;
  } | null;
}

interface CollegeItem {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
  nirfRank?: number | null;
  logoUrl?: string | null;
  description?: string | null;
}

interface CommunityItem {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  category?: string | null;
}

export function DiscoverFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read initial query / scope / tab from URL parameters
  const initialQuery = searchParams.get("q") || "";
  const rawScope = searchParams.get("scope");
  const initialScope: "CAMPUS" | "GLOBAL" = rawScope === "GLOBAL" ? "GLOBAL" : "CAMPUS";

  const rawTab = (searchParams.get("tab") || "EXPLORE").toUpperCase();
  const validTabs: DiscoverTab[] = ["EXPLORE", "TRENDING", "COLLEGES", "CONFESSIONS"];
  const initialTab: DiscoverTab = validTabs.includes(rawTab as DiscoverTab)
    ? (rawTab as DiscoverTab)
    : "EXPLORE";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchTab, setSearchTab] = useState<SearchTab>("ALL");
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">(initialScope);
  const [activeTab, setActiveTab] = useState<DiscoverTab>(initialTab);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegesPage, setCollegesPage] = useState(1);
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});

  // Live Multi-Entity Search API Data
  const trimmedSearch = searchQuery.trim();
  const { data: searchResults, isLoading: isSearchLoading } = useSWR<{
    posts?: FeedPost[];
    colleges?: CollegeItem[];
    users?: UserItem[];
    communities?: CommunityItem[];
  }>(trimmedSearch ? `/api/search?q=${encodeURIComponent(trimmedSearch)}` : null, fetcher, {
    dedupingInterval: 5000,
  });

  const searchUsers = searchResults?.users || [];
  const searchPosts = searchResults?.posts || [];
  const searchCollegesList = searchResults?.colleges || [];
  const searchCommunities = searchResults?.communities || [];
  const totalSearchResults =
    searchUsers.length + searchPosts.length + searchCollegesList.length + searchCommunities.length;

  // Sync state when URL search params change externally
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }

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
  }, [searchParams, validTabs.includes, searchQuery, scope, activeTab]);

  function handleSearchChange(val: string) {
    setSearchQuery(val);
    const trimmed = val.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  }

  function handleClearSearch() {
    sounds.tap();
    haptics.light();
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  }

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
  const { data: trendsData } = useSWR<TrendsResponse>(`/api/trends?scope=${scope}`, fetcher, {
    dedupingInterval: 20000,
  });

  // Suggested peers for inline "Who to follow"
  const { data: suggestedPeers } = useSWR<UserProfile[]>("/api/profile/suggested", fetcher, {
    dedupingInterval: 30000,
  });

  // Discover Algorithmic Feed Tuning
  const feedType = activeTab === "CONFESSIONS" ? "CONFESSION" : undefined;
  const feedSort = activeTab === "TRENDING" ? "viral" : activeTab === "CONFESSIONS" ? "spicy" : "for_you";

  const {
    feed,
    isLoading: feedLoading,
    isLoadingMore,
    isReachingEnd,
    setSize,
  } = useFeed(scope, feedType, feedSort);
  const { colleges, isLoading: collegesLoading } = useColleges(120);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || isReachingEnd || isLoadingMore || trimmedSearch) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setSize((s) => s + 1);
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, setSize, trimmedSearch]);

  async function handleFollowToggle(peerId: string, peerName: string) {
    sounds.tap();
    haptics.light();
    const nextState = !followedIds[peerId];
    setFollowedIds((prev) => ({ ...prev, [peerId]: nextState }));
    if (nextState) {
      toast.success(`Following ${peerName}! ⚡`);
    } else {
      toast.info(`Unfollowed ${peerName}`);
    }
  }

  const trends = trendsData?.trends || [];
  const news = trendsData?.news || [];
  const collegeName = trendsData?.collegeName || "Your Campus";

  // Filter feed by in-page query if any
  const filteredFeed = useMemo(() => {
    if (!feed) return [];
    if (!trimmedSearch) return feed;
    const q = trimmedSearch.toLowerCase();
    return feed.filter(
      (p) =>
        p.body.toLowerCase().includes(q) ||
        p.author?.displayName?.toLowerCase().includes(q) ||
        p.author?.username?.toLowerCase().includes(q) ||
        p.institution?.name?.toLowerCase().includes(q)
    );
  }, [feed, trimmedSearch]);

  const effectiveCollegeQuery = collegeSearch || trimmedSearch;

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
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24 border-x border-border/30 bg-background">
      {/* ─── Twitter/X Style Explore & Search Header ─── */}
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
              {collegeName.split(" ")[0]}
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

          {/* Unified Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search students, posts, colleges...`}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-full bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4.5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-foreground flex items-center justify-center cursor-pointer transition-colors"
                title="Clear search"
              >
                <X className="size-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Tabs: Search Filter Pills OR Explore Stream Tabs */}
        {trimmedSearch ? (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 pt-0.5 border-b border-border/30">
            {[
              { id: "ALL", label: `All (${totalSearchResults})` },
              { id: "PEOPLE", label: `People (${searchUsers.length})` },
              { id: "POSTS", label: `Posts (${searchPosts.length})` },
              { id: "COLLEGES", label: `Colleges (${searchCollegesList.length})` },
              { id: "COMMUNITIES", label: `Communities (${searchCommunities.length})` },
            ].map((tab) => {
              const isActive = searchTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setSearchTab(tab.id as SearchTab);
                  }}
                  className={cn(
                    "px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0",
                    isActive
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : (
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
        )}
      </header>

      {/* ─── LIVE SEARCH RESULTS VIEW ─── */}
      {trimmedSearch ? (
        <div className="flex flex-col px-4 pt-3.5 gap-4">
          {isSearchLoading ? (
            <FeedSkeleton />
          ) : totalSearchResults > 0 ? (
            <>
              {/* Results count banner */}
              <div className="text-[12px] font-semibold text-muted-foreground px-1">
                About {totalSearchResults} {totalSearchResults === 1 ? "result" : "results"} for &ldquo;
                {trimmedSearch}&rdquo;
              </div>

              {/* 1. People / Students Search Results */}
              {(searchTab === "ALL" || searchTab === "PEOPLE") && searchUsers.length > 0 && (
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs divide-y divide-border/20">
                  <div className="px-4 py-2.5 bg-muted/20 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      <span>People ({searchUsers.length})</span>
                    </h3>
                  </div>

                  {searchUsers.map((user) => {
                    const isFollowed = Boolean(followedIds[user.id]);
                    const headline =
                      user.headline ||
                      (user.course && user.branch
                        ? `${user.course} ${user.branch}${user.year ? ` · Year ${user.year}` : ""}`
                        : null);

                    return (
                      <div
                        key={user.id}
                        className="p-4 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3.5"
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <Link href={`/@${user.username}`} className="shrink-0 group">
                            <Avatar className="size-13 border border-border/40">
                              <AvatarImage src={user.avatarUrl || ""} />
                              <AvatarFallback className="text-sm font-black bg-muted text-foreground">
                                {user.displayName[0]}
                              </AvatarFallback>
                            </Avatar>
                          </Link>

                          <div className="min-w-0 flex-1 space-y-1">
                            <Link href={`/@${user.username}`} className="group block">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[15px] font-black text-foreground group-hover:underline">
                                  {user.displayName}
                                </span>
                                {(user.points || 0) >= 150 && (
                                  <ShieldCheck className="size-4 text-[#1d9bf0] shrink-0" />
                                )}
                                <span className="text-xs text-muted-foreground">@{user.username}</span>
                              </div>

                              {headline && (
                                <p className="text-xs font-medium text-foreground line-clamp-1">{headline}</p>
                              )}
                            </Link>

                            {user.institution && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <School className="size-3 shrink-0" />
                                <span className="truncate">{user.institution.name}</span>
                              </p>
                            )}

                            {user.bio && (
                              <p className="text-xs text-muted-foreground/90 line-clamp-2 pt-0.5">
                                {user.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        <FollowButton
                          username={user.username}
                          displayName={user.displayName}
                          initialIsFollowing={isFollowed}
                          size="sm"
                          className="self-start sm:self-center shrink-0"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. Colleges Search Results */}
              {(searchTab === "ALL" || searchTab === "COLLEGES") && searchCollegesList.length > 0 && (
                <div className="space-y-3">
                  <div className="px-1 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="size-3.5" />
                      <span>Colleges ({searchCollegesList.length})</span>
                    </h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {searchCollegesList.map((college) => (
                      <Link
                        key={college.id}
                        href={`/college/${college.slug || college.id}`}
                        className="p-3.5 rounded-2xl border border-border/40 bg-card hover:bg-muted/30 transition-colors block space-y-2 group shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0 border border-primary/20">
                            {college.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                              {college.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate pt-0.5">
                              <MapPin className="size-3 shrink-0" />
                              <span>{college.district || college.state || "India"}</span>
                              {college.nirfRank && (
                                <span className="font-bold text-amber-500">· NIRF #{college.nirfRank}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        {college.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{college.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Communities Search Results */}
              {(searchTab === "ALL" || searchTab === "COMMUNITIES") && searchCommunities.length > 0 && (
                <div className="space-y-3">
                  <div className="px-1 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      <span>Communities ({searchCommunities.length})</span>
                    </h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {searchCommunities.map((community) => (
                      <Link
                        key={community.id}
                        href={`/app/communities/${community.slug || community.id}`}
                        className="p-3.5 rounded-2xl border border-border/40 bg-card hover:bg-muted/30 transition-colors block space-y-2 group shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm shrink-0 border border-purple-500/20">
                            <Hash className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                              {community.name}
                            </h4>
                            {community.category && (
                              <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {community.category}
                              </span>
                            )}
                          </div>
                        </div>
                        {community.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {community.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Posts Search Results */}
              {(searchTab === "ALL" || searchTab === "POSTS") && searchPosts.length > 0 && (
                <div className="space-y-3">
                  <div className="px-1 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MessageCircle className="size-3.5" />
                      <span>Posts ({searchPosts.length})</span>
                    </h3>
                  </div>

                  <div className="divide-y divide-border/25 rounded-2xl border border-border/40 bg-card overflow-hidden">
                    {searchPosts.map((post) => (
                      <FeedCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="size-12 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <Search className="size-6" />
              </div>
              <h3 className="text-base font-black text-foreground">
                No results found for &ldquo;{trimmedSearch}&rdquo;
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Try searching for a student name, college hub, hashtag topic, or community.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ─── STANDARD EXPLORE / TRENDING / COLLEGES / CONFESSIONS TABS ─── */
        <>
          {/* ─── TAB 1: EXPLORE VIEW ─── */}
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
                      className="flex items-start justify-between px-4 py-3 hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">{trend.category}</p>
                        <p className="text-sm font-black text-foreground group-hover:underline">
                          {trend.topic}
                        </p>
                        <p className="text-xs text-muted-foreground">{trend.formattedCount}</p>
                      </div>
                      <MoreHorizontal className="size-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Who to Follow / Connect */}
              {suggestedPeers && suggestedPeers.length > 0 && (
                <div className="border-b border-border/30 pb-4 px-4 space-y-3">
                  <h3 className="text-[17px] font-black text-foreground tracking-tight">Who to follow</h3>
                  <div className="space-y-3">
                    {suggestedPeers.slice(0, 3).map((peer) => {
                      const isFollowed = Boolean(followedIds[peer.id]);
                      return (
                        <div key={peer.id} className="flex items-center justify-between gap-3">
                          <Link href={`/@${peer.username}`} className="flex items-center gap-3 min-w-0 group">
                            <Avatar className="size-10 border border-border/40">
                              <AvatarImage src={peer.avatarUrl || ""} />
                              <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                                {peer.displayName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-black text-foreground group-hover:underline truncate">
                                  {peer.displayName}
                                </p>
                                {(peer.points || 0) >= 150 && (
                                  <ShieldCheck className="size-3.5 text-[#1d9bf0] shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">@{peer.username}</p>
                            </div>
                          </Link>
                          <FollowButton
                            username={peer.username}
                            displayName={peer.displayName}
                            initialIsFollowing={isFollowed}
                            size="sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Infinite Feed Posts */}
              <div className="space-y-4 pt-2">
                <div className="px-4">
                  <h3 className="text-[17px] font-black text-foreground tracking-tight">
                    Recommended For You
                  </h3>
                </div>

                {feedLoading ? (
                  <FeedSkeleton />
                ) : filteredFeed && filteredFeed.length > 0 ? (
                  filteredFeed.map((post) => <FeedCard key={post.id} post={post} />)
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No posts available right now.
                  </div>
                )}

                <div ref={loadMoreRef} className="py-6 text-center">
                  {isLoadingMore && <FeedSkeleton />}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: TRENDING VIEW ─── */}
          {activeTab === "TRENDING" && (
            <div className="space-y-4 pt-3">
              <div className="divide-y divide-border/20 border-b border-border/30 pb-2">
                {trends.length > 0 ? (
                  trends.map((trend) => (
                    <Link
                      key={trend.topic}
                      href={trend.href}
                      className="flex items-start justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">{trend.category}</p>
                        <p className="text-sm font-black text-foreground group-hover:underline">
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
                )}
              </div>

              {/* Trending Ranked Posts Feed */}
              <div className="px-4 pt-4 space-y-4">
                <h2 className="text-[17px] font-black text-foreground tracking-tight">
                  {scope === "CAMPUS" ? `Top Trending in ${collegeName}` : "Viral Posts Across India"}
                </h2>

                {feedLoading ? (
                  <FeedSkeleton />
                ) : filteredFeed && filteredFeed.length > 0 ? (
                  filteredFeed.map((post) => <FeedCard key={post.id} post={post} />)
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No trending posts found.
                  </div>
                )}

                <div ref={loadMoreRef} className="py-6 text-center">
                  {isLoadingMore && <FeedSkeleton />}
                </div>
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
                  {scope === "CAMPUS"
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
                  No confessions found for this scope.
                </div>
              )}

              <div ref={loadMoreRef} className="py-6 text-center">
                {isLoadingMore && <FeedSkeleton />}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
