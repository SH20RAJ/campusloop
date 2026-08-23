"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Sparkles, Filter, RotateCcw, HeartHandshake, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetcher } from "@/lib/api";

import { DatingCardStack, Candidate } from "@/components/dating/dating-card-stack";
import { DatingFiltersModal } from "@/components/dating/dating-filters-modal";
import { DatingMatchModal } from "@/components/dating/dating-match-modal";

type MatchResult = {
  matched: boolean;
  conversationId?: string;
  matchedUser?: {
    displayName: string;
    avatarUrl: string | null;
  };
};

export function DatingClient() {
  const searchParams = useSearchParams();

  const gender = (searchParams.get("gender") as "ALL" | "MALE" | "FEMALE") || "ALL";
  const collegeScope = (searchParams.get("scope") as "CAMPUS" | "GLOBAL") || "GLOBAL";
  const sort = (searchParams.get("sort") as "COMPATIBILITY" | "RECENT" | "POPULAR") || "COMPATIBILITY";

  const [showFilters, setShowFilters] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const queryUrl = `/api/dating/profiles?gender=${gender}&scope=${collegeScope}&sort=${sort}`;

  const { data: candidates, isLoading, mutate } = useSWR<Candidate[]>(queryUrl, fetcher);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeCandidates = useMemo(() => candidates || [], [candidates]);
  const currentCandidate = activeCandidates[currentIndex];

  function updateFilters(updates: { gender?: string; scope?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.gender !== undefined) params.set("gender", updates.gender);
    if (updates.scope !== undefined) params.set("scope", updates.scope);
    if (updates.sort !== undefined) params.set("sort", updates.sort);
    window.history.replaceState(null, "", `?${params.toString()}`);
    setCurrentIndex(0);
    mutate();
  }

  async function handleSwipe(action: "like" | "pass") {
    if (!currentCandidate) return;

    try {
      const res = await fetch("/api/dating/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: currentCandidate.id,
          direction: action === "like" ? "LIKE" : "PASS",
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as MatchResult;
        if (data.matched) {
          setMatchResult(data);
        }
      }
    } catch (err) {
      console.error("[dating] swipe error:", err);
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    // When nearing end of deck, re-fetch fresh candidates
    if (nextIndex >= activeCandidates.length - 2) {
      mutate();
    }
  }

  async function handleResetSwipes() {
    try {
      const res = await fetch("/api/dating/swipe", { method: "DELETE" });
      if (res.ok) {
        toast.success("Swipes reset! Re-loading fresh candidate deck...");
        setCurrentIndex(0);
        setShowFilters(false);
        mutate();
      } else {
        toast.error("Failed to reset swipes.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error resetting swipes.");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col min-h-screen px-4 pt-4 pb-24 space-y-5 select-none">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-rose-500 animate-pulse" />
            Campus Matches
          </h1>
          <p className="text-xs text-muted-foreground font-medium">Swipe & connect with verified college students</p>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="h-9 px-3.5 rounded-2xl border border-border bg-card text-xs font-bold text-foreground flex items-center gap-1.5 hover:bg-muted/80 shadow-xs transition-colors cursor-pointer"
        >
          <Filter className="size-3.5 text-rose-500" /> Filter & Sort
        </button>
      </div>

      {/* Main Deck Container */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {isLoading ? (
          <div className="w-full max-w-sm aspect-[3/4] rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex flex-col items-center space-y-3 py-4">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : currentCandidate ? (
          <div className="w-full space-y-3">
            <DatingCardStack candidate={currentCandidate} onSwipe={handleSwipe} />
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Candidate {currentIndex + 1} of {activeCandidates.length} · Swipe right to match ❤️
            </p>
          </div>
        ) : (
          <div className="w-full max-w-sm text-center space-y-4 py-12 px-6 rounded-3xl border border-dashed border-border bg-card/60 shadow-lg">
            <div className="size-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <HeartHandshake className="size-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-foreground">You've seen everyone nearby!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                No more candidates matching your current filter in this deck. Reset your swipes or switch to Global scope to see students across all campuses!
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => updateFilters({ scope: "GLOBAL" })}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Switch to Global Campuses <ArrowRight className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={handleResetSwipes}
                className="w-full py-2.5 px-4 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="size-3.5" /> Start Over & Reset Swipes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DatingFiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        gender={gender}
        collegeScope={collegeScope}
        sort={sort}
        onUpdateFilters={updateFilters}
        onResetSwipes={handleResetSwipes}
      />

      <DatingMatchModal
        matchResult={matchResult}
        onClose={() => setMatchResult(null)}
      />
    </main>
  );
}
