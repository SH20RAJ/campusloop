"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import useSWR from "swr";
import { Sparkles, Filter, RotateCcw, ShieldCheck } from "lucide-react";
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
  const targetCollegeId = searchParams.get("collegeId") || "ALL";

  const [showFilters, setShowFilters] = useState(false);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const queryUrl = `/api/dating/profiles?gender=${gender}&scope=${collegeScope}${
    targetCollegeId !== "ALL" ? `&collegeId=${targetCollegeId}` : ""
  }`;

  const { data: candidates, isLoading, mutate } = useSWR<Candidate[]>(queryUrl, fetcher);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeCandidates = useMemo(() => candidates || [], [candidates]);
  const currentCandidate = activeCandidates[currentIndex];

  function updateFilters(updates: { gender?: string; scope?: string; collegeId?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.gender !== undefined) params.set("gender", updates.gender);
    if (updates.scope !== undefined) params.set("scope", updates.scope);
    if (updates.collegeId !== undefined) params.set("collegeId", updates.collegeId);
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
        body: JSON.stringify({ targetUserId: currentCandidate.id, action }),
      });

      if (res.ok) {
        const data = (await res.json()) as MatchResult;
        if (data.matched) {
          setMatchResult(data);
        }
      }
    } catch (err) {
      console.error(err);
    }

    setCurrentIndex((prev) => prev + 1);
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col min-h-screen px-4 pt-4 pb-24 space-y-5 select-none">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-rose-500" />
            Campus Matches
          </h1>
          <p className="text-xs text-muted-foreground">Swipe & meet verified students</p>
        </div>

        <button
          onClick={() => setShowFilters(true)}
          className="h-9 px-3 rounded-xl border border-border bg-card text-xs font-semibold text-foreground flex items-center gap-1.5 hover:bg-muted transition-colors cursor-pointer"
        >
          <Filter className="size-3.5" /> Filter
        </button>
      </div>

      {/* Main Deck Container */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        {isLoading ? (
          <div className="w-full max-w-sm aspect-[3/4] rounded-3xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : currentCandidate ? (
          <DatingCardStack candidate={currentCandidate} onSwipe={handleSwipe} />
        ) : (
          <div className="text-center space-y-3 py-16 px-6 rounded-3xl border border-dashed border-border bg-card/50">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">You're all caught up!</h3>
            <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
              No more candidates nearby right now. Try expanding your radius filter to Global!
            </p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1 mx-auto cursor-pointer"
            >
              <RotateCcw className="size-3.5" /> Start Over
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <DatingFiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        gender={gender}
        collegeScope={collegeScope}
        targetCollegeId={targetCollegeId}
        onUpdateFilters={updateFilters}
        colleges={[]}
        collegeSearchQuery={collegeSearchQuery}
        setCollegeSearchQuery={setCollegeSearchQuery}
        showCollegeDropdown={showCollegeDropdown}
        setShowCollegeDropdown={setShowCollegeDropdown}
      />

      <DatingMatchModal
        matchResult={matchResult}
        onClose={() => setMatchResult(null)}
      />
    </main>
  );
}
