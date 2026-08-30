"use client";

import { ArticleCard } from "@/components/articles/article-card";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Compass,
  FileText,
  Flame,
  Globe,
  LayoutDashboard,
  PenTool,
  Plus,
  RotateCw,
  School,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

const CATEGORIES = [
  { id: "ALL", label: "All Topics" },
  { id: "TECH_AND_CODE", label: "Tech & Code 💻" },
  { id: "PLACEMENTS", label: "Placements 💼" },
  { id: "CAMPUS_LIFE", label: "Campus Life 🎓" },
  { id: "RESEARCH", label: "Research 🔬" },
  { id: "INTERNSHIPS", label: "Internships 🚀" },
  { id: "PROJECTS", label: "Projects 🛠️" },
  { id: "GUIDES", label: "Guides 📖" },
  { id: "OPINION", label: "Opinion 💭" },
];

export function ArticlesHubClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "ALL");
  const [page, setPage] = useState(1);

  const rawScope = searchParams.get("scope");
  const scope: "CAMPUS" | "GLOBAL" = rawScope === "CAMPUS" ? "CAMPUS" : "GLOBAL";

  const apiUrl = `/api/articles?scope=${scope}&category=${selectedCategory}&q=${encodeURIComponent(
    searchQuery
  )}&page=${page}&limit=12`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    articles: any[];
    page: number;
    hasMore: boolean;
  }>(apiUrl, fetcher, { revalidateIfStale: true, dedupingInterval: 15000 });

  function handleScopeToggle(newScope: "CAMPUS" | "GLOBAL") {
    sounds.tap();
    haptics.light();
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", newScope);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleCategorySelect(catId: string) {
    sounds.tap();
    haptics.light();
    setSelectedCategory(catId);
    setPage(1);
  }

  const articlesList = data?.articles || [];
  const featuredArticle = articlesList[0];
  const restArticles = articlesList.slice(1);

  return (
    <main className="min-h-screen pb-28 border-x border-border/20 bg-background max-w-4xl mx-auto select-none">
      {/* ─── Top Sticky Header (Twitter/X Minimal) ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5 truncate">
              <span>Campus Articles</span>
              <BookOpen className="size-4 text-primary shrink-0" />
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium truncate">
              Roadmaps, placement experiences &amp; student publications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Scope Toggle */}
          <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => handleScopeToggle("GLOBAL")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
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
              onClick={() => handleScopeToggle("CAMPUS")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                scope === "CAMPUS"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <School className="size-3" />
              <span>Campus</span>
            </button>
          </div>

          {/* Author Dashboard */}
          <Link
            href="/app/articles/dashboard"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
            title="Manage my articles and drafts"
          >
            <LayoutDashboard className="size-3.5" />
            <span>My Articles</span>
          </Link>

          {/* Write Article CTA */}
          <Link
            href="/app/articles/new"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <PenTool className="size-3.5" />
            <span>Write (+15 LP)</span>
          </Link>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {/* ─── Hero Spotlight Banner ─── */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-purple-500/10 to-transparent p-6 md:p-8">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-black border border-primary/30">
              <Sparkles className="size-3.5" />
              <span>Verified Student Editorial Hub</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight">
              Placement secrets, tech deep dives &amp; campus journalism.
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
              Read long-form insights written by verified seniors and batchmates across 1,350+ campuses in India.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/app/articles/new"
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-foreground text-background text-xs font-black hover:opacity-90 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <PenTool className="size-4" />
                <span>Write an Article (+15 LP)</span>
              </Link>

              <Link
                href="/app/articles/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-border/80 bg-background/80 hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
              >
                <FileText className="size-4" />
                <span>Drafts &amp; Stats</span>
              </Link>
            </div>
          </div>

          <div className="absolute right-[-40px] bottom-[-40px] size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        </div>

        {/* ─── Search Bar ─── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles by title, roadmap topic, or keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-11 pr-10 rounded-2xl bg-muted/40 border border-border/40 focus:border-primary focus:bg-background text-xs font-medium placeholder:text-muted-foreground outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* ─── Category Filter Chips ─── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                selectedCategory === cat.id
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/40 hover:bg-muted"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ─── Articles Grid ─── */}
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
            <div className="h-72 bg-muted/30 rounded-3xl md:col-span-2" />
            <div className="h-64 bg-muted/30 rounded-3xl" />
            <div className="h-64 bg-muted/30 rounded-3xl" />
          </div>
        ) : articlesList.length > 0 ? (
          <div className="space-y-6">
            {/* Featured Hero Article */}
            {page === 1 && !searchQuery && selectedCategory === "ALL" && featuredArticle && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-primary px-1">
                  <Flame className="size-4 fill-primary" />
                  <span>Featured Read</span>
                </div>
                <ArticleCard article={featuredArticle} featured={true} />
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(page === 1 && !searchQuery && selectedCategory === "ALL" ? restArticles : articlesList).map(
                (art) => (
                  <ArticleCard key={art.id} article={art} />
                )
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/30">
              {page > 1 && (
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-full border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  ← Previous Page
                </button>
              )}

              <span className="text-xs font-bold text-muted-foreground">
                Page {page}
              </span>

              {data?.hasMore && (
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Next Page →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border/60 rounded-3xl bg-muted/10 p-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PenTool className="size-7" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-black text-foreground">No articles found in this category</h3>
              <p className="text-xs text-muted-foreground">
                Be the pioneer writer from your campus to drop placement experiences, tutorials, or student opinions.
              </p>
            </div>
            <Link
              href="/app/articles/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-black hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Write First Article (+15 LP)</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
