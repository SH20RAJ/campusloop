"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  School,
  Search,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddCollegeModal } from "@/components/colleges/add-college-modal";
import {
  AllIndiaCollegePodium,
  type LeaderboardCollegeItem,
} from "@/components/colleges/all-india-college-podium";
import { CollegeHubRow, type CollegeItem } from "@/components/colleges/college-hub-row";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";

const CATEGORY_FILTERS = [
  { id: "ALL", label: "All", icon: School },
  { id: "TRENDING", label: "Trending", icon: Flame },
  { id: "IIT_NIT", label: "IITs & NITs", icon: Trophy },
  { id: "NIRF", label: "NIRF Top 100", icon: Zap },
  { id: "CENTRAL", label: "Central & Deemed", icon: Building2 },
];

const POPULAR_STATES = [
  "ALL",
  "Jharkhand",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Punjab",
  "Kerala",
];

export default function CollegesClient() {
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const initialTab = searchParams.get("tab") === "leaderboard" ? "leaderboard" : "directory";
  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "ALL";
  const initialState = searchParams.get("state") || "ALL";
  const initialPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  const [activeTab, setActiveTab] = useState<"directory" | "leaderboard">(initialTab);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedState, setSelectedState] = useState(initialState);
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Leaderboard state (fetched unconditionally for instant podium display)
  const [leaderboard, setLeaderboard] = useState<LeaderboardCollegeItem[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeState, setNewCollegeState] = useState("");
  const [newCollegeDistrict, setNewCollegeDistrict] = useState("");
  const [newCollegeWebsite, setNewCollegeWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Synchronize state with URL parameters
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (activeTab !== "directory") params.set("tab", activeTab);
    if (search.trim()) params.set("q", search.trim());
    if (selectedCategory !== "ALL") params.set("category", selectedCategory);
    if (selectedState !== "ALL") params.set("state", selectedState);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    const newUrl = query ? `/app/colleges?${query}` : "/app/colleges";

    if (typeof window !== "undefined" && window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [activeTab, search, selectedCategory, selectedState, page]);

  // Fetch Directory Colleges
  useEffect(() => {
    let ignore = false;
    async function fetchColleges() {
      setLoading(true);
      try {
        const url = new URL("/api/colleges", window.location.origin);
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", String(limit));
        if (search.trim()) url.searchParams.set("q", search.trim());
        if (selectedState !== "ALL") url.searchParams.set("state", selectedState);
        if (selectedCategory !== "ALL") url.searchParams.set("category", selectedCategory);

        const data = await fetcher<{
          colleges: CollegeItem[];
          total?: number;
          totalPages?: number;
          hasMore: boolean;
        }>(url.toString());
        if (!ignore) {
          setColleges(data.colleges || []);
          if (typeof data.total === "number") setTotal(data.total);
          if (typeof data.totalPages === "number") setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = setTimeout(() => fetchColleges(), 200);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, selectedState, selectedCategory, page, limit]);

  // Fetch real-time leaderboard data unconditionally (for direct podium display)
  useEffect(() => {
    let ignore = false;
    async function fetchLeaderboard() {
      setLeaderboardLoading(true);
      try {
        const url = new URL("/api/colleges/leaderboard", window.location.origin);
        url.searchParams.set("limit", "50");
        if (selectedState !== "ALL") url.searchParams.set("state", selectedState);
        if (selectedCategory !== "ALL") url.searchParams.set("category", selectedCategory);

        const data = await fetcher<{
          leaderboard: LeaderboardCollegeItem[];
        }>(url.toString());
        if (!ignore && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error("Failed to load college leaderboard:", err);
      } finally {
        if (!ignore) setLeaderboardLoading(false);
      }
    }

    fetchLeaderboard();
    return () => {
      ignore = true;
    };
  }, [selectedState, selectedCategory]);

  async function handleAddCollege(e: React.FormEvent) {
    e.preventDefault();
    if (!newCollegeName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCollegeName,
          state: newCollegeState,
          district: newCollegeDistrict,
          website: newCollegeWebsite,
        }),
      });

      if (!res.ok) throw new Error("Failed to add college");

      toast.success("Campus Hub request submitted! (+50 LP reward credited)");
      setShowAddModal(false);
      setNewCollegeName("");
      setNewCollegeState("");
      setNewCollegeDistrict("");
      setNewCollegeWebsite("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add college");
    } finally {
      setSubmitting(false);
    }
  }

  const tabs = [
    { id: "directory" as const, label: "Directory" },
    { id: "leaderboard" as const, label: "Leaderboard" },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl select-none flex-col border-x border-border/20 pb-28">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 px-4 py-3.5">
          <div className="min-w-0">
            <h1 className="text-lg font-black tracking-tight text-foreground">Colleges</h1>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-95"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Request campus</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Equal-width underline tabs, matching the feed */}
        <div className="flex items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={cn(
                  "relative flex-1 cursor-pointer py-3 text-[14px] font-bold transition-colors",
                  isActive
                    ? "font-black text-foreground"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Directory Tab ─── */}
      {activeTab === "directory" && (
        <>
          {/* Direct Top 3 Podium: Immediately rendered when on default directory view */}
          {!search.trim() && page === 1 && (
            <AllIndiaCollegePodium
              leaderboard={leaderboard}
              loading={leaderboardLoading}
              compact={true}
            />
          )}

          {/* Search */}
          <div className="border-b border-border/30 px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, city or NIRF rank"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-full border border-border/60 bg-muted/30 pl-10 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-2 border-b border-border/30 px-4 py-3">
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              {CATEGORY_FILTERS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPage(1);
                    }}
                    className={cn(
                      "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                      isSelected
                        ? "bg-foreground font-black text-background"
                        : "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              {POPULAR_STATES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedState(st);
                    setPage(1);
                  }}
                  className={cn(
                    "shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                    selectedState === st
                      ? "bg-foreground font-black text-background"
                      : "border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {st === "ALL" ? "All India" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3.5 px-4 py-3.5">
                  <div className="size-11 shrink-0 rounded-full bg-muted/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 rounded bg-muted/60" />
                    <div className="h-2.5 w-1/3 rounded bg-muted/40" />
                  </div>
                </div>
              ))
            ) : colleges.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-4 py-2.5 text-[13px] text-muted-foreground border-b border-border/20">
                  <p>
                    Showing{" "}
                    <strong className="font-black text-foreground">
                      {(page - 1) * limit + 1}–{Math.min(page * limit, total || colleges.length)}
                    </strong>{" "}
                    of{" "}
                    <strong className="font-black text-foreground">
                      {total ? total.toLocaleString("en-IN") : colleges.length}
                    </strong>{" "}
                    campuses{selectedState !== "ALL" ? ` in ${selectedState}` : " across India"}
                  </p>
                  {totalPages > 1 && (
                    <span className="text-xs font-bold text-muted-foreground hidden sm:inline-block">
                      Page {page} of {totalPages}
                    </span>
                  )}
                </div>

                {colleges.map((college) => (
                  <CollegeHubRow key={college.id} college={college} />
                ))}

                {/* ─── Interactive Pagination Bar ─── */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 border-t border-border/30 bg-card/40">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => {
                          setPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer",
                          page <= 1
                            ? "border-border/30 text-muted-foreground/40 opacity-50 cursor-not-allowed"
                            : "border-border/60 bg-card hover:bg-muted text-foreground active:scale-95"
                        )}
                      >
                        <ChevronLeft className="size-3.5" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => {
                          setPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer",
                          page >= totalPages
                            ? "border-border/30 text-muted-foreground/40 opacity-50 cursor-not-allowed"
                            : "border-border/60 bg-card hover:bg-muted text-foreground active:scale-95"
                        )}
                      >
                        <span>Next</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>

                    {/* Page Numbers with Smart Ellipsis */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          if (totalPages <= 7) return true;
                          if (p === 1 || p === totalPages) return true;
                          return Math.abs(p - page) <= 1;
                        })
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                          if (
                            idx > 0 &&
                            typeof arr[idx - 1] === "number" &&
                            (p as number) - (arr[idx - 1] as number) > 1
                          ) {
                            acc.push("...");
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) => {
                          if (item === "...") {
                            return (
                              <span key={`dots-${idx}`} className="px-1.5 text-xs text-muted-foreground/60">
                                …
                              </span>
                            );
                          }
                          const pageNum = Number(item);
                          const isCurrent = pageNum === page;
                          return (
                            <button
                              key={`page-${pageNum}`}
                              type="button"
                              onClick={() => {
                                setPage(pageNum);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={cn(
                                "size-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer",
                                isCurrent
                                  ? "bg-primary text-primary-foreground font-black shadow-xs"
                                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                              )}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
                <School className="size-8 text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-foreground">No campuses found</h3>
                  <p className="text-[13px] text-muted-foreground">
                    Can&apos;t find your college? Request it and we&apos;ll index it.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-1 cursor-pointer rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Request campus
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Leaderboard Tab ─── */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4 pt-2">
          {/* Filters for Leaderboard */}
          <div className="space-y-2 border-b border-border/30 px-4 pb-3">
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              {CATEGORY_FILTERS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setPage(1);
                    }}
                    className={cn(
                      "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                      isSelected
                        ? "bg-foreground font-black text-background"
                        : "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              {POPULAR_STATES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedState(st);
                    setPage(1);
                  }}
                  className={cn(
                    "shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                    selectedState === st
                      ? "bg-foreground font-black text-background"
                      : "border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {st === "ALL" ? "All India" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium Component */}
          <AllIndiaCollegePodium
            leaderboard={leaderboard}
            loading={leaderboardLoading}
          />

          {leaderboardLoading ? (
            <div className="divide-y divide-border/20 px-4 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3.5 py-3">
                  <div className="size-11 rounded-full bg-muted/60" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-1/2 rounded bg-muted/60" />
                    <div className="h-2.5 w-1/4 rounded bg-muted/40" />
                  </div>
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <Trophy className="mx-auto size-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-bold text-foreground">No campus standings found</p>
              <p className="text-xs text-muted-foreground">
                Try switching filters or be the first student to register your college!
              </p>
            </div>
          ) : (
            /* Ranks 4 and above */
            <div className="divide-y divide-border/30 pt-2">
              <div className="px-4 py-2 text-[12px] font-bold text-muted-foreground flex items-center justify-between">
                <span>Campuses {leaderboard.length >= 3 ? `4–${leaderboard.length}` : "Standings"}</span>
                <span>Clout & Engagement</span>
              </div>

              {(leaderboard.length >= 3 ? leaderboard.slice(3) : leaderboard).map((col) => (
                <CollegeHubRow
                  key={col.id}
                  rank={col.rank}
                  college={{
                    id: col.id,
                    slug: col.slug,
                    name: col.name,
                    state: col.state,
                    district: col.district,
                    website: col.website,
                    yearOfEstablishment: col.yearOfEstablishment,
                    aisheCode: "",
                    logoUrl: col.logoUrl,
                    nirfRank: col.nirfRank,
                  }}
                  trailing={
                    <div className="text-right">
                      <span className="block text-[13px] font-black text-primary tabular-nums">
                        {col.points.toLocaleString("en-IN")} LP
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {col.studentCount} verified {col.studentCount === 1 ? "student" : "students"}
                      </span>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddCollegeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          newCollegeName={newCollegeName}
          setNewCollegeName={setNewCollegeName}
          newCollegeState={newCollegeState}
          setNewCollegeState={setNewCollegeState}
          newCollegeDistrict={newCollegeDistrict}
          setNewCollegeDistrict={setNewCollegeDistrict}
          newCollegeWebsite={newCollegeWebsite}
          setNewCollegeWebsite={setNewCollegeWebsite}
          onSubmit={handleAddCollege}
          submitting={submitting}
        />
      )}
    </main>
  );
}
