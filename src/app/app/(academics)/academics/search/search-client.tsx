"use client";

import { ArrowLeft, BookOpen, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { AcademicCard } from "@/components/communities/academic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const RESOURCE_TYPES = [
  { id: "all", label: "All Types" },
  { id: "PLAYLISTS", label: "Study Playlists" },
  { id: "NOTES", label: "Lecture Notes" },
  { id: "MODULE", label: "Module / Unit" },
  { id: "BOOK", label: "Whole Book" },
  { id: "PPT", label: "PPT / Slides" },
  { id: "PYQ", label: "PYQs & Papers" },
  { id: "CHEAT_SHEET", label: "Cheat Sheets" },
  { id: "LAB_MANUAL", label: "Lab Manuals" },
] as const;

const BRANCHES = [
  "All",
  "Computer Science",
  "ECE",
  "Information Technology",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "BioTech",
  "Architecture",
  "Management",
  "Pharmacy",
  "Design",
  "Basic Sciences",
] as const;

const SEMESTERS = [
  { id: "all", label: "All Sems" },
  { id: "1", label: "Sem 1" },
  { id: "2", label: "Sem 2" },
  { id: "3", label: "Sem 3" },
  { id: "4", label: "Sem 4" },
  { id: "5", label: "Sem 5" },
  { id: "6", label: "Sem 6" },
  { id: "7", label: "Sem 7" },
  { id: "8", label: "Sem 8" },
] as const;

interface AcademicsSearchClientProps {
  initialQuery?: string;
}

