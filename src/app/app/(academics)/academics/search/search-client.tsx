"use client";

import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Building2,
  Clock,
  FileText,
  FlaskConical,
  Globe,
  GraduationCap,
  History,
  Layers,
  LayoutGrid,
  Library,
  List,
  Loader2,
  Presentation,
  RotateCcw,
  Search,
  SearchX,
  Sparkles,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { AcademicCard } from "@/components/communities/academic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const RESOURCE_TYPES = [
  { id: "all", label: "All Types", icon: Layers },
  { id: "NOTES", label: "Lecture Notes", icon: FileText },
  { id: "PYQ", label: "PYQs & Papers", icon: GraduationCap },
  { id: "CHEAT_SHEET", label: "Cheat Sheets", icon: Zap },
  { id: "PLAYLISTS", label: "Study Playlists", icon: Library },
  { id: "BOOK", label: "Whole Book", icon: BookMarked },
  { id: "MODULE", label: "Module / Unit", icon: BookOpen },
  { id: "PPT", label: "PPT / Slides", icon: Presentation },
  { id: "LAB_MANUAL", label: "Lab Manuals", icon: FlaskConical },
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
  { id: "all", label: "All Semesters" },
  { id: "1", label: "Semester 1" },
  { id: "2", label: "Semester 2" },
  { id: "3", label: "Semester 3" },
  { id: "4", label: "Semester 4" },
  { id: "5", label: "Semester 5" },
  { id: "6", label: "Semester 6" },
  { id: "7", label: "Semester 7" },
  { id: "8", label: "Semester 8" },
] as const;

const POPULAR_CURRICULUM_CODES = [
  { code: "CS201", label: "Data Structures (DSA)" },
  { code: "CS303", label: "Operating Systems (OS)" },
  { code: "CS302", label: "DBMS & SQL" },
  { code: "CS401", label: "Computer Networks" },
  { code: "MA101", label: "Engineering Maths" },
  { code: "EC201", label: "Digital Electronics" },
  { code: "CS305", label: "Theory of Computation" },
  { code: "CS501", label: "Machine Learning" },
] as const;

const TRENDING_TOPICS = [
  "AKTU Quantum",
  "Semester PYQ",
  "Formula Cheat Sheet",
  "Lab Viva Questions",
  "Object Oriented Programming",
  "Compiler Design",
  "Engineering Mechanics",
] as const;

const RECENT_SEARCHES_STORAGE_KEY = "campusloop_academic_searches";

interface AcademicsSearchClientProps {
  profileId: string | null;
  initialQuery?: string;
  initialType?: string;
  initialBranch?: string;
  initialSemester?: string;
  initialSort?: string;
  initialScope?: "campus" | "global";
}

