"use client";

import {
  BookMarked,
  BookOpen,
  FileText,
  FlaskConical,
  FolderPlus,
  Gift,
  Globe,
  GraduationCap,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Presentation,
  RotateCcw,
  School,
  Search,
  Sparkles,
  X,
  Zap,
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
import { AnimateBookOpen, AnimatedIcon, AnimatePlus, AnimateSearch } from "@/components/ui/animated-icon";
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

const RESOURCE_TYPES = [
  { id: "all", label: "All Vault", icon: Layers },
  { id: "PYQ", label: "PYQs & Papers", icon: GraduationCap, badge: "Hot" },
  { id: "NOTES", label: "Lecture Notes", icon: FileText },
  { id: "CHEAT_SHEET", label: "Cheat Sheets", icon: Zap, badge: "Fast" },
  { id: "PLAYLISTS", label: "Study Playlists", icon: BookOpen },
  { id: "BOOK", label: "Whole Books", icon: BookMarked },
  { id: "MODULE", label: "Unit Modules", icon: BookOpen },
  { id: "PPT", label: "PPT / Slides", icon: Presentation },
  { id: "LAB_MANUAL", label: "Lab Manuals", icon: FlaskConical },
] as const;

const TRENDING_SEARCH_CHIPS = [
  {
    label: "CS201 DSA Endsem 2024",
    query: "CS201",
    icon: Zap,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15",
  },
  {
    label: "OS Topper Notes",
    query: "CS303 Operating Systems",
    icon: Sparkles,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/15",
  },
  {
    label: "AKTU Quantum Series",
    query: "AKTU Quantum",
    icon: BookMarked,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/15",
  },
  {
    label: "Engineering Maths MA101",
    query: "MA101",
    icon: Sparkles,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/15",
  },
  {
    label: "EC201 Digital Logic",
    query: "EC201",
    icon: Zap,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15",
  },
  {
    label: "PPS Programming Viva",
    query: "PPS",
    icon: Sparkles,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15",
  },
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

export function AcademicsClient({ profileId }: AcademicsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");

  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<"campus" | "global">("campus");
  const [sortBy, setSortBy] = useState<"for_you" | "latest" | "popular" | "downloads" | "views">("for_you");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.tap();
    haptics.light();
    if (searchQuery.trim()) {
      router.push(`/app/academics/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/app/academics/search");
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("campusloop_academics_view_mode") as "grid" | "list" | null;
      if (saved === "grid" || saved === "list") {
        setViewMode(saved);
      }
    }
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<"SAVE" | "VOTE" | "COMMENT" | "UPLOAD" | "AI">(
    "UPLOAD"
  );
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);
  const [guestRemaining, setGuestRemaining] = useState<number>(GUEST_DOWNLOAD_LIMIT);

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
        selectedType !== "all" ? selectedType : undefined
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedBranch, selectedSemester, selectedType]);

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
    params.set("scope", scope);
    params.set("sort", sortBy);
    params.set("page", String(pageIndex + 1));
    params.set("limit", "15");
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
      ? `/api/academics/playlists?branch=${selectedBranch}&semester=${selectedSemester}&q=${encodeURIComponent(searchQuery)}&scope=${scope}`
      : null,
    fetcher
  );

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

  // Infinite scroll observer
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

  // Scroll to highlight element if present in query param
  useEffect(() => {
    if (highlightId && items.length > 0) {
      const el = document.getElementById(`academic-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightId, items]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col min-h-screen select-none pb-28 px-3 sm:px-6 lg:px-8 bg-background">
      {/* ─── Elevated Header with Glowing Command Center ─── */}
      <header className="sticky top-0 z-40 flex flex-col gap-3 border-b border-border/30 bg-background/95 pt-3.5 pb-2.5 backdrop-blur-xl -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 shadow-xs">
        {/* Top bar: Brand, Live Count, View Toggle & Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-primary shadow-xs shrink-0">
              <AnimatedIcon icon={AnimateBookOpen} animation="pop" size={17} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                  Academic Vault
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>1,350+ Hubs</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium truncate hidden sm:block">
                {totalCount > 0
                  ? `${totalCount.toLocaleString()} verified notes, PYQs & formula sheets`
                  : "Verified notes, PYQs & formula sheets"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher (Grid / List) */}
            <div className="hidden sm:flex items-center rounded-full bg-muted/40 p-0.5 border border-border/40 text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setViewMode("grid");
                  if (typeof window !== "undefined") {
                    localStorage.setItem("campusloop_academics_view_mode", "grid");
                  }
                }}
                className={cn(
                  "p-1.5 rounded-full transition-all cursor-pointer",
                  viewMode === "grid" ? "bg-background text-foreground shadow-xs" : "hover:text-foreground"
                )}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  setViewMode("list");
                  if (typeof window !== "undefined") {
                    localStorage.setItem("campusloop_academics_view_mode", "list");
                  }
                }}
                className={cn(
                  "p-1.5 rounded-full transition-all cursor-pointer",
                  viewMode === "list" ? "bg-background text-foreground shadow-xs" : "hover:text-foreground"
                )}
                title="List view"
                aria-label="List view"
              >
                <List className="size-3.5" />
              </button>
            </div>

            <Link
              href="/app/academics/search"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/40 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Search Vault"
            >
              <Search className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Search</span>
            </Link>

            <Link
              href="/app/academics/playlists/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Create new Study Playlist"
            >
              <FolderPlus className="size-3.5" />
              <span className="hidden sm:inline">New Stack</span>
            </Link>

            <Link
              href="/app/academics/upload"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-primary to-indigo-600 text-primary-foreground text-xs font-black hover:opacity-95 active:scale-95 transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              <AnimatedIcon icon={AnimatePlus} animation="pop" size={13} />
              <span>Upload Notes</span>
            </Link>
          </div>
        </div>

        {/* ─── Raycast-Style Floating Omnibar ─── */}
        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <AnimatedIcon
              icon={AnimateSearch}
              animation="pop"
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject code (CS201), topic, AKTU quantum, or PYQ 2024..."
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border/50 focus:border-primary/60 focus:bg-background focus:ring-4 focus:ring-primary/10 pl-10.5 pr-24 text-xs sm:text-sm font-medium placeholder:text-muted-foreground/60 outline-none transition-all text-foreground shadow-xs"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="size-6 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  title="Clear"
                >
                  <X className="size-3" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* ─── Trending Quick-Tap Carousel Directly Below Search ─── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground/80 shrink-0 flex items-center gap-1 mr-0.5">
            <Sparkles className="size-3 text-amber-500" />
            <span>Trending:</span>
          </span>
          {TRENDING_SEARCH_CHIPS.map((chip) => {
            const ChipIcon = chip.icon;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setSearchQuery(chip.query);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:scale-102 active:scale-95 cursor-pointer shrink-0 shadow-2xs",
                  chip.color
                )}
              >
                <ChipIcon className="size-3 shrink-0" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Tactile Segmented Tabs for Resource Types ─── */}
        <div className="flex border-b border-border/25 overflow-x-auto no-scrollbar pt-1 pb-1 gap-1">
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
                  "relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5",
                  isSelected
                    ? "bg-primary text-primary-foreground font-black shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Icon
                  className={cn("size-3.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")}
                />
                <span>{type.label}</span>
                {"badge" in type && (
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase px-1 py-0.2 rounded-full",
                      isSelected ? "bg-white/20 text-white" : "bg-primary/15 text-primary"
                    )}
                  >
                    {type.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Secondary Filter Ribbon (Scope, Branch, Semester, Sort) ─── */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pb-0.5 pt-0.5">
          {/* Scope Selector */}
          <div className="flex items-center rounded-full bg-muted/50 p-0.5 border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setScope("campus");
              }}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5",
                scope === "campus"
                  ? "bg-background text-foreground shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <School className="size-3 text-amber-500 shrink-0" />
              <span>My Campus</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setScope("global");
              }}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5",
                scope === "global"
                  ? "bg-background text-foreground shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="size-3 text-sky-500 shrink-0" />
              <span>All Colleges</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* Branch Dropdown */}
            <select
              value={selectedBranch}
              onChange={(e) => {
                sounds.tap();
                setSelectedBranch(e.target.value);
              }}
              className="h-8 rounded-full bg-muted/40 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b === "All" ? "All Branches" : b}
                </option>
              ))}
            </select>

            {/* Semester Dropdown */}
            <select
              value={selectedSemester}
              onChange={(e) => {
                sounds.tap();
                setSelectedSemester(e.target.value);
              }}
              className="h-8 rounded-full bg-muted/40 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            >
              {SEMESTERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === "all" ? "All Sems" : s.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                sounds.tap();
                setSortBy(e.target.value as any);
              }}
              className="h-8 rounded-full bg-primary/10 border border-primary/25 px-2.5 text-[11px] font-bold text-primary hover:bg-primary/15 outline-none cursor-pointer"
            >
              <option value="for_you">For You (Recommended)</option>
              <option value="latest">Latest</option>
              <option value="popular">Most Upvoted</option>
              <option value="downloads">Most Downloaded</option>
              <option value="views">Most Viewed</option>
            </select>

            {/* Reset Filters button if non-default */}
            {(selectedBranch !== "All" ||
              selectedSemester !== "all" ||
              sortBy !== "for_you" ||
              scope !== "campus" ||
              searchQuery) && (
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
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Scrollable Page Body (Full Space & Organized) ─── */}
      <div className="space-y-4 pt-4">
        {/* Guest conversion banner if not logged in */}
        {!profileId && <AcademicAuthBenefitsCard returnTo="/app/academics" dismissible={true} />}

        {/* ─── Connected Sources & Archives Directory Ribbon ─── */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/app/academics/sources"
            className="flex-1 flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-card hover:from-indigo-500/15 hover:via-purple-500/10 border border-indigo-500/25 hover:border-indigo-500/40 text-foreground transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-foreground">
                    Connected University Repositories
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Official Hubs
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">
                  BIT Mesra Exam Vault • AKTU Quantum Series • VTU Belagavi Archives
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
              <span className="hidden sm:inline">10 Verified Sources</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {!profileId && (
            <div
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold shrink-0"
              title="Guests enjoy 5 free downloads before sign-in is requested"
            >
              <Gift className="size-3.5 text-amber-500" />
              <span>{guestRemaining}/5 Free</span>
            </div>
          )}
        </div>

        {/* ─── Academic Resources Feed or Playlists Grid ─── */}
        <section className="space-y-4">
          {isPlaylistsTab ? (
            <div className="space-y-4">
              {/* Playlists Header Banner */}
              <div className="rounded-3xl border border-indigo-500/30 bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-400">
                    <Sparkles className="size-3.5" />
                    <span>Curated Study Playlists &amp; Bundles</span>
                  </div>
                  <h2 className="text-base font-black text-foreground">
                    Semester Survival Kits &amp; Exam Stacks
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    Complete handwritten notes, 5-year PYQs, and cheat sheets assembled into 1-click playlists
                    for your batch.
                  </p>
                </div>

                <Link
                  href="/app/academics/playlists/new"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Create Playlist</span>
                </Link>
              </div>

              {/* Playlists 3-Column Grid */}
              {isPlaylistsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-44 w-full rounded-3xl" />
                  <Skeleton className="h-44 w-full rounded-3xl" />
                  <Skeleton className="h-44 w-full rounded-3xl" />
                </div>
              ) : playlistsData?.playlists && playlistsData.playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlistsData.playlists.map((playlist: any) => (
                    <AcademicPlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3 px-4 rounded-3xl border border-dashed border-border/60 bg-card/40">
                  <FolderPlus className="size-10 text-muted-foreground/40 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">No study playlists found</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Be the first in your branch or semester to create a study playlist and earn +50 Loop
                      Points!
                    </p>
                  </div>
                  <Link
                    href="/app/academics/playlists/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Create First Playlist</span>
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
                      currentUserId={profileId || undefined}
                      isHighlighted={highlightId === item.id}
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
                      isHighlighted={highlightId === item.id}
                      variant="row"
                    />
                  ))}
                </div>
              )}

              {/* Sentinel element for infinite scroll */}
              <div ref={setLoadMoreNode} className="flex flex-col items-center justify-center p-4 min-h-16">
                {isLoadingMore && (
                  <div className="flex items-center gap-2 py-3 text-xs font-semibold text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading more vault resources...</span>
                  </div>
                )}
                {isReachingEnd && (
                  <div className="py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/40 border border-border/40 text-[11px] font-semibold text-muted-foreground">
                      <Sparkles className="size-3 text-primary" />
                      <span>Reached end of vault ({totalCount.toLocaleString()} resources)</span>
                      <Link
                        href="/app/academics/upload"
                        onClick={() => sounds.tap()}
                        className="text-primary hover:underline font-bold cursor-pointer"
                      >
                        + Add your notes
                      </Link>
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
                  Be the first to upload lecture notes, whole books, PPTs, or PYQs for this branch and earn 20
                  LP!
                </p>
              </div>
              <Link
                href="/app/academics/upload"
                onClick={() => sounds.tap()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Upload First Notes</span>
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Guest conversion modal */}
      <AcademicAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionReason={authModalReason}
        returnTo="/app/academics"
      />
    </main>
  );
}