export function AcademicsSearchClient({ initialQuery }: AcademicsSearchClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "downloads" | "views">("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);

  const isPlaylistsTab = selectedType === "PLAYLISTS";

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (isPlaylistsTab) return null;
    if (previousPageData && (!previousPageData.items?.length || !previousPageData.hasMore)) {
      return null;
    }
    const params = new URLSearchParams();
    if (selectedType !== "all") params.set("resourceType", selectedType);
    if (selectedBranch !== "All") params.set("branch", selectedBranch);
    if (selectedSemester !== "all") params.set("semester", selectedSemester);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    params.set("scope", "global");
    params.set("sort", sortBy);
    params.set("page", String(pageIndex + 1));
    params.set("limit", "20");
    return `/api/academics?${params.toString()}`;
  };

  const { data, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    totalPages: number;
  }>(getKey, fetcher, {
    revalidateFirstPage: false,
    dedupingInterval: 4000,
  });

  const { data: playlistsData, isLoading: isPlaylistsLoading } = useSWR<{
    playlists: any[];
    pagination: { total: number };
  }>(
    isPlaylistsTab
      ? `/api/academics/playlists?branch=${selectedBranch}&semester=${selectedSemester}&q=${encodeURIComponent(searchQuery)}&scope=global`
      : null,
    fetcher
  );

  const items = data ? data.flatMap((page) => page.items || []) : [];
  const totalCount = data?.[0]?.total ?? 0;
  const isInitialLoading = isLoading && items.length === 0;
  const isEmpty = !isLoading && items.length === 0;
  const isReachingEnd = isEmpty || Boolean(data && !data[data.length - 1]?.hasMore);
  const isLoadingMore = Boolean(
    isLoading || (isValidating && size > 1) || (size > 0 && data && typeof data[size - 1] === "undefined")
  );

  useEffect(() => {
    if (!loadMoreNode || isReachingEnd || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoadingMore) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );
    observer.observe(loadMoreNode);
    return () => observer.disconnect();
  }, [loadMoreNode, isReachingEnd, isLoadingMore, setSize]);

  useEffect(() => {
    mutate();
  }, [searchQuery, selectedType, selectedBranch, selectedSemester, sortBy, mutate]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col min-h-screen select-none pb-28 px-3 sm:px-6 lg:px-8 bg-background">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 flex flex-col gap-2.5 border-b border-border/30 bg-background/90 pt-3 pb-2 backdrop-blur-xl -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/app/academics"
              onClick={() => sounds.tap()}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Academic Vault</span>
            </Link>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <span>Search Notes & PYQs</span>
            </h1>
            <span className="text-xs text-muted-foreground font-medium truncate hidden sm:inline">
              {totalCount > 0 ? `· ${totalCount.toLocaleString()} results` : "· Search the vault"}
            </span>
          </div>
        </div>

        {/* Omnibar Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject (CS201), topic, module, book, or PYQ..."
            className="w-full h-10 rounded-full bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background pl-10 pr-9 text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all text-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-4.5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Tabs for Resource Types */}
        <div className="flex border-b border-border/25 overflow-x-auto no-scrollbar pt-0.5">
          {RESOURCE_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  sounds.tap();
                  setSelectedType(type.id);
                }}
                className={cn(
                  "relative pb-2.5 pt-1 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0",
                  isSelected
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{type.label}</span>
                {isSelected && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedBranch}
              onChange={(e) => {
                sounds.tap();
                setSelectedBranch(e.target.value);
              }}
              className="h-7.5 rounded-full bg-muted/40 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b === "All" ? "All Branches" : b}
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => {
                sounds.tap();
                setSelectedSemester(e.target.value);
              }}
              className="h-7.5 rounded-full bg-muted/40 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            >
              {SEMESTERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === "all" ? "All Sems" : s.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                sounds.tap();
                setSortBy(e.target.value as any);
              }}
              className="h-7.5 rounded-full bg-primary/10 border border-primary/25 px-2.5 text-[11px] font-bold text-primary hover:bg-primary/15 outline-none cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Upvoted</option>
              <option value="downloads">Most Downloaded</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </header>

      {/* ─── Results ─── */}
      <div className="space-y-4 pt-4">
        {isPlaylistsTab ? (
          <div className="space-y-4">
            {isPlaylistsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-44 w-full rounded-3xl" />
                <Skeleton className="h-44 w-full rounded-3xl" />
                <Skeleton className="h-44 w-full rounded-3xl" />
              </div>
            ) : playlistsData?.playlists && playlistsData.playlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlistsData.playlists.map((playlist: any) => (
                  <AcademicCard
                    key={playlist.id}
                    item={playlist}
                    currentUserId={undefined}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 px-4 rounded-3xl border border-dashed border-border/60 bg-card/40">
                <BookOpen className="size-10 text-muted-foreground/40 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">No study playlists found</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Try adjusting your search or filters, or browse the full academic vault.
                  </p>
                </div>
                <Link
                  href="/app/academics"
                  onClick={() => sounds.tap()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
                >
                  Browse Academic Vault
                </Link>
              </div>
            )}
          </div>
        ) : isInitialLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          )
        ) : items.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item) => (
                  <AcademicCard
                    key={item.id}
                    item={item}
                    currentUserId={undefined}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border/20 rounded-3xl border border-border/30 bg-card/25 overflow-hidden">
                {items.map((item) => (
                  <AcademicCard
                    key={item.id}
                    item={item}
                    currentUserId={undefined}
                    variant="row"
                  />
                ))}
              </div>
            )}

            <div ref={setLoadMoreNode} className="flex flex-col items-center justify-center p-4 min-h-16">
              {isLoadingMore && (
                <div className="flex items-center gap-2 py-3 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Loading more results...</span>
                </div>
              )}
              {isReachingEnd && (
                <div className="py-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/40 border border-border/40 text-[11px] font-semibold text-muted-foreground">
                    <span>Reached end of results ({totalCount.toLocaleString()})</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-24 text-center px-4 space-y-3">
            <BookOpen className="size-10 text-muted-foreground/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No study resources found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Try adjusting your search terms or filters, or browse the full academic vault.
              </p>
            </div>
            <Link
              href="/app/academics"
              onClick={() => sounds.tap()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
            >
              Browse Academic Vault
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
