"use client";

import { BookOpen, Globe, PenTool, RotateCw, School, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticlesRightSidebar } from "@/components/articles/articles-right-sidebar";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const ARTICLE_CATEGORIES = [
  { id: "ALL", label: "All Topics" },
  { id: "tech", label: "Tech & Code 💻" },
  { id: "placements", label: "Placements 💼" },
  { id: "campus_life", label: "Campus Life 🏫" },
  { id: "ai_research", label: "AI & Research 🤖" },
  { id: "startups", label: "Startups & Web3 🚀" },
  { id: "academics", label: "Academics 📚" },
];

const FEED_TABS = [
  { id: "trending", label: "Trending Stories 🔥" },
  { id: "latest", label: "Latest 🕒" },
  { id: "top", label: "Top Rated 🏆" },
] as const;

export function ArticlesHubClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<"trending" | "latest" | "top">("trending");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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

  const endpoint = `/api/articles?category=${selectedCategory}&scope=${scope}&sort=${activeTab}&q=${encodeURIComponent(
    searchQuery
  )}`;

  const { data, error, isLoading, mutate } = useSWR<{
    articles: any[];
    currentProfile?: any;
  }>(endpoint, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 15000,
  });

  const articles = data?.articles || [];
  const currentProfile = data?.currentProfile;

  async function handleRefresh() {
    setIsRefreshing(true);
    sounds.tap();
    haptics.medium();
    await mutate();
    setTimeout(() => setIsRefreshing(false), 500);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 select-none">
      {/* ─── Hashnode / Medium 2-Column Responsive Layout ─── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ─── Left / Main Publication Column ─── */}
        <div className="flex-1 w-full min-w-0 max-w-3xl space-y-5">
          {/* ─── Sticky Controls Header (Search + Scope + Topic Chips) ─── */}
          <div className="space-y-3">
            {/* Search + Scope Bar */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search articles by title, roadmap topic, author..."
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
                    "flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
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
                    "flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
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
                className="flex size-10 items-center justify-center rounded-2xl border border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
                title="Refresh feed"
              >
                <RotateCw className={cn("size-4", isRefreshing && "animate-spin text-primary")} />
              </button>
            </div>

            {/* Horizontal Scrollable Category Chips */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1">
              {ARTICLE_CATEGORIES.map((cat) => {
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
                      "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                      isActive
                        ? "bg-foreground text-background shadow-xs font-black"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                    )}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Medium-Style Feed Tabs ─── */}
          <div className="flex items-center justify-between border-b border-border/30 pt-2">
            <div className="flex items-center gap-6 text-xs sm:text-sm font-bold">
              {FEED_TABS.map((tab) => {
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
                      "pb-3 transition-colors relative cursor-pointer flex items-center gap-1",
                      isActive ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{tab.label}</span>
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
              {articles.length} {articles.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {/* ─── Article Cards Feed (Clean Medium / Hashnode Style) ─── */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
                <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
                <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
              </div>
            ) : articles.length > 0 ? (
              <div className="divide-y divide-border/25">
                {articles.map((article) => (
                  <div key={article.id} className="py-5 first:pt-0 last:pb-0">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/60 bg-muted/10 p-8">
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
          </div>
        </div>

        {/* ─── Right Editorial Sidebar (Desktop Only) ─── */}
        <ArticlesRightSidebar />
      </div>
    </div>
  );
}
