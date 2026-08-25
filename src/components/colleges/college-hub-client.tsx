"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Users,
  Trophy,
  Swords,
  Search,
  ArrowUpDown,
  Lock,
  Plus,
  Compass,
  Building2,
  Loader2,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { FeedCard } from "@/components/ui/feed-card";
import { CollegeHeroHeader } from "./college-hero-header";
import { CollegeLeaderboardPodium } from "./college-leaderboard-podium";
import { CollegeRealityScorecard } from "./college-reality-scorecard";
import { CollegeInterBattle } from "./college-inter-battle";
import { CollegeClubsView } from "./college-clubs-view";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/hooks/use-feed";

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

type TabType = "feed" | "students" | "reality" | "clubs" | "battle";
type PostCategoryFilter = "ALL" | "CONFESSION" | "QUESTION" | "POLL" | "EVENT" | "NORMAL";
type PostSortOrder = "LATEST" | "TOP_VOTED" | "MOST_DISCUSSED";

export function CollegeHubClient({
  college,
  initialPosts,
  students,
  relatedColleges,
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
          (p.author?.displayName && p.author.displayName.toLowerCase().includes(q)) ||
          (p.author?.username && p.author.username.toLowerCase().includes(q))
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
    <main className="mx-auto flex w-full max-w-4xl flex-col min-h-screen pb-24 px-3 sm:px-6 pt-3 gap-6 select-none">
      {/* ─── Grand Airbnb/LinkedIn Hero Header ─── */}
      <CollegeHeroHeader
        college={college}
        studentCount={students.length}
        postsCount={posts.length}
        collectivePoints={collectivePoints}
        stateRank={1}
        isEnrolledHere={isEnrolledHere}
        onAskSeniorClick={handleAskSenior}
      />

      {/* ─── Sticky Glassmorphic Multi-Tab Subpage Router ─── */}
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2.5 bg-background/85 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {/* Tab 1: Feed & Discussions */}
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "feed"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Sparkles className="size-3.5" />
            <span>Discourse &amp; Feed</span>
            <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === "feed" ? "bg-white/20 text-white" : "bg-muted/80 text-muted-foreground")}>
              {posts.length}
            </span>
          </button>

          {/* Tab 2: Students & Leaderboard */}
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "students"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Trophy className="size-3.5 text-amber-500" />
            <span>Hall of Fame</span>
            <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === "students" ? "bg-white/20 text-white" : "bg-muted/80 text-muted-foreground")}>
              {students.length}
            </span>
          </button>

          {/* Tab 3: Reality & JEE Aspirants Guide */}
          <button
            type="button"
            onClick={() => setActiveTab("reality")}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "reality"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Building2 className="size-3.5 text-rose-500" />
            <span>Aspirants Reality Guide</span>
          </button>

          {/* Tab 4: Clubs & Societies */}
          <button
            type="button"
            onClick={() => setActiveTab("clubs")}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "clubs"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Users className="size-3.5 text-blue-500" />
            <span>Societies &amp; Clubs</span>
          </button>

          {/* Tab 5: Inter-College Battle */}
          <button
            type="button"
            onClick={() => setActiveTab("battle")}
            className={cn(
              "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
              activeTab === "battle"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Swords className="size-3.5 text-rose-500" />
            <span>Campus Wars</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: FEED & DISCOURSE VIEW ─── */}
      {activeTab === "feed" && (
        <div className="space-y-5 animate-in fade-in">
          {/* Universal In-College Search & Filter Bar */}
          <div className="space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search confessions, polls, and topics in ${shortName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-card transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    categoryFilter === "ALL"
                      ? "bg-foreground text-background shadow-2xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  All ({posts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("CONFESSION")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    categoryFilter === "CONFESSION"
                      ? "bg-foreground text-background shadow-2xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Confessions
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("QUESTION")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    categoryFilter === "QUESTION"
                      ? "bg-foreground text-background shadow-2xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Questions
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("POLL")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    categoryFilter === "POLL"
                      ? "bg-foreground text-background shadow-2xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Polls
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("EVENT")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    categoryFilter === "EVENT"
                      ? "bg-foreground text-background shadow-2xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Events &amp; Fests
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
                  className="px-2.5 py-1.5 rounded-xl border border-border/80 bg-card text-[11px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <ArrowUpDown className="size-3 text-primary" />
                  <span>
                    {sortOrder === "LATEST"
                      ? "Latest ⚡"
                      : sortOrder === "TOP_VOTED"
                      ? "Top Voted 🔥"
                      : "Discussed 💬"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Trending Hashtags in this college */}
          {trendingTags.length > 0 && (
            <div className="rounded-2xl border border-border/70 bg-card p-3.5 space-y-2 shadow-2xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Hash className="size-3 text-primary" /> Trending in {shortName}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map((tag) => (
                  <Link key={tag} href={`/app/hashtag/${tag}`}>
                    <span className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-bold text-foreground hover:text-primary hover:border-primary/40 transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Post Prompt Bar for Enrolled Students */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 flex items-center justify-between gap-3 shadow-2xs">
            <p className="text-xs font-bold text-foreground">
              Have something on your mind about {shortName}?
            </p>
            <Link
              href={`/app/post/new?college=${college.slug}`}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="size-3.5" />
              <span>Share Thought</span>
            </Link>
          </div>

          {/* Posts Stream */}
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => (
              <FeedCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}

            {filteredPosts.length === 0 && (
              <div className="text-center py-16 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-3">
                <Compass className="size-8 mx-auto text-muted-foreground/40" />
                <p className="font-bold text-foreground">No posts found matching your filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("ALL");
                  }}
                  className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  Clear Search &amp; Filters
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

      {/* ─── TAB 3: REALITY & JEE ASPIRANTS GUIDE ─── */}
      {activeTab === "reality" && (
        <CollegeRealityScorecard
          collegeName={college.name}
          studentCount={students.length}
          nirfRank={college.nirfRank}
          description={college.description}
          onAskSeniorClick={handleAskSenior}
        />
      )}

      {/* ─── TAB 4: SOCIETIES & CLUBS ─── */}
      {activeTab === "clubs" && <CollegeClubsView collegeName={college.name} />}

      {/* ─── TAB 5: INTER-COLLEGE BATTLE ─── */}
      {activeTab === "battle" && (
        <CollegeInterBattle
          currentCollege={{
            id: college.id,
            slug: college.slug,
            name: college.name,
            state: college.state,
            points: collectivePoints,
          }}
          relatedColleges={relatedColleges}
        />
      )}

      {/* ─── Guest Onboarding Invitation if Not Signed In ─── */}
      {!currentUserId && (
        <div className="rounded-3xl border border-dashed border-primary/40 bg-gradient-to-r from-primary/10 via-card to-amber-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-black text-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Lock className="size-4 text-primary" /> Are you a student at {shortName}?
            </h4>
            <p className="text-xs text-muted-foreground">
              Sign up with your official college email to unlock verified badges, anonymous confessions, and campus dating.
            </p>
          </div>

          <Link
            href="/join"
            className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-md shrink-0"
          >
            Join {shortName} Hub 🚀
          </Link>
        </div>
      )}
    </main>
  );
}
