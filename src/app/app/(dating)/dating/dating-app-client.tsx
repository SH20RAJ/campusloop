"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowLeft,
  Heart,
  SlidersHorizontal,
  Camera,
  RotateCcw,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/api";
import { useProfile } from "@/hooks/use-profile";
import { SwipeDeck, SwipeActions, type Candidate } from "@/components/dating/swipe-deck";
import { DatingFiltersSheet, type DatingFilters } from "@/components/dating/dating-filters-sheet";
import { LikesPanel, type Admirer } from "@/components/dating/likes-panel";
import { DatingMatchModal } from "@/components/dating/dating-match-modal";
import { resolveGenderPreference } from "@/lib/dating";

type MatchResult = {
  matched: boolean;
  conversationId?: string;
  matchedUser?: {
    displayName: string;
    avatarUrl: string | null;
  };
};

type ProfilesResponse = {
  candidates: Candidate[];
  meta: { showingGender: "MALE" | "FEMALE" | "ALL"; likesYouCount: number };
};

type LikesResponse = { likes: Admirer[] };

export function DatingAppClient() {
  const { profile, mutate: mutateProfile } = useProfile();

  const [filters, setFilters] = useState<DatingFilters>({
    gender: "DEFAULT",
    scope: "GLOBAL",
    sort: "COMPATIBILITY",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Deck position + last swipe (for Rewind)
  const [deckIndex, setDeckIndex] = useState(0);
  const [lastSwipedId, setLastSwipedId] = useState<string | null>(null);

  // Gender gate
  const [selectedGenderGate, setSelectedGenderGate] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [isSavingGender, setIsSavingGender] = useState(false);

  const queryUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.gender !== "DEFAULT") params.set("gender", filters.gender);
    params.set("scope", filters.scope);
    params.set("sort", filters.sort);
    return `/api/dating/profiles?${params.toString()}`;
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR<ProfilesResponse>(queryUrl, fetcher);
  const { data: likesData, isLoading: likesLoading, mutate: mutateLikes } = useSWR<LikesResponse>(
    showLikes ? "/api/dating/likes" : null,
    fetcher
  );

  const candidates = useMemo(() => data?.candidates ?? [], [data]);
  const remaining = useMemo(() => candidates.slice(deckIndex), [candidates, deckIndex]);
  const likesYouCount = data?.meta?.likesYouCount ?? 0;

  const recommendedGender = resolveGenderPreference(profile?.gender, null);

  const hasGenderSet = profile?.gender && ["MALE", "FEMALE", "OTHER"].includes(profile.gender);
  const genderGateRequired =
    (profile && !hasGenderSet) || (error as { error?: string } | undefined)?.error === "GENDER_REQUIRED";

  const sendSwipe = useCallback(
    async (targetId: string, direction: "LIKE" | "PASS") => {
      try {
        const res = await fetch("/api/dating/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetId, direction }),
        });
        if (res.ok) {
          const result = (await res.json()) as MatchResult;
          if (result.matched) setMatchResult(result);
          return result;
        }
      } catch (err) {
        console.error("[dating] swipe error:", err);
      }
      return null;
    },
    []
  );

  const handleSwipe = useCallback(
    (direction: "like" | "pass") => {
      const current = remaining[0];
      if (!current) return;

      void sendSwipe(current.id, direction === "like" ? "LIKE" : "PASS");
      setLastSwipedId(current.id);
      setDeckIndex((i) => {
        const next = i + 1;
        // Refill the deck as it runs low
        if (candidates.length - next <= 3) void mutate();
        return next;
      });
    },
    [remaining, candidates.length, sendSwipe, mutate]
  );

  const handleUndo = useCallback(async () => {
    if (!lastSwipedId) return;
    try {
      const res = await fetch(`/api/dating/swipe?targetId=${encodeURIComponent(lastSwipedId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeckIndex((i) => Math.max(0, i - 1));
        setLastSwipedId(null);
        toast("Rewound ⏪ Second thoughts allowed.");
      }
    } catch {
      toast.error("Couldn't undo that swipe.");
    }
  }, [lastSwipedId]);

  // Keyboard shortcuts: ← pass, → like, U undo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showFilters || showLikes || matchResult) return;
      if (e.key === "ArrowLeft") handleSwipe("pass");
      else if (e.key === "ArrowRight") handleSwipe("like");
      else if (e.key.toLowerCase() === "u") void handleUndo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSwipe, handleUndo, showFilters, showLikes, matchResult]);

  function updateFilters(updates: Partial<DatingFilters>) {
    setFilters((f) => ({ ...f, ...updates }));
    setDeckIndex(0);
    setLastSwipedId(null);
  }

  async function handleResetSwipes() {
    try {
      const res = await fetch("/api/dating/swipe", { method: "DELETE" });
      if (res.ok) {
        toast.success("Deck reset — fresh faces incoming!");
        setDeckIndex(0);
        setLastSwipedId(null);
        setShowFilters(false);
        void mutate();
      } else {
        toast.error("Failed to reset swipes.");
      }
    } catch {
      toast.error("Network error resetting swipes.");
    }
  }

  async function handleLikeBack(admirer: Admirer) {
    const result = await sendSwipe(admirer.id, "LIKE");
    void mutateLikes();
    void mutate();
    if (!result?.matched) toast.success(`Liked ${admirer.displayName} back!`);
  }

  async function handlePassAdmirer(admirer: Admirer) {
    await sendSwipe(admirer.id, "PASS");
    void mutateLikes();
    void mutate();
  }

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
      toast.success("Welcome to Campus Match ❤️");
      await mutateProfile();
      void mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save gender");
    } finally {
      setIsSavingGender(false);
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col px-4 select-none">
      {/* ─── Top Bar ─── */}
      <header className="flex items-center justify-between py-3">
        <Link
          href="/app"
          aria-label="Back to feed"
          className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <h1 className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-lg font-black tracking-tight text-transparent">
          Campus Match
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLikes(true)}
            aria-label="See who liked you"
            className="relative flex size-10 items-center justify-center rounded-full bg-white/5 text-rose-400 transition-colors hover:bg-white/10 cursor-pointer"
          >
            <Heart className="size-5 fill-rose-500/30" />
            {likesYouCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                {likesYouCount > 9 ? "9+" : likesYouCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            aria-label="Discovery preferences"
            className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <SlidersHorizontal className="size-4.5" />
          </button>
        </div>
      </header>

      {/* ─── Deck Area ─── */}
      <main className="flex min-h-0 flex-1 flex-col pb-[max(env(safe-area-inset-bottom),1rem)]">
        {genderGateRequired ? (
          <div className="m-auto w-full max-w-sm space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Heart className="size-7 fill-rose-500/25" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">One thing before you swipe</h2>
              <p className="text-xs leading-relaxed text-white/50">
                Matching works on identity and preferences. Set your gender to unlock the deck —
                you&apos;ll see the opposite gender by default and can change it anytime in filters.
              </p>
            </div>
            <form onSubmit={handleSaveGenderGate} className="space-y-4 pt-1">
              <div className="grid grid-cols-3 gap-2">
                {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGenderGate(g)}
                    className={`cursor-pointer rounded-2xl border py-2.5 text-xs font-bold transition-all ${
                      selectedGenderGate === g
                        ? "border-rose-500/60 bg-rose-500/15 text-rose-400"
                        : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    {g === "MALE" ? "👨 Male" : g === "FEMALE" ? "👩 Female" : "✨ Other"}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={isSavingGender}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:opacity-95 disabled:opacity-50"
              >
                {isSavingGender ? "Saving..." : "Start Swiping ❤️"}
              </button>
            </form>
          </div>
        ) : isLoading && candidates.length === 0 ? (
          <div className="m-auto flex flex-col items-center gap-3 text-white/50">
            <Loader2 className="size-8 animate-spin text-rose-500" />
            <p className="text-xs font-bold">Finding your best matches...</p>
          </div>
        ) : remaining.length > 0 ? (
          <>
            <div className="relative min-h-0 flex-1 py-1">
              <SwipeDeck candidates={remaining} onSwipe={handleSwipe} />
            </div>
            <div className="space-y-2 pt-4">
              <SwipeActions
                onPass={() => handleSwipe("pass")}
                onLike={() => handleSwipe("like")}
                onUndo={() => void handleUndo()}
                canUndo={!!lastSwipedId}
              />
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-white/25">
                Drag the card · ← pass · → like · U undo
              </p>
            </div>
          </>
        ) : (
          <div className="m-auto w-full max-w-sm space-y-4 rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Heart className="size-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">That&apos;s everyone for now!</h3>
              <p className="mx-auto max-w-[260px] text-xs leading-relaxed text-white/50">
                You&apos;ve seen every student matching your current filters. Widen the net or give
                passed profiles a second chance.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              {filters.scope === "CAMPUS" && (
                <button
                  type="button"
                  onClick={() => updateFilters({ scope: "GLOBAL" })}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-95"
                >
                  <Globe className="size-3.5" /> Search all of India
                </button>
              )}
              {filters.gender !== "ALL" && (
                <button
                  type="button"
                  onClick={() => updateFilters({ gender: "ALL" })}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10"
                >
                  Show everyone
                </button>
              )}
              <button
                type="button"
                onClick={handleResetSwipes}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white/40 transition-colors hover:text-white"
              >
                <RotateCcw className="size-3.5" /> Reset my swipes
              </button>
              <Link
                href="/app/profile/edit"
                className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-semibold text-white/40 transition-colors hover:text-white"
              >
                <Camera className="size-3.5" /> Improve my photos while I wait
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ─── Sheets & Modals ─── */}
      <DatingFiltersSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        recommendedGender={recommendedGender}
        onChange={updateFilters}
        onResetSwipes={handleResetSwipes}
      />

      <LikesPanel
        open={showLikes}
        onOpenChange={setShowLikes}
        admirers={likesData?.likes ?? []}
        isLoading={likesLoading}
        onLikeBack={handleLikeBack}
        onPass={handlePassAdmirer}
      />

      <DatingMatchModal matchResult={matchResult} onClose={() => setMatchResult(null)} />
    </div>
  );
}
