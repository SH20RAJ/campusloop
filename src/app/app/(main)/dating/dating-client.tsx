"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Sparkles, Filter, RotateCcw, HeartHandshake, ArrowRight, Camera, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetcher } from "@/lib/api";
import { useProfile } from "@/hooks/use-profile";
import Link from "next/link";

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
  const { profile, mutate: mutateProfile } = useProfile();

  const gender = (searchParams.get("gender") as "ALL" | "MALE" | "FEMALE") || "ALL";
  const collegeScope = (searchParams.get("scope") as "CAMPUS" | "GLOBAL") || "GLOBAL";
  const sort = (searchParams.get("sort") as "COMPATIBILITY" | "RECENT" | "POPULAR") || "COMPATIBILITY";

  const [showFilters, setShowFilters] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Gender Gate State
  const [selectedGenderGate, setSelectedGenderGate] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [isSavingGender, setIsSavingGender] = useState(false);

  const queryUrl = `/api/dating/profiles?gender=${gender}&scope=${collegeScope}&sort=${sort}`;

  const { data: candidates, error: candidatesError, isLoading, mutate } = useSWR<Candidate[]>(queryUrl, fetcher);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeCandidates = useMemo(() => candidates || [], [candidates]);
  const currentCandidate = activeCandidates[currentIndex];

  const hasGenderSet = profile?.gender && ["MALE", "FEMALE", "OTHER"].includes(profile.gender);
  const isGenderGateRequired = !hasGenderSet || (candidatesError as { error?: string })?.error === "GENDER_REQUIRED";

  async function handleSaveGenderGate(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingGender(true);
    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender: selectedGenderGate }),
      });

      if (!res.ok) throw new Error("Failed to save gender");

      toast.success("Gender saved! Welcome to Campus Dating ❤️");
      await mutateProfile();
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save gender");
    } finally {
      setIsSavingGender(false);
    }
  }

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
    <main className="mx-auto flex w-full max-w-xl flex-col min-h-screen px-4 pt-4 pb-24 space-y-4 select-none">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-rose-500 animate-pulse" />
            Campus Matches
          </h1>
          <p className="text-xs text-muted-foreground font-medium">Swipe & connect with verified college students</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/profile/edit"
            className="h-9 px-3 rounded-2xl border border-border bg-card text-xs font-bold text-foreground flex items-center gap-1.5 hover:bg-muted/80 shadow-xs transition-colors cursor-pointer"
            title="Upload dating photos"
          >
            <Camera className="size-3.5 text-primary" />
            <span className="hidden sm:inline">My Photos</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="h-9 px-3.5 rounded-2xl border border-border bg-card text-xs font-bold text-foreground flex items-center gap-1.5 hover:bg-muted/80 shadow-xs transition-colors cursor-pointer"
          >
            <Filter className="size-3.5 text-rose-500" /> Filter
          </button>
        </div>
      </div>

      {/* Main Deck Container */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        {isGenderGateRequired ? (
          /* Mandatory Gender Setup Gate Card */
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl space-y-5 text-center my-auto">
            <div className="size-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20 shadow-xs">
              <Heart className="size-7 fill-rose-500/20" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-foreground">Set Gender to Unlock Matches</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Campus Dating connects verified students based on identity and preferences. Please select your gender to proceed.
              </p>
            </div>

            <form onSubmit={handleSaveGenderGate} className="space-y-4 pt-1">
              <div className="grid grid-cols-3 gap-2">
                {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGenderGate(g)}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedGenderGate === g
                        ? "border-rose-500 bg-rose-500/10 text-rose-500 shadow-xs"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g === "MALE" ? "👨 Male" : g === "FEMALE" ? "👩 Female" : "✨ Other"}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSavingGender}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingGender ? "Saving..." : "Start Swiping Matches ❤️"}
              </button>
            </form>
          </div>
        ) : isLoading ? (
          <div className="w-full max-w-sm aspect-[3/4.2] rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-xl">
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
          <div className="w-full space-y-2.5">
            <DatingCardStack candidate={currentCandidate} onSwipe={handleSwipe} />
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Candidate {currentIndex + 1} of {activeCandidates.length} · Tap left/right to view photos · Swipe right to like ❤️
            </p>
          </div>
        ) : (
          <div className="w-full max-w-sm text-center space-y-4 py-12 px-6 rounded-3xl border border-dashed border-border bg-card/60 shadow-lg my-auto">
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
