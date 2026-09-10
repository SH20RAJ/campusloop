"use client";

import {
  Bookmark,
  BookOpen,
  FolderPlus,
  Globe,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  RotateCcw,
  School,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { AcademicAuthBenefitsCard } from "@/components/academics/academic-auth-benefits-card";
import { AcademicAuthModal } from "@/components/academics/academic-auth-modal";
import { AcademicPlaylistCard } from "@/components/academics/academic-playlist-card";
import { AcademicCard } from "@/components/communities/academic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { GUEST_DOWNLOAD_LIMIT, getGuestDownloadCount } from "@/lib/academic-download-limiter";
import { trackAcademicSearch } from "@/lib/analytics/ga4";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AcademicsClientProps {
  profileId: string | null;
}

// Twitter-Style Core Navigation Tabs
const PRIMARY_TABS = [
  { id: "for_you", label: "For You" },
  { id: "PYQ", label: "PYQs" },
  { id: "NOTES", label: "Notes" },
  { id: "PLAYLISTS", label: "Playlists" },
  { id: "SAVED", label: "Saved" },
] as const;

const BRANCHES = [
  "All",
  "Computer Science",
  "Information Technology",
  "ECE",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "BioTech",
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

export function AcademicsClient({ profileId }: AcademicsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("for_you");
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scope, setScope] = useState<"campus" | "global">("campus");
  const [sortBy, setSortBy] = useState<"for_you" | "latest" | "popular" | "downloads" | "views">("for_you");
  const [viewMode, setViewMode] = useState<"row" | "grid">("row");

  // Saved Sub-tab: "notes" | "playlists"
  const [savedSubTab, setSavedSubTab] = useState<"notes" | "playlists">("notes");
  const [savedSemesterFilter, setSavedSemesterFilter] = useState<number | "all">("all");

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<"SAVE" | "VOTE" | "COMMENT" | "UPLOAD" | "AI">(
    "UPLOAD"
  );
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);
  const [guestRemaining, setGuestRemaining] = useState<number>(GUEST_DOWNLOAD_LIMIT);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
      setIsSearchOpen(true);
    }
    const tab = searchParams.get("tab");
    if (tab && PRIMARY_TABS.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("campusloop_academics_view_mode") as "grid" | "row" | null;
      if (saved === "grid" || saved === "row") {
        setViewMode(saved);
      }
    }
  }, []);

  useEffect(() => {
    if (!profileId) {
      const used = getGuestDownloadCount();
      setGuestRemaining(Math.max(0, GUEST_DOWNLOAD_LIMIT - used));
    }
  }, [profileId]);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      trackAcademicSearch(
        searchQuery.trim(),
        selectedBranch !== "All" ? selectedBranch : undefined,
        selectedSemester !== "all" ? selectedSemester : undefined,
        activeTab !== "for_you" && activeTab !== "SAVED" ? activeTab : undefined
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedBranch, selectedSemester, activeTab]);

  // ─── Data Queries ─────────────────────────────────────────────────────────

  const isFeedTab = activeTab !== "PLAYLISTS" && activeTab !== "SAVED";

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!isFeedTab) return null;
    if (previousPageData && (!previousPageData.items?.length || !previousPageData.hasMore)) {
      return null;
    }
    const params = new URLSearchParams();
    if (activeTab !== "for_you") params.set("resourceType", activeTab);
    if (selectedBranch !== "All") params.set("branch", selectedBranch);
    if (selectedSemester !== "all") params.set("semester", selectedSemester);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    params.set("scope", scope);
    params.set("sort", sortBy);
    params.set("page", String(pageIndex + 1));
    params.set("limit", "15");
    return `/api/academics?${params.toString()}`;
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite<{
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

  // Playlists query
  const { data: playlistsData, isLoading: isPlaylistsLoading } = useSWR<{
    playlists: any[];
    pagination: { total: number };
  }>(
    activeTab === "PLAYLISTS" || (activeTab === "SAVED" && savedSubTab === "playlists")
      ? `/api/academics/playlists?branch=${selectedBranch}&semester=${selectedSemester}&q=${encodeURIComponent(searchQuery)}&scope=${scope}`
      : null,
    fetcher
  );

  // Saved resources query
  const {
    data: savedData,
    isLoading: isSavedLoading,
    mutate: mutateSaved,
  } = useSWR<{
    items: any[];
    total: number;
    bySemester: Record<number, any[]>;
    availableSemesters: number[];
  }>(profileId && activeTab === "SAVED" ? "/api/academics/saved" : null, fetcher);

  const items = useMemo(() => {
    return data ? data.flatMap((page) => page.items || []) : [];
  }, [data]);

  const totalCount = data?.[0]?.total ?? 0;
  const isInitialLoading = isLoading && items.length === 0;
  const isEmpty = !isLoading && items.length === 0;
  const isReachingEnd = isEmpty || Boolean(data && !data[data.length - 1]?.hasMore);
  const isLoadingMore = Boolean(
    isLoading || (isValidating && size > 1) || (size > 0 && data && typeof data[size - 1] === "undefined")
  );

  // Filter saved items by semester
  const filteredSavedItems = useMemo(() => {
    const raw = savedData?.items || [];
    if (savedSemesterFilter === "all") return raw;
    return raw.filter((item) => (item.savedSemester || item.semester) === savedSemesterFilter);
  }, [savedData, savedSemesterFilter]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreNode || isReachingEnd || isLoadingMore || !isFeedTab) return;

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
  }, [loadMoreNode, isReachingEnd, isLoadingMore, setSize, isFeedTab]);

  // Scroll to highlight element if present in query param
  useEffect(() => {
    if (highlightId && items.length > 0) {
      const el = document.getElementById(`academic-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightId, items]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.tap();
    haptics.light();
    if (searchQuery.trim()) {
      router.push(`/app/academics/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const hasActiveFilters =
    selectedBranch !== "All" || selectedSemester !== "all" || sortBy !== "for_you" || scope !== "campus";

  return (
    <div className="min-h-screen max-w-2xl mx-auto border-x border-border/40 bg-background pb-28 select-none">
      {/* ─── Sticky Twitter/X Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/40">
        {/* Top bar: Title & Quick Actions */}
        <div className="flex h-13 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-tight text-foreground sm:text-lg">Academics</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80">
              · 1,350+ Campus Hubs
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Search Toggle Icon Button */}
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setIsSearchOpen((prev) => !prev);
              }}
              className={cn(
                "flex size-8.5 items-center justify-center rounded-full transition-colors cursor-pointer",
                isSearchOpen
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title="Toggle search"
            >
              <Search className="size-4" />
            </button>

            {/* Saved Materials Quick Icon Button */}
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setActiveTab("SAVED");
              }}
              className={cn(
                "flex size-8.5 items-center justify-center rounded-full transition-colors cursor-pointer",
                activeTab === "SAVED"
                  ? "bg-amber-500/15 text-amber-500"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title="Saved study materials"
            >
              <Bookmark className="size-4" />
            </button>

            {/* Create Playlist Icon */}
            <Link
              href="/app/academics/playlists/new"
              onClick={() => sounds.tap()}
              className="hidden sm:flex size-8.5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Create Study Playlist"
            >
              <FolderPlus className="size-4" />
            </Link>

            {/* Upload Notes Button */}
            <Link
              href="/app/academics/upload"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex items-center gap-1 h-8 rounded-full bg-primary px-3 text-xs font-black text-primary-foreground shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer ml-1"
            >
              <Plus className="size-3.5" />
              <span>Upload</span>
            </Link>
          </div>
        </div>

        {/* ─── Twitter Tabs (Underlined) ────────────────────────────────────── */}
        <div className="flex border-b border-border/30">
          {PRIMARY_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
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
                  "relative flex-1 py-3 text-center text-xs sm:text-sm font-bold transition-colors cursor-pointer",
                  isSelected
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <span>{tab.label}</span>
                {isSelected && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-1 rounded-full bg-primary transition-all" />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Compact Filter Ribbon ────────────────────────────────────────── */}
        <div className="px-4 py-2 flex flex-col gap-2 bg-background/50 border-b border-border/20">
          {/* Inline Search Bar (Expanded or has text) */}
          {(isSearchOpen || searchQuery) && (
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject code (CS201), topic or exam paper..."
                className="w-full h-8.5 rounded-full bg-muted/40 border border-border/40 pl-8 pr-16 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-all"
                autoFocus={isSearchOpen}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4.5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </form>
          )}

          {/* Filter Chips Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {/* Campus / Global Scope Toggle */}
            <div className="flex items-center rounded-full bg-muted/40 p-0.5 border border-border/40 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setScope("campus");
                }}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1",
                  scope === "campus"
                    ? "bg-background text-foreground shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <School className="size-3 text-amber-500" />
                <span>My Campus</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setScope("global");
                }}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1",
                  scope === "global"
                    ? "bg-background text-foreground shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="size-3 text-sky-500" />
                <span>All India</span>
              </button>
            </div>

            {/* Branch Select */}
            <select
              value={selectedBranch}
              onChange={(e) => {
                sounds.tap();
                setSelectedBranch(e.target.value);
              }}
              className="h-7 rounded-full bg-muted/30 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer shrink-0"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b === "All" ? "All Branches" : b}
                </option>
              ))}
            </select>

            {/* Semester Select */}
            <select
              value={selectedSemester}
              onChange={(e) => {
                sounds.tap();
                setSelectedSemester(e.target.value);
              }}
              className="h-7 rounded-full bg-muted/30 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer shrink-0"
            >
              {SEMESTERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => {
                sounds.tap();
                setSortBy(e.target.value as any);
              }}
              className="h-7 rounded-full bg-primary/10 border border-primary/20 px-2 text-[11px] font-bold text-primary outline-none cursor-pointer shrink-0"
            >
              <option value="for_you">Recommended</option>
              <option value="latest">Latest</option>
              <option value="popular">Most Upvoted</option>
              <option value="downloads">Most Downloaded</option>
            </select>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setSelectedBranch("All");
                  setSelectedSemester("all");
                  setSortBy("for_you");
                  setScope("campus");
                  setSearchQuery("");
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                title="Reset filters"
              >
                <RotateCcw className="size-2.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Desktop View Mode Switcher */}
            <div className="hidden sm:flex items-center rounded-full bg-muted/40 p-0.5 border border-border/40 ml-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setViewMode("row");
                  localStorage.setItem("campusloop_academics_view_mode", "row");
                }}
                className={cn(
                  "p-1 rounded-full transition-all cursor-pointer",
                  viewMode === "row"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Twitter list view"
              >
                <List className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setViewMode("grid");
                  localStorage.setItem("campusloop_academics_view_mode", "grid");
                }}
                className={cn(
                  "p-1 rounded-full transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid view"
              >
                <LayoutGrid className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Tab Content Views ──────────────────────────────────────────────── */}
      <div className="divide-y divide-border/20">
        {/* Guest conversion banner if not signed in */}
        {!profileId && <AcademicAuthBenefitsCard returnTo="/app/academics" dismissible={true} />}

        {/* ── 1. SAVED MATERIALS & PLAYLISTS TAB ───────────────────────────── */}
        {activeTab === "SAVED" ? (
          <div className="space-y-4 p-4">
            {/* Saved Mode Switcher: Notes vs Playlists */}
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div className="flex rounded-full bg-muted/40 p-0.5 border border-border/40">
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    setSavedSubTab("notes");
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                    savedSubTab === "notes"
                      ? "bg-background text-foreground shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Saved Notes ({savedData?.items?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    setSavedSubTab("playlists");
                  }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                    savedSubTab === "playlists"
                      ? "bg-background text-foreground shadow-xs font-black"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Playlists ({playlistsData?.playlists?.length || 0})
                </button>
              </div>

              {/* Semester Filter for Saved Notes */}
              {savedSubTab === "notes" && (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { id: "all" as const, label: "All Sems" },
                    { id: 1, label: "Sem 1" },
                    { id: 2, label: "Sem 2" },
                    { id: 3, label: "Sem 3" },
                    { id: 4, label: "Sem 4" },
                    { id: 5, label: "Sem 5" },
                    { id: 6, label: "Sem 6" },
                  ].map((s) => (
                    <button
                      key={String(s.id)}
                      type="button"
                      onClick={() => setSavedSemesterFilter(s.id)}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer shrink-0",
                        savedSemesterFilter === s.id
                          ? "bg-primary text-primary-foreground font-black"
                          : "text-muted-foreground hover:text-foreground bg-muted/30"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Content Body */}
            {savedSubTab === "notes" ? (
              isSavedLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : filteredSavedItems.length > 0 ? (
                <div className="divide-y divide-border/20 rounded-2xl border border-border/30 bg-card/25 overflow-hidden">
                  {filteredSavedItems.map((item) => (
                    <AcademicCard
                      key={item.id}
                      item={item}
                      currentUserId={profileId || undefined}
                      variant="row"
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3 px-4 rounded-2xl border border-dashed border-border/60">
                  <Bookmark className="size-10 text-muted-foreground/30 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      {savedSemesterFilter !== "all"
                        ? `No saved materials for Semester ${savedSemesterFilter}`
                        : "Your academic locker is empty"}
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Tap the bookmark icon on any exam paper or note to quickly save it to your locker.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("for_you")}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>Browse Academic Vault</span>
                  </button>
                </div>
              )
            ) : isPlaylistsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : playlistsData?.playlists && playlistsData.playlists.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {playlistsData.playlists.map((playlist: any) => (
                  <AcademicPlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 px-4 rounded-2xl border border-dashed border-border/60">
                <FolderPlus className="size-10 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">No study playlists created yet</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Assemble notes, 5-year PYQs, and cheat sheets into a shareable bundle for your batch.
                  </p>
                </div>
                <Link
                  href="/app/academics/playlists/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Create Study Stack</span>
                </Link>
              </div>
            )}
          </div>
        ) : activeTab === "PLAYLISTS" ? (
          /* ── 2. PLAYLISTS TAB ─────────────────────────────────────────── */
          <div className="space-y-4 p-4">
            {/* Header Action */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-foreground">Semester Stacks &amp; Exam Bundles</h2>
                <p className="text-xs text-muted-foreground">
                  1-click study playlists curated by verified students
                </p>
              </div>
              <Link
                href="/app/academics/playlists/new"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Plus className="size-3" />
                <span>New Stack</span>
              </Link>
            </div>

            {isPlaylistsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : playlistsData?.playlists && playlistsData.playlists.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {playlistsData.playlists.map((playlist: any) => (
                  <AcademicPlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 px-4 rounded-2xl border border-dashed border-border/60">
                <FolderPlus className="size-10 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">No playlists found for this filter</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Be the first in your branch or semester to assemble an exam stack and earn +50 LP!
                  </p>
                </div>
                <Link
                  href="/app/academics/playlists/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Create First Playlist</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* ── 3. CORE FEED: FOR YOU, PYQs, NOTES ────────────────────────── */
          <div>
            {isInitialLoading ? (
              <div className="divide-y divide-border/20">
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                  <Skeleton className="h-5 w-4/5 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                  <Skeleton className="h-5 w-4/5 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-1/3 rounded-md" />
                  <Skeleton className="h-5 w-4/5 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
              </div>
            ) : items.length > 0 ? (
              <>
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                      : "divide-y divide-border/20"
                  )}
                >
                  {items.map((item) => (
                    <AcademicCard
                      key={item.id}
                      item={item}
                      currentUserId={profileId || undefined}
                      isHighlighted={highlightId === item.id}
                      variant={viewMode}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Sentinel */}
                <div ref={setLoadMoreNode} className="flex flex-col items-center justify-center p-4 min-h-16">
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 py-3 text-xs font-semibold text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span>Loading more materials...</span>
                    </div>
                  )}
                  {isReachingEnd && (
                    <div className="py-6 text-center">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/40 border border-border/40 text-[11px] font-semibold text-muted-foreground">
                        <Sparkles className="size-3 text-primary" />
                        <span>Reached end of vault ({totalCount.toLocaleString()} resources)</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-24 text-center px-4 space-y-3">
                <BookOpen className="size-10 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">No study resources found</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Try changing your branch or semester filter, or be the first to upload lecture notes or
                    PYQs!
                  </p>
                </div>
                <Link
                  href="/app/academics/upload"
                  onClick={() => sounds.tap()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Upload First Notes (+20 LP)</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guest Authentication Modal */}
      <AcademicAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionReason={authModalReason}
        returnTo="/app/academics"
      />
    </div>
  );
}
