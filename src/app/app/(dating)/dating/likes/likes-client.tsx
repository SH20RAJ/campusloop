"use client";

import { ArrowLeft, Loader2, School, Zap, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { DatingMatchModal } from "@/components/dating/dating-match-modal";
import { fetcher } from "@/lib/api";
import { getAvatarUrl } from "@/lib/utils";

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
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 bg-background text-foreground select-none">
      <header className="flex items-center gap-3 py-3 border-b border-border/30">
        <Link
          href="/app/matching"
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border border-border/40 cursor-pointer"
        >
          <ArrowLeft className="size-4.5" />
        </Link>
        <h1 className="flex items-center gap-2 text-base font-black tracking-tight text-foreground">
          <Zap className="size-4 text-primary" />
          <span>Likes you</span>
          {likes.length > 0 && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {likes.length}
            </span>
          )}
        </h1>
      </header>

      <main className="flex-1 pb-10 pt-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : likes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Zap className="size-7" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">No matches yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep swiping or upload photos to stand out in your campus deck.
              </p>
            </div>
            <Link
              href="/app/profile/edit"
              className="text-xs font-bold text-primary hover:underline bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
            >
              Add photos &amp; interests
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {likes.map((admirer) => (
              <div
                key={admirer.id}
                className="relative overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/10 shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={admirer.photo ?? getAvatarUrl(admirer.avatarUrl, admirer.username)}
                  alt={admirer.displayName}
                  className="aspect-3/4 w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 space-y-2 p-3">
                  <div>
                    <p className="truncate text-sm font-black text-white">
                      {admirer.displayName}
                      {admirer.year ? ` · Yr ${admirer.year}` : ""}
                    </p>
                    {admirer.institutionName && (
                      <p className="flex items-center gap-1 truncate text-[10px] font-semibold text-white/70">
                        <School className="size-2.5 shrink-0" /> {admirer.institutionName.split(",")[0]}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => swipe(admirer, "PASS")}
                      aria-label={`Pass on ${admirer.displayName}`}
                      className="flex h-8 flex-1 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md transition-all hover:bg-white/25 active:scale-95 cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => swipe(admirer, "LIKE")}
                      aria-label={`Match with ${admirer.displayName}`}
                      className="flex h-8 flex-1 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                    >
                      <Zap className="size-4" />
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
