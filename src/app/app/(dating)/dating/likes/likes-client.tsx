"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Heart, X, School, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/api";
import { getAvatarUrl } from "@/lib/utils";
import { DatingMatchModal } from "@/components/dating/dating-match-modal";

type Admirer = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  photo: string | null;
  year: number | null;
  institutionName: string | null;
};

type MatchResult = {
  matched: boolean;
  conversationId?: string;
  matchedUser?: { displayName: string; avatarUrl: string | null };
};

export function LikesClient() {
  const { data, isLoading, mutate } = useSWR<{ likes: Admirer[] }>("/api/dating/likes", fetcher);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const likes = data?.likes ?? [];

  async function swipe(admirer: Admirer, direction: "LIKE" | "PASS") {
    // Optimistically remove the card
    void mutate({ likes: likes.filter((l) => l.id !== admirer.id) }, { revalidate: false });
    try {
      const res = await fetch("/api/dating/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: admirer.id, direction }),
      });
      if (res.ok && direction === "LIKE") {
        const result = (await res.json()) as MatchResult;
        if (result.matched) setMatchResult(result);
      }
    } catch {
      toast.error("Something went wrong");
    }
    void mutate();
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 select-none">
      <header className="flex items-center gap-3 py-3">
        <Link
          href="/app/dating"
          aria-label="Back"
          className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="flex items-center gap-2 text-lg font-black tracking-tight">
          <Heart className="size-4 fill-rose-500 text-rose-500" />
          Likes you {likes.length > 0 && <span className="text-rose-400">· {likes.length}</span>}
        </h1>
      </header>

      <main className="flex-1 pb-10 pt-1">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-rose-500" />
          </div>
        ) : likes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <Heart className="size-8 text-white/15" />
            <p className="text-sm font-bold text-white/60">No likes yet</p>
            <Link href="/app/profile/edit" className="text-xs font-semibold text-rose-400 hover:underline">
              Add photos to stand out
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {likes.map((admirer) => (
              <div
                key={admirer.id}
                className="relative overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={admirer.photo ?? getAvatarUrl(admirer.avatarUrl, admirer.username)}
                  alt={admirer.displayName}
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3">
                  <div>
                    <p className="truncate text-sm font-black text-white">
                      {admirer.displayName}
                      {admirer.year ? ` · Yr ${admirer.year}` : ""}
                    </p>
                    {admirer.institutionName && (
                      <p className="flex items-center gap-1 truncate text-[10px] font-semibold text-white/70">
                        <School className="size-2.5 shrink-0" /> {admirer.institutionName}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => swipe(admirer, "PASS")}
                      aria-label={`Pass on ${admirer.displayName}`}
                      className="flex h-8 flex-1 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => swipe(admirer, "LIKE")}
                      aria-label={`Like ${admirer.displayName} back`}
                      className="flex h-8 flex-1 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                    >
                      <Heart className="size-4 fill-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <DatingMatchModal matchResult={matchResult} onClose={() => setMatchResult(null)} />
    </div>
  );
}
