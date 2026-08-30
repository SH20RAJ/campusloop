"use client";

import { ArrowUpDown, Compass, Hash, Loader2, Lock, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FeedCard } from "@/components/ui/feed-card";
import type { FeedPost } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import { CollegeClubsView } from "./college-clubs-view";
import { CollegeHeroHeader } from "./college-hero-header";
import { CollegeLeaderboardPodium } from "./college-leaderboard-podium";
import { CollegeRealityScorecard } from "./college-reality-scorecard";

interface StudentItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  points?: number | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  headline?: string | null;
}

interface CompetitorCollege {
  id: string;
  name: string;
  slug: string;
  district?: string | null;
  state?: string | null;
  points: number;
  studentsCount: number;
}

interface CollegeHubClientProps {
  college: {
    id: string;
    slug: string;
    name: string;
    state?: string | null;
    district?: string | null;
    website?: string | null;
    yearOfEstablishment?: number | null;
    aisheCode?: string | null;
    locationType?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    nirfRank?: number | null;
    description?: string | null;
  };
  initialPosts: FeedPost[];
  students: StudentItem[];
  relatedColleges: CompetitorCollege[];
  collectivePoints: number;
  currentUserId?: string;
  isEnrolledHere: boolean;
  trendingTags: string[];
}

type TabType = "feed" | "students" | "clubs" | "info";
type PostCategoryFilter = "ALL" | "CONFESSION" | "QUESTION" | "POLL" | "EVENT" | "NORMAL";
type PostSortOrder = "LATEST" | "TOP_VOTED" | "MOST_DISCUSSED";

