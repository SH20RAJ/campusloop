"use client";

import { FeedCard } from "@/components/ui/feed-card";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import type { FeedPost } from "@/hooks/use-feed";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bookmark, Compass, Lock, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";

const CATEGORIES = [
  { id: "ALL", label: "All Saved" },
  { id: "HOSTEL", label: "Hostel & Food", keywords: ["hostel", "mess", "food", "room", "canteen"] },
  { id: "PLACEMENTS", label: "Placements", keywords: ["placement", "intern", "package", "ctc", "interview", "salary"] },
  { id: "ACADEMICS", label: "Academics", keywords: ["exam", "professor", "cgpa", "assignment", "attendance", "notes"] },
  { id: "CONFESSIONS", label: "Confessions", keywords: ["confession", "crush", "secret", "anonymous"] },
] as const;

interface SavedApiResponse {
  posts: FeedPost[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export function SavedClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, mutate } = useSWR<SavedApiResponse>(
    "/api/posts/saved",
    fetcher,
    { revalidateOnFocus: true }
  );

  const posts = data?.posts || [];

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          post.body.toLowerCase().includes(q) ||
          post.author?.displayName?.toLowerCase().includes(q) ||
          post.author?.username?.toLowerCase().includes(q) ||
          post.institution?.name?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Category Tag Filter
      if (selectedCategory === "ALL") return true;
      const cat = CATEGORIES.find((c) => c.id === selectedCategory);
      if (!cat || !("keywords" in cat)) return true;

      const bodyLower = post.body.toLowerCase();
      return cat.keywords.some((kw) => bodyLower.includes(kw));
    });
  }, [posts, searchQuery, selectedCategory]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 pt-3.5 pb-2 backdrop-blur-xl border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Bookmark className="size-4.5 fill-amber-500 stroke-amber-500" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
                Saved Posts Vault
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground">
                  {posts.length} {posts.length === 1 ? "Save" : "Saves"}
                </span>
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium">
                Your private archive • Persists permanently across Campus Preview and Student Mode
              </p>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your saved posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-full bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    isActive
                      ? "bg-foreground text-background font-black shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Posts List */}
      <div className="space-y-4 pt-3 px-4">
        {isLoading ? (
          <FeedSkeleton />
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <FeedCard key={post.id} post={{ ...post, isSaved: true }} />
          ))
        ) : (
          <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
            <div className="size-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
              <Bookmark className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">
                {searchQuery || selectedCategory !== "ALL"
                  ? "No matching saves found"
                  : "Your Campus Vault is Empty"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {searchQuery || selectedCategory !== "ALL"
                  ? "Try searching for different keywords or clearing your category filter."
                  : "Tap the 🔖 bookmark icon on any post across the campus feed to archive hostel guides, placement advice, and memes for later."}
              </p>
            </div>
            {!searchQuery && selectedCategory === "ALL" && (
              <Link
                href="/app/discover"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                <Compass className="size-3.5" /> Explore Campuses
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
