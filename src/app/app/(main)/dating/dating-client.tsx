"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, MessageCircle, Sparkles, Filter, MapPin, School, RotateCcw, ShieldCheck, Search, Check } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

type Candidate = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  institution?: { name: string } | null;
};

type MatchResult = {
  matched: boolean;
  conversationId?: string;
  matchedUser?: {
    displayName: string;
    avatarUrl: string | null;
  };
};

export function DatingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state management with defaults
  const gender = (searchParams.get("gender") as "ALL" | "MALE" | "FEMALE") || "ALL";
  const collegeScope = (searchParams.get("scope") as "CAMPUS" | "GLOBAL") || "GLOBAL"; // Default Global as requested
  const targetCollegeId = searchParams.get("collegeId") || "ALL";

  const [showFilters, setShowFilters] = useState(false);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  // Helper to sync filter updates to URL search parameters without page reload
  function updateFilters(updates: { gender?: string; scope?: string; collegeId?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.gender !== undefined) params.set("gender", updates.gender);
    if (updates.scope !== undefined) params.set("scope", updates.scope);
    if (updates.collegeId !== undefined) params.set("collegeId", updates.collegeId);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setCurrentIndex(0);
  }

  const { data: rawColleges } = useSWR<{ colleges: { id: string; name: string }[] } | { id: string; name: string }[]>("/api/colleges?limit=100", fetcher);
  const colleges = Array.isArray(rawColleges) ? rawColleges : (rawColleges?.colleges || []);

  const filteredColleges = useMemo(() => {
    if (!collegeSearchQuery.trim()) return colleges.slice(0, 30);
    const q = collegeSearchQuery.toLowerCase();
    return colleges.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 40);
  }, [colleges, collegeSearchQuery]);

  const selectedCollegeName = useMemo(() => {
    if (targetCollegeId === "ALL") return "All Campuses";
    return colleges.find((c) => c.id === targetCollegeId)?.name || "Selected College";
  }, [colleges, targetCollegeId]);

  const { data: candidates, error, isLoading, mutate } = useSWR<Candidate[]>(
    `/api/dating/profiles?gender=${gender}&college=${collegeScope}&targetInstitutionId=${targetCollegeId}`,
    fetcher
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeResult, setSwipeResult] = useState<MatchResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const currentCandidate = candidates && currentIndex < candidates.length ? candidates[currentIndex] : null;

  // Motion drag values for Tinder-like physics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacityLike = useTransform(x, [20, 150], [0, 1]);
  const opacityPass = useTransform(x, [-20, -150], [0, 1]);

  // Keyboard navigation for fast swiping
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (swipeResult || actionLoading || !currentCandidate) return;
      if (e.key === "ArrowLeft") handleSwipe("PASS");
      if (e.key === "ArrowRight") handleSwipe("LIKE");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [swipeResult, actionLoading, currentCandidate]);

  async function handleSwipe(direction: "LIKE" | "PASS") {
    if (!currentCandidate || actionLoading) return;

    setActionLoading(true);
    setSwipeDirection(direction === "LIKE" ? "right" : "left");

    if (direction === "LIKE") {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }

    try {
      const res = await fetch("/api/dating/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: currentCandidate.id,
          direction,
        }),
      });

      if (!res.ok) throw new Error("Swipe failed");

      const result = (await res.json()) as MatchResult;

      setTimeout(() => {
        setSwipeDirection(null);
        x.set(0);
        if (result.matched) {
          setSwipeResult(result);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 160);
    } catch (err) {
      console.error(err);
      toast.error("Network error. Try swiping again.");
      setSwipeDirection(null);
      x.set(0);
    } finally {
      setActionLoading(false);
    }
  }

  function handleCloseMatch() {
    setSwipeResult(null);
    setCurrentIndex((prev) => prev + 1);
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-[82vh] px-4 space-y-4 max-w-sm mx-auto pb-10 pt-2 select-none">
      {/* Minimal Header Bar */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex size-7 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
            <Sparkles className="size-4 animate-pulse" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">Campus Matches</span>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            showFilters || gender !== "ALL" || collegeScope !== "GLOBAL" || targetCollegeId !== "ALL"
              ? "bg-pink-500/10 text-pink-500 border-pink-500/30"
              : "bg-muted/40 text-muted-foreground border-border/60 hover:text-foreground"
          }`}
        >
          <Filter className="size-3" /> Preferences
        </button>
      </div>

      {/* Filter Preferences Panel */}
      {showFilters && (
        <div className="w-full bg-background rounded-2xl border border-border/60 p-4 space-y-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-1 border-b border-border/40">
            <span className="text-xs font-bold text-foreground">Match Filters</span>
            <button
              onClick={() => setShowFilters(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Gender Filter */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Show Me</span>
              <div className="flex gap-1 bg-muted/40 p-0.5 rounded-xl border border-border/40 text-[11px] font-semibold">
                {(["ALL", "MALE", "FEMALE"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => updateFilters({ gender: g })}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      gender === g
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g === "ALL" ? "Everyone" : g === "MALE" ? "Men" : "Women"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Filter (Global by default) */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Campus Scope</span>
              <div className="flex gap-1 bg-muted/40 p-0.5 rounded-xl border border-border/40 text-[11px] font-semibold">
                <button
                  onClick={() => updateFilters({ scope: "GLOBAL", collegeId: "ALL" })}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    collegeScope === "GLOBAL"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All India (Global)
                </button>
                <button
                  onClick={() => updateFilters({ scope: "CAMPUS", collegeId: "ALL" })}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    collegeScope === "CAMPUS"
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Campus
                </button>
              </div>
            </div>

            {/* Select College with Search Option */}
            {collegeScope === "GLOBAL" && (
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">Filter by College</span>
                  {targetCollegeId !== "ALL" && (
                    <button
                      onClick={() => updateFilters({ collegeId: "ALL" })}
                      className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                <div className="relative">
                  <div
                    onClick={() => setShowCollegeDropdown(!showCollegeDropdown)}
                    className="flex items-center justify-between w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs font-semibold text-foreground cursor-pointer"
                  >
                    <span className="truncate">{selectedCollegeName}</span>
                    <Search className="size-3.5 text-muted-foreground shrink-0" />
                  </div>

                  {showCollegeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-border bg-popover p-2 shadow-2xl space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search 1,350+ Indian colleges..."
                          value={collegeSearchQuery}
                          onChange={(e) => setCollegeSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border/60 bg-muted/30 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-0.5 pt-1">
                        <button
                          onClick={() => {
                            updateFilters({ collegeId: "ALL" });
                            setShowCollegeDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                            targetCollegeId === "ALL" ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                          }`}
                        >
                          <span>All Campuses in India</span>
                          {targetCollegeId === "ALL" && <Check className="size-3.5 text-primary" />}
                        </button>

                        {filteredColleges.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              updateFilters({ collegeId: c.id });
                              setShowCollegeDropdown(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate flex items-center justify-between cursor-pointer ${
                              targetCollegeId === c.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            {targetCollegeId === c.id && <Check className="size-3.5 text-primary shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Addictive Tinder/Bumble Interactive Drag Card Deck */}
      <div className="relative w-full aspect-[3/4] rounded-2xl border border-border/60 bg-background shadow-2xl flex flex-col justify-between overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <Skeleton className="h-44 w-full rounded-2xl animate-pulse" />
              <Skeleton className="h-6 w-3/4 rounded animate-pulse" />
              <Skeleton className="h-4 w-1/2 rounded animate-pulse" />
            </div>
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
              <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground text-xs space-y-2">
            <p>Could not load dating candidates.</p>
            <button onClick={() => mutate()} className="text-primary font-bold hover:underline cursor-pointer">
              Retry Connection
            </button>
          </div>
        ) : currentCandidate ? (
          <motion.div
            key={currentCandidate.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) {
                handleSwipe("LIKE");
              } else if (info.offset.x < -100) {
                handleSwipe("PASS");
              }
            }}
            className="flex-1 flex flex-col justify-between cursor-grab active:cursor-grabbing relative"
          >
            {/* Drag Overlay Badges */}
            <motion.div
              style={{ opacity: opacityLike }}
              className="absolute top-6 left-6 z-20 border-2 border-emerald-500 text-emerald-500 font-black text-sm px-3 py-1 rounded-xl rotate-[-15deg] pointer-events-none shadow-md"
            >
              LIKE ❤️
            </motion.div>

            <motion.div
              style={{ opacity: opacityPass }}
              className="absolute top-6 right-6 z-20 border-2 border-rose-500 text-rose-500 font-black text-sm px-3 py-1 rounded-xl rotate-[15deg] pointer-events-none shadow-md"
            >
              NOPE ❌
            </motion.div>

            {/* Candidate Card Image / Avatar Section */}
            <div 
              onDoubleClick={() => handleSwipe("LIKE")}
              className="relative flex-1 bg-gradient-to-b from-pink-500/10 via-muted/20 to-background flex flex-col items-center justify-center p-6"
            >
              {/* Verified Student Badge */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-emerald-500 flex items-center gap-1 border border-emerald-500/20 shadow-xs">
                <ShieldCheck className="size-3" /> Verified Student
              </div>

              {/* Scope Badge */}
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-foreground flex items-center gap-1 border border-border/40 shadow-xs">
                <MapPin className="size-3 text-pink-500" />
                {collegeScope === "CAMPUS" ? "Campus" : "India"}
              </div>

              <Avatar className="h-28 w-28 border-4 border-background shadow-xl mb-3 ring-2 ring-pink-500/30">
                <AvatarImage src={currentCandidate.avatarUrl || ""} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                  {currentCandidate.displayName[0]}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-lg font-bold text-foreground">{currentCandidate.displayName}</h3>

              <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                <School className="size-3.5" />
                {currentCandidate.institution?.name || "Verified Campus Student"}
              </p>

              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">@{currentCandidate.username}</p>

              {/* Shared Campus Interest Tags */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {["#LateNightTea", "#Confessions", "#CanteenGossip"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-md border bg-muted/40 border-border/40 text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate Bio Quote */}
            <div className="px-5 py-2.5 border-t border-border/40 bg-background text-center space-y-1">
              <p className="text-xs text-foreground/90 font-medium italic leading-relaxed">
                &ldquo;{currentCandidate.bio || "Hey! I'm on CampusLoop looking for cool study dates."}&rdquo;
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6 py-3 border-t border-border/40 bg-background shrink-0">
              <button
                onClick={() => handleSwipe("PASS")}
                disabled={actionLoading}
                className="flex items-center justify-center h-11 w-11 rounded-full border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted active:scale-90 shadow-xs transition-all cursor-pointer"
                title="Pass (Left Arrow)"
              >
                <X className="size-5" />
              </button>

              <button
                onClick={() => handleSwipe("LIKE")}
                disabled={actionLoading}
                className="flex items-center justify-center h-11 w-11 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white active:scale-90 shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all cursor-pointer"
                title="Like (Right Arrow)"
              >
                <Heart className="size-5 fill-white" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="size-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 border border-pink-500/20 shadow-xs">
              <Sparkles className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground text-sm">You&apos;ve seen all candidates! 🎉</h4>
              <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                No more candidate profiles matching your filters right now.
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentIndex(0);
                mutate();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer pt-2"
            >
              <RotateCcw className="size-3.5" /> Re-shuffle Cards
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground font-semibold text-center">
        Swipe card or press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">←</kbd> to pass or <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">→</kbd> to like!
      </p>

      {/* Match Celebration Modal */}
      {swipeResult?.matched && swipeResult.matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-pink-500/30 bg-background p-6 shadow-2xl text-center space-y-5 flex flex-col items-center animate-in zoom-in-95">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-pink-500 uppercase flex items-center justify-center gap-1">
                <Sparkles className="size-3.5 animate-bounce" /> It&apos;s a Match!
              </span>
              <h3 className="text-base font-bold text-foreground">
                You and {swipeResult.matchedUser.displayName} liked each other!
              </h3>
            </div>

            <div className="flex items-center gap-4 py-2">
              <Avatar className="h-18 w-18 border-2 border-pink-500 shadow-md">
                <AvatarFallback className="text-xl font-bold bg-pink-500 text-white">Me</AvatarFallback>
              </Avatar>
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500 animate-pulse shrink-0" />
              <Avatar className="h-18 w-18 border-2 border-pink-500 shadow-md">
                <AvatarImage src={swipeResult.matchedUser.avatarUrl || ""} />
                <AvatarFallback className="text-xl font-bold bg-pink-500 text-white">
                  {swipeResult.matchedUser.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col w-full gap-2 pt-1">
              <Link
                href="/app/chat"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 h-10 px-4 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-opacity"
              >
                <MessageCircle className="h-4 w-4" /> Start Private Chat
              </Link>
              <button
                onClick={handleCloseMatch}
                className="h-9 rounded-xl border border-border/60 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