export function CollegeHubClient({
  college,
  initialPosts,
  students,
  collectivePoints,
  currentUserId,
  isEnrolledHere,
  trendingTags,
}: CollegeHubClientProps) {
  const router = useRouter();

  // Tab & Filters State
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<PostCategoryFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<PostSortOrder>("LATEST");

  // Infinite Scroll State for Posts
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setHasMore(initialPosts.length >= 20);
  }, [initialPosts]);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(`/api/feed?institutionId=${college.id}&page=${nextPage}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch more posts");
      const newPosts = (await res.json()) as FeedPost[];

      if (newPosts.length === 0 || newPosts.length < 20) {
        setHasMore(false);
      }

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, college.id]);

  useEffect(() => {
    const sentinel = observerRef.current;
    if (!sentinel || !hasMore || activeTab !== "feed") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.2, rootMargin: "150px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMorePosts, activeTab]);

  // Filtered and Sorted Posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.body.toLowerCase().includes(q) ||
          p.author?.displayName?.toLowerCase().includes(q) ||
          p.author?.username?.toLowerCase().includes(q)
      );
    }

    // Category Filter
    if (categoryFilter !== "ALL") {
      result = result.filter((p) => p.type === categoryFilter);
    }

    // Sort order
    if (sortOrder === "TOP_VOTED") {
      result.sort((a, b) => b.votesCount - a.votesCount);
    } else if (sortOrder === "MOST_DISCUSSED") {
      result.sort((a, b) => b.commentsCount - a.commentsCount);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [posts, searchQuery, categoryFilter, sortOrder]);

  function handleAskSenior() {
    router.push(`/app/post/new?tag=AskSeniors&college=${college.slug}`);
  }

  const shortName = college.name.split(",")[0];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col min-h-screen pb-24 px-3 sm:px-4 pt-3 gap-5 select-none">
      {/* ─── Clean College Header ─── */}
      <CollegeHeroHeader
        college={college}
        studentCount={students.length}
        postsCount={posts.length}
        collectivePoints={collectivePoints}
        stateRank={1}
        isEnrolledHere={isEnrolledHere}
        onAskSeniorClick={handleAskSenior}
      />

      {/* ─── Clean Navigation Underline / Pill Tabs ─── */}
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 bg-background/85 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {/* Tab 1: Campus Feed */}
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              activeTab === "feed"
                ? "bg-foreground text-background font-black"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span>Feed</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                activeTab === "feed" ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
              )}
            >
              {posts.length}
            </span>
          </button>

          {/* Tab 2: Students & Leaderboard */}
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              activeTab === "students"
                ? "bg-foreground text-background font-black"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span>Students ({students.length})</span>
          </button>

          {/* Tab 3: Societies & Clubs */}
          <button
            type="button"
            onClick={() => setActiveTab("clubs")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              activeTab === "clubs"
                ? "bg-foreground text-background font-black"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span>Clubs &amp; Societies</span>
          </button>

          {/* Tab 4: Campus Info & Insights */}
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              activeTab === "info"
                ? "bg-foreground text-background font-black"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <span>Campus Info &amp; Q&amp;A</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: CAMPUS FEED ─── */}
      {activeTab === "feed" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Universal In-College Search & Filter Bar */}
          <div className="space-y-2.5">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search discussions, confessions & polls in ${shortName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-full border border-border/50 bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills & Sort */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("ALL")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs",
                    categoryFilter === "ALL"
                      ? "bg-foreground text-background font-black"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  All ({posts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("CONFESSION")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs",
                    categoryFilter === "CONFESSION"
                      ? "bg-foreground text-background font-black"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Confessions
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("QUESTION")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs",
                    categoryFilter === "QUESTION"
                      ? "bg-foreground text-background font-black"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Questions
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("POLL")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs",
                    categoryFilter === "POLL"
                      ? "bg-foreground text-background font-black"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Polls
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("EVENT")}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs",
                    categoryFilter === "EVENT"
                      ? "bg-foreground text-background font-black"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Events
                </button>
              </div>

              {/* Sort Dropdown / Toggle */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setSortOrder(
                      sortOrder === "LATEST"
                        ? "TOP_VOTED"
                        : sortOrder === "TOP_VOTED"
                          ? "MOST_DISCUSSED"
                          : "LATEST"
                    )
                  }
                  className="px-3 py-1 rounded-full border border-border/80 bg-card text-[11px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <ArrowUpDown className="size-3 text-primary" />
                  <span>
                    {sortOrder === "LATEST"
                      ? "Latest"
                      : sortOrder === "TOP_VOTED"
                        ? "Top Voted"
                        : "Most Discussed"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Trending Hashtags in this college */}
          {trendingTags.length > 0 && (
            <div className="rounded-3xl bg-card p-3.5 space-y-2 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Hash className="size-3 text-primary" /> Trending in {shortName}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map((tag) => (
                  <Link key={tag} href={`/app/hashtag/${tag}`}>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-3 py-1 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Post Prompt Bar */}
          <div className="rounded-3xl bg-card p-4 flex items-center justify-between gap-3 shadow-2xs">
            <p className="text-xs font-bold text-foreground">
              Have something on your mind about {shortName}?
            </p>
            <Link
              href={`/app/post/new?college=${college.slug}`}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="size-3.5" />
              <span>New Post</span>
            </Link>
          </div>

          {/* Posts Stream */}
          <div className="flex flex-col gap-3.5">
            {filteredPosts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 rounded-3xl bg-card text-muted-foreground text-xs font-semibold space-y-3 shadow-2xs">
                <Compass className="size-8 mx-auto text-muted-foreground/40" />
                <p className="font-bold text-foreground">No posts found matching your filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("ALL");
                  }}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
              <div ref={observerRef} className="py-6 flex items-center justify-center">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading more campus threads...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: STUDENTS & LEADERBOARD ─── */}
      {activeTab === "students" && (
        <CollegeLeaderboardPodium students={students} collegeName={college.name} />
      )}

      {/* ─── TAB 3: SOCIETIES & CLUBS ─── */}
      {activeTab === "clubs" && <CollegeClubsView collegeName={college.name} />}

      {/* ─── TAB 4: CAMPUS INFO & Q&A ─── */}
      {activeTab === "info" && (
        <CollegeRealityScorecard
          collegeName={college.name}
          studentCount={students.length}
          nirfRank={college.nirfRank}
          description={college.description}
          onAskSeniorClick={handleAskSenior}
        />
      )}

      {/* ─── Guest Onboarding Invitation if Not Signed In ─── */}
      {!currentUserId && (
        <div className="rounded-3xl bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-black text-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Lock className="size-4 text-primary" /> Are you a student at {shortName}?
            </h4>
            <p className="text-xs text-muted-foreground">
              Sign up with your college email to unlock verified student badges, campus leaderboards, and
              direct messaging.
            </p>
          </div>

          <Link
            href="/join"
            className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer shadow-md shrink-0"
          >
            Join {shortName} Hub
          </Link>
        </div>
      )}
    </main>
  );
}
