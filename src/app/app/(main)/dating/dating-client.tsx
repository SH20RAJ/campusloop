"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, MessageCircle, Sparkles, Filter, MapPin, School, Star, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  const [gender, setGender] = useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [collegeScope, setCollegeScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [targetCollegeId, setTargetCollegeId] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const { data: rawColleges } = useSWR<{ colleges: { id: string; name: string }[] } | { id: string; name: string }[]>("/api/colleges", fetcher);
  const colleges = Array.isArray(rawColleges) ? rawColleges : (rawColleges?.colleges || []);

  const { data: candidates, error, isLoading, mutate } = useSWR<Candidate[]>(
    `/api/dating/profiles?gender=${gender}&college=${collegeScope}&targetInstitutionId=${targetCollegeId}`,
    fetcher
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeResult, setSwipeResult] = useState<MatchResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | "up" | null>(null);

  const currentCandidate = candidates && currentIndex < candidates.length ? candidates[currentIndex] : null;

  // Keyboard shortcut listener for ultra-fast addictive swiping
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (swipeResult || actionLoading || !currentCandidate) return;
      if (e.key === "ArrowLeft") handleSwipe("PASS");
      if (e.key === "ArrowRight") handleSwipe("LIKE");
      if (e.key === "ArrowUp") handleSwipe("LIKE");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [swipeResult, actionLoading, currentCandidate]);

  async function handleSwipe(direction: "LIKE" | "PASS") {
    if (!currentCandidate || actionLoading) return;

    setActionLoading(true);
    setSwipeDirection(direction === "LIKE" ? "right" : "left");

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
        if (result.matched) {
          setSwipeResult(result);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 180);
    } catch (err) {
      console.error(err);
      toast.error("Network error. Try swiping again.");
      setSwipeDirection(null);
    } finally {
      setActionLoading(false);
    }
  }

  function handleCloseMatch() {
    setSwipeResult(null);
    setCurrentIndex((prev) => prev + 1);
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-[82vh] px-4 space-y-4 max-w-sm mx-auto pb-10 pt-2">
      {/* Sleek Header Bar */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex size-7 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
            <Sparkles className="size-4 animate-pulse" />
          </div>
          <span className="text-sm font-black tracking-tight text-foreground">Campus Matches</span>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            showFilters || gender !== "ALL" || collegeScope !== "CAMPUS"
              ? "bg-pink-500/10 text-pink-500 border-pink-500/30"
              : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
          }`}
        >
          <Filter className="size-3" /> Filter
        </button>
      </div>

      {/* Filter Preferences Panel */}
      {showFilters && (
        <div className="w-full bg-card rounded-2xl border border-border/60 p-4 space-y-3 shadow-md animate-in slide-in-from-top-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Match Preferences
          </span>

          <div className="space-y-2.5 text-xs font-semibold">
            {/* Gender Filter */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Show Me</span>
              <div className="flex gap-1 bg-muted/60 p-1 rounded-xl border border-border/40 text-[11px]">
                {(["ALL", "MALE", "FEMALE"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setGender(g);
                      setCurrentIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      gender === g
                        ? "bg-background text-foreground shadow-sm font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g === "ALL" ? "Everyone" : g === "MALE" ? "Men" : "Women"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Filter */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Campus Radius</span>
              <div className="flex gap-1 bg-muted/60 p-1 rounded-xl border border-border/40 text-[11px]">
                <button
                  onClick={() => {
                    setCollegeScope("CAMPUS");
                    setTargetCollegeId("ALL");
                    setCurrentIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    collegeScope === "CAMPUS"
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Campus
                </button>
                <button
                  onClick={() => {
                    setCollegeScope("GLOBAL");
                    setCurrentIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    collegeScope === "GLOBAL"
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All India
                </button>
              </div>
            </div>

            {collegeScope === "GLOBAL" && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
                <span className="text-muted-foreground">Select College</span>
                <select
                  value={targetCollegeId}
                  onChange={(e) => {
                    setTargetCollegeId(e.target.value);
                    setCurrentIndex(0);
                  }}
                  className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1 text-xs font-semibold text-foreground outline-none max-w-[180px]"
                >
                  <option value="ALL">All Campuses</option>
                  {colleges?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Swipe Deck Container */}
      <div className="relative w-full aspect-[3/4] rounded-3xl border border-border/70 bg-card shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-200">
        {isLoading ? (
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl animate-pulse" />
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
          <div
            className={`flex-1 flex flex-col justify-between transition-transform duration-200 ${
              swipeDirection === "left"
                ? "-translate-x-24 -rotate-12 opacity-0"
                : swipeDirection === "right"
                ? "translate-x-24 rotate-12 opacity-0"
                : ""
            }`}
          >
            {/* Candidate Card Image / Avatar Section */}
            <div className="relative flex-1 bg-gradient-to-b from-pink-500/10 via-muted/30 to-card flex flex-col items-center justify-center p-6">
              {/* Verified Badge */}
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-500 flex items-center gap-1 border border-emerald-500/20 shadow-sm">
                <ShieldCheck className="size-3" /> Verified Student
              </div>

              {/* Distance / Scope Badge */}
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-foreground flex items-center gap-1 border border-border/40 shadow-sm">
                <MapPin className="size-3 text-primary" />
                {collegeScope === "CAMPUS" ? "On Campus" : "India"}
              </div>

              <Avatar className="h-28 w-28 border-4 border-background shadow-2xl mb-3 ring-2 ring-pink-500/30">
                <AvatarImage src={currentCandidate.avatarUrl || ""} />
                <AvatarFallback className="text-3xl font-black bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                  {currentCandidate.displayName[0]}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-lg font-black text-foreground">{currentCandidate.displayName}</h3>

              <p className="text-xs text-primary font-bold flex items-center gap-1 mt-0.5">
                <School className="size-3.5" />
                {currentCandidate.institution?.name || "Verified Campus Student"}
              </p>

              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">@{currentCandidate.username}</p>

              {/* Shared Campus Interest Tags */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {["#LateNightTea", "#Confessions", "#CanteenGossip"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md border bg-card/60 border-border/40 text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate Bio Quote */}
            <div className="px-5 py-3 border-t border-border/40 bg-card text-center space-y-1">
              <p className="text-xs text-foreground/90 font-medium italic leading-relaxed">
                &ldquo;{currentCandidate.bio || "Hey! I'm on CampusLoop looking for cool study dates."}&rdquo;
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-5 py-4 border-t border-border/40 bg-card shrink-0">
              <button
                onClick={() => handleSwipe("PASS")}
                disabled={actionLoading}
                className="flex items-center justify-center h-12 w-12 rounded-full border border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-muted active:scale-90 shadow-sm transition-all cursor-pointer"
                title="Pass (Left Arrow)"
              >
                <X className="size-5" />
              </button>

              <button
                onClick={() => handleSwipe("LIKE")}
                disabled={actionLoading}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white active:scale-90 shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all cursor-pointer"
                title="Like (Right Arrow)"
              >
                <Heart className="size-5 fill-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="size-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 border border-pink-500/20 shadow-sm">
              <Sparkles className="size-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">You&apos;ve seen everyone! 🎉</h4>
              <p className="text-xs text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                No more candidate profiles matching your preference right now.
              </p>
            </div>
            <button
              onClick={() => {
                setCurrentIndex(0);
                mutate();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer pt-2"
            >
              <RotateCcw className="size-3.5" /> Re-shuffle Cards
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground font-semibold text-center">
        Tip: Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">←</kbd> to pass or <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">→</kbd> to like!
      </p>

      {/* Match Celebration Modal */}
      {swipeResult?.matched && swipeResult.matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-pink-500/30 bg-card p-6 shadow-2xl text-center space-y-6 flex flex-col items-center animate-in zoom-in-95">
            <div className="space-y-1">
              <span className="text-xs font-black tracking-widest text-pink-500 uppercase flex items-center justify-center gap-1">
                <Sparkles className="size-3.5 animate-bounce" /> It&apos;s a Match!
              </span>
              <h3 className="text-lg font-bold text-foreground">
                You and {swipeResult.matchedUser.displayName} liked each other!
              </h3>
            </div>

            <div className="flex items-center gap-4 py-2">
              <Avatar className="h-20 w-20 border-2 border-pink-500 shadow-lg">
                <AvatarFallback className="text-xl font-bold bg-pink-500 text-white">Me</AvatarFallback>
              </Avatar>
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500 animate-pulse shrink-0" />
              <Avatar className="h-20 w-20 border-2 border-pink-500 shadow-lg">
                <AvatarImage src={swipeResult.matchedUser.avatarUrl || ""} />
                <AvatarFallback className="text-xl font-bold bg-pink-500 text-white">
                  {swipeResult.matchedUser.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col w-full gap-2.5 pt-2">
              <Link
                href="/app/chat"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 h-10 px-4 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
              >
                <MessageCircle className="h-4 w-4" /> Start Private Chat
              </Link>
              <button
                onClick={handleCloseMatch}
                className="h-10 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
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
