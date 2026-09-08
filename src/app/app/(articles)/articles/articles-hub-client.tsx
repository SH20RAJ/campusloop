"use client";

import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Flame,
  Globe,
  GraduationCap,
  Loader2,
  PenTool,
  RotateCw,
  Rocket,
  School,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticlesRightSidebar } from "@/components/articles/articles-right-sidebar";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const ARTICLE_CATEGORIES = [
  { id: "ALL", label: "All Topics", icon: Sparkles },
  { id: "tech", label: "Tech & Code", icon: Code2 },
  { id: "placements", label: "Placements", icon: Briefcase },
  { id: "campus_life", label: "Campus Life", icon: School },
  { id: "ai_research", label: "AI & Research", icon: Cpu },
  { id: "startups", label: "Startups & Web3", icon: Rocket },
  { id: "academics", label: "Academics", icon: GraduationCap },
];

const FEED_TABS = [
  { id: "trending", label: "Trending Stories", icon: Flame },
  { id: "latest", label: "Latest", icon: Clock },
  { id: "top", label: "Top Rated", icon: Trophy },
] as const;

interface ArticlesHubClientProps {
  initialArticles?: any[];
}

export function ArticlesHubClient({ initialArticles = [] }: ArticlesHubClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<"trending" | "latest" | "top">("trending");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Pagination & infinite loading state
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const rawScope = searchParams.get("scope");
  const scope: "CAMPUS" | "GLOBAL" = rawScope === "CAMPUS" ? "CAMPUS" : "GLOBAL";

  function setScopeParam(nextScope: "CAMPUS" | "GLOBAL") {
    const p = new URLSearchParams(searchParams.toString());
    if (nextScope === "CAMPUS") {
      p.set("scope", "CAMPUS");
    } else {
      p.delete("scope");
    }
    router.replace(`${pathname}?${p.toString()}`);
  }

  // Primary page 1 SWR query
  const endpoint = `/api/articles?page=1&limit=12&category=${selectedCategory}&scope=${scope}&sort=${activeTab}&q=${encodeURIComponent(
    searchQuery
  )}`;

  const { data, isLoading, mutate } = useSWR<{
    articles: any[];
    hasMore: boolean;
    currentProfile?: any;
  }>(endpoint, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 10000,
    onSuccess: (newData) => {
      if (newData?.articles) {
        setArticles(newData.articles);
        setHasMore(Boolean(newData.hasMore));
        setPage(1);
      }
    },
  });

  // Load next page function
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const nextEndpoint = `/api/articles?page=${nextPage}&limit=12&category=${selectedCategory}&scope=${scope}&sort=${activeTab}&q=${encodeURIComponent(
        searchQuery
      )}`;
      const res = await fetch(nextEndpoint);
      if (!res.ok) throw new Error("Failed to load more articles");

      const payload = (await res.json()) as { articles: any[]; hasMore: boolean };
      const incoming = payload.articles || [];

      setArticles((prev) => {
        const merged = [...prev, ...incoming];
        const unique = Array.from(new Map(merged.map((a) => [a.id, a])).values());
        return unique;
      });

      setPage(nextPage);
      setHasMore(Boolean(payload.hasMore));
    } catch (err) {
      console.error("Infinite load error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading, page, selectedCategory, scope, activeTab, searchQuery]);

  // Setup IntersectionObserver for auto-infinite scrolling
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          void loadNextPage();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadNextPage, hasMore, isLoading, isLoadingMore]);

  async function handleRefresh() {
    setIsRefreshing(true);
    sounds.tap();
    haptics.medium();
    await mutate();
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 500);
  }

  const displayArticles = articles.length > 0 ? articles : (data?.articles || []);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 select-none">
      {/* ─── Hashnode / Medium 2-Column Responsive Layout ─── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ─── Left / Main Publication Column ─── */}
        <div className="flex-1 w-full min-w-0 max-w-3xl space-y-4 sm:space-y-5">
          {/* ─── Sticky Controls Header (Search + Scope + Topic Chips) ─── */}
          <div className="space-y-3">
            {/* Search + Scope Bar */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search roadmap, interview, tech..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10.5 w-full rounded-2xl border border-border/50 bg-muted/30 pl-10 pr-9 text-xs sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Scope Switcher Pill */}
              <div className="flex items-center rounded-2xl bg-muted/60 p-1 border border-border/40 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setScopeParam("GLOBAL");
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    scope === "GLOBAL"
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Globe className="size-3" />
                  <span>India</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setScopeParam("CAMPUS");
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    scope === "CAMPUS"
                      ? "bg-foreground text-background shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <School className="size-3" />
                  <span>Campus</span>
                </button>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex size-10.5 items-center justify-center rounded-2xl border border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
                title="Refresh feed"
              >
                <RotateCw className={cn("size-4", isRefreshing && "animate-spin text-primary")} />
              </button>
            </div>

            {/* Horizontal Scrollable Category Chips (Rule 11: Zero Raw Emojis) */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
              {ARTICLE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setSelectedCategory(cat.id);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                      isActive
                        ? "bg-foreground text-background shadow-xs font-black"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Medium-Style Feed Tabs ─── */}
          <div className="flex items-center justify-between border-b border-border/30 pt-2">
            <div className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm font-bold">
              {FEED_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setActiveTab(tab.id);
                    }}
                    className={cn(
                      "pb-3 transition-colors relative cursor-pointer flex items-center gap-1.5",
                      isActive ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{tab.label}</span>
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
              {displayArticles.length} {displayArticles.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {/* ─── Article Cards Feed (Clean Medium / Hashnode Style) ─── */}
          <div className="space-y-4">
            {isLoading && displayArticles.length === 0 ? (
              <div className="space-y-4">
                <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
                <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
                <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
              </div>
            ) : displayArticles.length > 0 ? (
              <div className="divide-y divide-border/25">
                {displayArticles.map((article) => (
                  <div key={article.id} className="py-4 sm:py-5 first:pt-0 last:pb-0">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 sm:py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/60 bg-muted/10 p-6 sm:p-8">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                  <BookOpen className="size-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-foreground">No articles found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {searchQuery
                      ? "No articles matched your search query. Try searching for broader keywords."
                      : "Be the pioneer author on your campus to publish an interview roadmap or research guide."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/app/articles/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <PenTool className="size-3.5" />
                    <span>Write First Article (+15 LP)</span>
                  </Link>
                </div>
              </div>
            )}

            {/* ─── Infinite Scroll Loading Indicator & Observer Target ─── */}
            <div ref={observerTargetRef} className="py-4">
              {isLoadingMore && (
                <div className="space-y-3">
                  <div className="h-40 rounded-3xl bg-muted/30 animate-pulse" />
                  <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-bold py-2">
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                    <span>Loading more campus stories...</span>
                  </p>
                </div>
              )}

              {!hasMore && displayArticles.length > 6 && (
                <div className="pt-6 pb-4 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 text-muted-foreground text-[11px] font-bold border border-border/40">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    <span>You are all caught up with campus articles</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Right Editorial Sidebar (Desktop Only) ─── */}
        <ArticlesRightSidebar />
      </div>
    </div>
  );
}
