"use client";

import { DatingMatchModal } from "@/components/dating/dating-match-modal";
import { SecretCrushModal } from "@/components/dating/secret-crush-modal";
import { SwipeActions,SwipeDeck,type Candidate } from "@/components/dating/swipe-deck";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { ArrowLeft,Camera,Globe,Heart,Loader2,Lock,RotateCcw,SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { useCallback,useEffect,useMemo,useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type MatchResult = {
  matched: boolean;
  conversationId?: string;
  matchedUser?: { displayName: string; avatarUrl: string | null };
};

type ProfilesResponse = {
  candidates: Candidate[];
  meta: { showingGender: "MALE" | "FEMALE" | "ALL"; likesYouCount: number };
};

export function DatingAppClient() {
  const { profile, mutate: mutateProfile } = useProfile();

  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const [lastSwipedId, setLastSwipedId] = useState<string | null>(null);
  const [showSecretCrushModal, setShowSecretCrushModal] = useState(false);

  const [selectedGenderGate, setSelectedGenderGate] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [isSavingGender, setIsSavingGender] = useState(false);

  // Saved DB preferences drive the deck server-side — no params needed.
  const { data, error, isLoading, mutate } = useSWR<ProfilesResponse>(
    "/api/dating/profiles",
    fetcher,
    {
      revalidateIfStale: true,
      keepPreviousData: true,
      dedupingInterval: 15000,
    }
  );


  const candidates = useMemo(() => data?.candidates ?? [], [data]);
  const remaining = useMemo(() => candidates.slice(deckIndex), [candidates, deckIndex]);
  const likesYouCount = data?.meta?.likesYouCount ?? 0;

  const hasGenderSet = profile?.gender && ["MALE", "FEMALE", "OTHER"].includes(profile.gender);
  const genderGateRequired =
    (profile && !hasGenderSet) || (error as { error?: string } | undefined)?.error === "GENDER_REQUIRED";

  const sendSwipe = useCallback(async (targetId: string, direction: "LIKE" | "PASS") => {
    // Advance the deck immediately — waiting on the round trip made every
    // swipe feel like it stuck. Rolled back below if the request fails.
    setLastSwipedId(targetId);
    setDeckIndex((prev) => prev + 1);

    try {
      const res = await fetch("/api/dating/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, direction }),
      });
      if (!res.ok) throw new Error("Swipe failed");
      const result = (await res.json()) as MatchResult;

      if (result.matched) {
        setMatchResult(result);
      }
      return result;
    } catch {
      setDeckIndex((prev) => Math.max(prev - 1, 0));
      setLastSwipedId(null);
      toast.error("Swipe failed — please try again.");
    }
    return null;
  }, []);

  // Preload upcoming card photos into browser memory for zero-lag mobile swiping
  useEffect(() => {
    if (!candidates || candidates.length === 0) return;
    const nextBatch = candidates.slice(deckIndex, deckIndex + 5);
    for (const c of nextBatch) {
      for (const photo of c.photos || []) {
        if (typeof window !== "undefined" && photo) {
          const img = new Image();
          img.src = photo;
        }
      }
    }
  }, [candidates, deckIndex]);

  const handleSwipe = useCallback(
    (direction: "like" | "pass") => {
      const current = remaining[0];
      if (!current) return;

      if (candidates.length - (deckIndex + 1) <= 3) {
        void mutate();
      }
      void sendSwipe(current.id, direction === "like" ? "LIKE" : "PASS");
    },
    [remaining, candidates.length, deckIndex, sendSwipe, mutate]
  );

  const handleUndo = useCallback(async () => {
    if (!lastSwipedId) return;
    try {
      const res = await fetch(`/api/dating/swipe?targetId=${encodeURIComponent(lastSwipedId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Rewind failed");
      setDeckIndex((i) => Math.max(0, i - 1));
      setLastSwipedId(null);
      toast.success("Rewound last profile");
    } catch {
      toast.error("Couldn't undo");
    }
  }, [lastSwipedId]);

  // ← pass · → like · U undo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (matchResult) return;
      if (e.key === "ArrowLeft") handleSwipe("pass");
      else if (e.key === "ArrowRight") handleSwipe("like");
      else if (e.key.toLowerCase() === "u") void handleUndo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSwipe, handleUndo, matchResult]);

  async function widenSearch(updates: { gender?: string; scope?: string }) {
    await fetch("/api/dating/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setDeckIndex(0);
    setLastSwipedId(null);
    void mutate();
  }

  async function handleResetSwipes() {
    const res = await fetch("/api/dating/swipe", { method: "DELETE" });
    if (res.ok) {
      setDeckIndex(0);
      setLastSwipedId(null);
      void mutate();
    }
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
      if (!res.ok) throw new Error("Failed to save");
      await mutateProfile();
      void mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
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

        <div className="flex items-center gap-1.5">
          <h1 className="bg-linear-to-r from-rose-400 to-pink-500 bg-clip-text text-lg font-black tracking-tight text-transparent">
            Campus Match
          </h1>
          <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full">
            18+
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Secret Crush Vault Link */}
          <Link
            href="/app/crush"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/90 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs border border-white/10"
            title="Manage Secret Crush Vault"
          >
            <Lock className="size-3.5 text-rose-400" />
            <span className="hidden sm:inline">Crush Vault</span>
          </Link>


          <Link
            href="/app/dating/likes"
            aria-label="Likes you"
            className="relative flex size-10 items-center justify-center rounded-full bg-white/5 text-rose-400 transition-colors hover:bg-white/10"
          >
            <Heart className="size-5 fill-rose-500/30" />
            {likesYouCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                {likesYouCount > 9 ? "9+" : likesYouCount}
              </span>
            )}
          </Link>
          <Link
            href="/app/dating/filters"
            aria-label="Preferences"
            className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <SlidersHorizontal className="size-4.5" />
          </Link>
        </div>
      </header>

      {/* Secret Crush Modal */}
      <SecretCrushModal
        isOpen={showSecretCrushModal}
        onClose={() => setShowSecretCrushModal(false)}
      />

      {/* ─── Deck ─── */}
      <main className="flex min-h-0 flex-1 flex-col pb-[max(env(safe-area-inset-bottom),1rem)]">
        {genderGateRequired ? (
          <div className="m-auto w-full max-w-sm space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Heart className="size-7 fill-rose-500/25" />
            </div>
            <h2 className="text-lg font-black text-white">Select your gender</h2>
            <form onSubmit={handleSaveGenderGate} className="space-y-4">
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
                    {g === "MALE" ? "👨 Male" : g === "FEMALE" ? "👩 Female" : "🌈 Other"}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={isSavingGender}
                className="w-full cursor-pointer rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:opacity-95 disabled:opacity-50"
              >
                {isSavingGender ? "Saving..." : "Start swiping"}
              </button>
            </form>
          </div>
        ) : isLoading && candidates.length === 0 ? (
          <div className="m-auto">
            <Loader2 className="size-8 animate-spin text-rose-500" />
          </div>
        ) : remaining.length > 0 ? (
          <>
            <div className="relative min-h-0 flex-1 py-1">
              <SwipeDeck candidates={remaining} onSwipe={handleSwipe} />
            </div>
            <div className="pt-4">
              <SwipeActions
                onPass={() => handleSwipe("pass")}
                onLike={() => handleSwipe("like")}
                onUndo={() => void handleUndo()}
                canUndo={!!lastSwipedId}
              />
            </div>
          </>
        ) : (
          <div className="m-auto w-full max-w-sm space-y-4 rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Heart className="size-7" />
            </div>
            <h3 className="text-base font-bold text-white">That&apos;s everyone for now</h3>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => widenSearch({ scope: "GLOBAL", gender: "ALL" })}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-95"
              >
                <Globe className="size-3.5" /> Widen my search
              </button>
              <button
                type="button"
                onClick={handleResetSwipes}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white/40 transition-colors hover:text-white"
              >
                <RotateCcw className="size-3.5" /> Reset swipes
              </button>
              <Link
                href="/app/profile/edit"
                className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-semibold text-white/40 transition-colors hover:text-white"
              >
                <Camera className="size-3.5" /> Improve my profile
              </Link>
            </div>
          </div>
        )}
      </main>

      <DatingMatchModal matchResult={matchResult} onClose={() => setMatchResult(null)} />
    </div>
  );
}