export function AcademicsSearchClient({
  profileId,
  initialQuery = "",
  initialType = "all",
  initialBranch = "All",
  initialSemester = "all",
  initialSort,
  initialScope = "global",
}: AcademicsSearchClientProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Search input state (immediate for typing)
  const [searchInput, setSearchInput] = useState(initialQuery);
  // Debounced search query for API calls
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Filter states
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch);
  const [selectedSemester, setSelectedSemester] = useState<string>(initialSemester);
  const [selectedScope, setSelectedScope] = useState<"campus" | "global">(initialScope);
  const [sortBy, setSortBy] = useState<"relevance" | "popular" | "downloads" | "views" | "latest">(
    (initialSort as any) || (initialQuery ? "relevance" : "latest")
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 8));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save a search to recent searches
  const saveRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        8
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Clear single recent search
  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Clear all recent searches
  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {}
  };

  // Debounce search input changes (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
      if (searchInput.trim()) {
        // If user typed a search term and sort was default latest, switch to relevance
        setSortBy((prev) => (prev === "latest" ? "relevance" : prev));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync URL query params without full page reload
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (selectedType !== "all") params.set("type", selectedType);
    if (selectedBranch !== "All") params.set("branch", selectedBranch);
    if (selectedSemester !== "all") params.set("semester", selectedSemester);
    if (selectedScope !== "global") params.set("scope", selectedScope);
    if (sortBy !== (debouncedQuery ? "relevance" : "latest")) params.set("sort", sortBy);

    const qs = params.toString();
    const newPath = qs ? `/app/academics/search?${qs}` : "/app/academics/search";
    window.history.replaceState(null, "", newPath);
  }, [debouncedQuery, selectedType, selectedBranch, selectedSemester, selectedScope, sortBy]);

  // Execute a selected search query immediately
  const handleSelectQuery = (term: string) => {
    sounds.tap();
    haptics.light();
    setSearchInput(term);
    setDebouncedQuery(term);
    saveRecentSearch(term);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  // Form submit (Enter key)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    setDebouncedQuery(trimmed);
    if (trimmed) {
      saveRecentSearch(trimmed);
    }
    setIsFocused(false);
    inputRef.current?.blur();
  };

  // Clear search input
  const handleClearInput = () => {
    sounds.tap();
    haptics.light();
    setSearchInput("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    sounds.tap();
    haptics.light();
    setSelectedType("all");
    setSelectedBranch("All");
    setSelectedSemester("all");
    setSelectedScope("global");
    setSortBy(debouncedQuery ? "relevance" : "latest");
  };

  const isPlaylistsTab = selectedType === "PLAYLISTS";

  // SWR Infinite key generator
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (isPlaylistsTab) return null;
    if (previousPageData && (!previousPageData.items?.length || !previousPageData.hasMore)) {
      return null;
    }
    const params = new URLSearchParams();
    if (selectedType !== "all") params.set("resourceType", selectedType);
    if (selectedBranch !== "All") params.set("branch", selectedBranch);
    if (selectedSemester !== "all") params.set("semester", selectedSemester);
    if (debouncedQuery) params.set("q", debouncedQuery);
    params.set("scope", selectedScope);
    params.set("sort", sortBy);
    params.set("page", String(pageIndex + 1));
    params.set("limit", "24");
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

  // Playlists API data
  const { data: playlistsData, isLoading: isPlaylistsLoading } = useSWR<{
    playlists: any[];
    pagination: { total: number };
  }>(
    isPlaylistsTab
      ? `/api/academics/playlists?branch=${selectedBranch}&semester=${selectedSemester}&q=${encodeURIComponent(
          debouncedQuery
        )}&scope=${selectedScope}`
      : null,
    fetcher
  );

  const items = useMemo(() => {
    return data ? data.flatMap((page) => page.items || []) : [];
  }, [data]);

  const totalCount = isPlaylistsTab
    ? (playlistsData?.pagination?.total ?? playlistsData?.playlists?.length ?? 0)
    : (data?.[0]?.total ?? 0);

  const isInitialLoading = isPlaylistsTab ? isPlaylistsLoading : isLoading && items.length === 0;
  const isEmpty = isPlaylistsTab
    ? !isPlaylistsLoading && (!playlistsData?.playlists || playlistsData.playlists.length === 0)
    : !isLoading && items.length === 0;
  const isReachingEnd = isPlaylistsTab || isEmpty || Boolean(data && !data[data.length - 1]?.hasMore);
  const isLoadingMore = Boolean(
    !isPlaylistsTab &&
      (isLoading || (isValidating && size > 1) || (size > 0 && data && typeof data[size - 1] === "undefined"))
  );

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!loadMoreNode || isReachingEnd || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoadingMore) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "400px" }
    );
    observer.observe(loadMoreNode);
    return () => observer.disconnect();
  }, [loadMoreNode, isReachingEnd, isLoadingMore, setSize]);

  // Re-trigger search mutate when filters change
  useEffect(() => {
    mutate();
  }, [debouncedQuery, selectedType, selectedBranch, selectedSemester, selectedScope, sortBy, mutate]);

  // Active filter count for badge
  const hasActiveFilters =
    selectedType !== "all" ||
    selectedBranch !== "All" ||
    selectedSemester !== "all" ||
    selectedScope !== "global" ||
    sortBy !== (debouncedQuery ? "relevance" : "latest");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col min-h-screen select-none pb-28 px-3 sm:px-6 lg:px-8 bg-background">
      {/* ─── Elevated Sticky Search Header ─── */}
      <header className="sticky top-0 z-40 flex flex-col gap-3 border-b border-border/30 bg-background/95 pt-3.5 pb-2.5 backdrop-blur-xl -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 shadow-xs">
        {/* Top bar: Back button, Title & Action */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/app/academics"
              onClick={() => sounds.tap()}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 px-2 py-1 -ml-1 rounded-lg hover:bg-muted/50"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Academic Vault</span>
            </Link>
            <div className="h-4 w-px bg-border/40 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Search className="size-3.5" />
              </div>
              <h1 className="text-sm sm:text-base font-black text-foreground tracking-tight truncate">
                Academic Search Vault
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center p-0.5 rounded-full border border-border/40 bg-muted/40">
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setViewMode("grid");
                }}
                className={cn(
                  "p-1.5 rounded-full transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid View"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setViewMode("list");
                }}
                className={cn(
                  "p-1.5 rounded-full transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="List View"
              >
                <List className="size-3.5" />
              </button>
            </div>

            {/* Upload Notes CTA */}
            <Link
              href="/app/academics/upload"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Upload className="size-3.5" />
              <span className="hidden sm:inline">Contribute Notes</span>
              <span className="sm:hidden">Upload</span>
            </Link>
          </div>
        </div>

        {/* ─── Search Omnibar Input ─── */}
        <div className="relative">
          <form onSubmit={handleSubmit} className="relative w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center pointer-events-none">
              {isLoading && searchInput.trim() ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Search className="size-4" />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by subject code (CS201), topic, chapter, book, or PYQ 2024..."
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 focus:border-primary/60 focus:bg-background focus:ring-4 focus:ring-primary/10 pl-10 pr-24 text-xs sm:text-sm font-medium placeholder:text-muted-foreground/60 outline-none transition-all text-foreground shadow-xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="size-6 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  title="Clear input"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-2.5 py-1 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* ─── Focus Tray: Recent Searches & Quick Chips ─── */}
          {isFocused && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsFocused(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-2xl shadow-xl p-3.5 space-y-3.5 animate-in fade-in-50 zoom-in-95 duration-150">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1">
                      <span className="flex items-center gap-1.5">
                        <History className="size-3" />
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearAllRecentSearches}
                        className="hover:text-foreground transition-colors cursor-pointer"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          onClick={() => handleSelectQuery(term)}
                          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border/40 transition-colors cursor-pointer"
                        >
                          <Clock className="size-3 text-muted-foreground group-hover:text-foreground" />
                          <span>{term}</span>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(term, e)}
                            className="size-3.5 rounded-full hover:bg-foreground/10 flex items-center justify-center text-muted-foreground hover:text-foreground ml-0.5"
                          >
                            <X className="size-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Curriculum Codes */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-muted-foreground px-1 flex items-center gap-1.5">
                    <Sparkles className="size-3 text-amber-500" />
                    Curriculum Subject Codes
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_CURRICULUM_CODES.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleSelectQuery(item.code)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold border border-primary/20 transition-all cursor-pointer"
                      >
                        <span>{item.code}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">({item.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending Search Topics */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-muted-foreground px-1 flex items-center gap-1.5">
                    <TrendingUp className="size-3 text-primary" />
                    Trending Vault Topics
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TRENDING_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleSelectQuery(topic)}
                        className="px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium border border-border/30 transition-colors cursor-pointer"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── Resource Type Sliding Tabs ─── */}
        <div className="flex border-b border-border/25 overflow-x-auto no-scrollbar pt-0.5 -mb-1">
          {RESOURCE_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setSelectedType(type.id);
                }}
                className={cn(
                  "relative pb-2.5 pt-1 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5",
                  isSelected ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-3.5", isSelected ? "text-primary" : "text-muted-foreground/70")} />
                <span>{type.label}</span>
                {isSelected && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Secondary Filter & Scope Controls Bar ─── */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-0.5 pt-1">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Campus vs All India Scope Toggle */}
            <div className="flex items-center p-0.5 rounded-full border border-border/40 bg-muted/40 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setSelectedScope("global");
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                  selectedScope === "global"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="size-3 text-sky-500" />
                <span>All India</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setSelectedScope("campus");
                }}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                  selectedScope === "campus"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="size-3 text-amber-500" />
                <span>My College</span>
              </button>
            </div>

            {/* Branch Selector */}
            <select
              value={selectedBranch}
              onChange={(e) => {
                sounds.tap();
                haptics.light();
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

            {/* Semester Selector */}
            <select
              value={selectedSemester}
              onChange={(e) => {
                sounds.tap();
                haptics.light();
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

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => {
                sounds.tap();
                haptics.light();
                setSortBy(e.target.value as any);
              }}
              className="h-7.5 rounded-full bg-primary/10 border border-primary/25 px-2.5 text-[11px] font-bold text-primary hover:bg-primary/15 outline-none cursor-pointer"
            >
              {debouncedQuery && <option value="relevance">Best Match</option>}
              <option value="popular">Most Upvoted</option>
              <option value="downloads">Most Downloaded</option>
              <option value="views">Most Viewed</option>
              <option value="latest">Latest Uploads</option>
            </select>
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/40 shrink-0 cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── Search Stats & Active Filter Chips ─── */}
      <div className="flex flex-col gap-2 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            {debouncedQuery ? (
              <span>
                Results for <strong className="text-foreground">"{debouncedQuery}"</strong>
                {totalCount > 0 && (
                  <span className="text-foreground font-bold"> ({totalCount.toLocaleString()})</span>
                )}
              </span>
            ) : (
              <span>
                Browsing <strong className="text-foreground">{totalCount.toLocaleString()}</strong> verified
                academic resources
              </span>
            )}
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[11px] text-muted-foreground">
              Sorted by{" "}
              {sortBy === "relevance"
                ? "Best Match"
                : sortBy === "popular"
                  ? "Most Upvoted"
                  : sortBy === "downloads"
                    ? "Most Downloaded"
                    : sortBy === "views"
                      ? "Most Viewed"
                      : "Latest"}
            </span>
          </div>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground">
                  {RESOURCE_TYPES.find((t) => t.id === selectedType)?.label}
                  <button
                    type="button"
                    onClick={() => setSelectedType("all")}
                    className="hover:text-primary cursor-pointer"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
              {selectedBranch !== "All" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground">
                  {selectedBranch}
                  <button
                    type="button"
                    onClick={() => setSelectedBranch("All")}
                    className="hover:text-primary cursor-pointer"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
              {selectedSemester !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground">
                  Sem {selectedSemester}
                  <button
                    type="button"
                    onClick={() => setSelectedSemester("all")}
                    className="hover:text-primary cursor-pointer"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
              {selectedScope === "campus" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                  My Campus
                  <button
                    type="button"
                    onClick={() => setSelectedScope("global")}
                    className="hover:opacity-75 cursor-pointer"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Search Results Grid / List ─── */}
      <div className="space-y-4">
        {isPlaylistsTab ? (
          /* Playlists Search Results */
          <div className="space-y-4">
            {isPlaylistsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-48 w-full rounded-3xl" />
                <Skeleton className="h-48 w-full rounded-3xl" />
                <Skeleton className="h-48 w-full rounded-3xl" />
              </div>
            ) : playlistsData?.playlists && playlistsData.playlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlistsData.playlists.map((playlist: any) => (
                  <AcademicCard
                    key={playlist.id}
                    item={playlist}
                    currentUserId={profileId || undefined}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4 px-4 rounded-3xl border border-dashed border-border/60 bg-card/40">
                <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto">
                  <Library className="size-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground">No study playlists found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {debouncedQuery
                      ? `No study playlists match "${debouncedQuery}". Try searching for course notes or create your own playlist.`
                      : "No playlists match your current filters. Create a curriculum playlist for your classmates."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Link
                    href="/app/academics/playlists/new"
                    onClick={() => sounds.tap()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-xs cursor-pointer"
                  >
                    <Library className="size-3.5" />
                    <span>Create Study Playlist</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isInitialLoading ? (
          /* Loading Skeletons */
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          )
        ) : items.length > 0 ? (
          /* Search Results */
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item) => (
                  <AcademicCard
                    key={item.id}
                    item={item}
                    currentUserId={profileId || undefined}
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
                    currentUserId={profileId || undefined}
                    variant="row"
                  />
                ))}
              </div>
            )}

            {/* Pagination / Infinite Scroll Node */}
            <div ref={setLoadMoreNode} className="flex flex-col items-center justify-center p-4 min-h-16">
              {isLoadingMore && (
                <div className="flex items-center gap-2 py-3 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Loading more verified resources...</span>
                </div>
              )}
              {isReachingEnd && (
                <div className="py-8 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/40 border border-border/40 text-[11px] font-semibold text-muted-foreground">
                    <span>Reached end of search results ({totalCount.toLocaleString()} items)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Can't find a specific chapter or PYQ?{" "}
                    <Link href="/app/academics/upload" className="text-primary font-bold hover:underline">
                      Contribute and earn Loop Points
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="py-20 text-center px-4 space-y-4 rounded-3xl border border-dashed border-border/60 bg-card/30">
            <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto">
              <SearchX className="size-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-black text-foreground">No matching study resources found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {debouncedQuery
                  ? `We couldn't find any resources matching "${debouncedQuery}" with your active filters.`
                  : "No academic materials found matching the selected filters."}
              </p>
            </div>

            {/* Smart suggestions */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/30 max-w-md mx-auto text-left space-y-2">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3 text-amber-500" />
                Search Tips & Suggestions:
              </span>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  Search using exact subject code (e.g. <strong>CS201</strong>, <strong>MA101</strong>)
                </li>
                <li>
                  Try searching with broader terms like <strong>Operating Systems</strong> or{" "}
                  <strong>PYQ</strong>
                </li>
                {selectedScope === "campus" && (
                  <li>
                    Switch from <strong>My College</strong> to <strong>All India</strong> to search across
                    1,350+ campuses
                  </li>
                )}
                {selectedSemester !== "all" && (
                  <li>
                    Set semester filter to <strong>All Semesters</strong>
                  </li>
                )}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/50 bg-background text-xs font-bold text-foreground hover:bg-muted/50 transition-colors shadow-xs cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
              <Link
                href="/app/academics/upload"
                onClick={() => sounds.tap()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-xs cursor-pointer"
              >
                <Upload className="size-3.5" />
                <span>Upload Missing Notes</span>
              </Link>
              <Link
                href="/app/academics"
                onClick={() => sounds.tap()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <BookOpen className="size-3.5" />
                <span>Explore Academic Vault</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
