"use client";

import { ArrowLeft, Check, Eye, EyeOff, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";

type Prefs = {
  gender: "DEFAULT" | "MALE" | "FEMALE" | "ALL";
  scope: "GLOBAL" | "CAMPUS";
  sort: "COMPATIBILITY" | "RECENT" | "POPULAR";
  isEnabled?: boolean;
};

type PrefsResponse = {
  preferences: Prefs;
  recommendedGender: "MALE" | "FEMALE" | "ALL";
};

function Option({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all cursor-pointer active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/10 text-primary font-black shadow-2xs ring-1 ring-primary/30"
          : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
      )}
    >
      {children}
      {selected && <Check className="size-4 shrink-0" />}
    </button>
  );
}

export function FiltersClient() {
  const { data, isLoading, mutate } = useSWR<PrefsResponse>("/api/dating/preferences", fetcher);
  const [saving, setSaving] = useState(false);

  const prefs = data?.preferences;
  const isEnabled = prefs?.isEnabled !== false;
  const recommended =
    data?.recommendedGender === "FEMALE" ? "Girls" : data?.recommendedGender === "MALE" ? "Guys" : "Everyone";

  async function save(updates: Partial<Prefs>) {
    if (!prefs) return;
    setSaving(true);
    // Optimistic UI, silent persist
    void mutate(data ? { ...data, preferences: { ...prefs, ...updates } } : data, { revalidate: false });
    try {
      const res = await fetch("/api/dating/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      void mutate();
    } catch {
      toast.error("Couldn't save");
      void mutate();
    } finally {
      setSaving(false);
    }
  }

  async function resetSwipes() {
    const res = await fetch("/api/dating/swipe", { method: "DELETE" });
    if (res.ok) toast.success("Deck reset");
    else toast.error("Couldn't reset");
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
        <div>
          <h1 className="text-base font-black tracking-tight text-foreground">Matching Preferences</h1>
          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
            <ShieldCheck className="size-3 text-primary" /> Safe &amp; Mutual Opt-In
          </p>
        </div>
        {saving && <Loader2 className="ml-auto size-4 animate-spin text-muted-foreground" />}
      </header>

      {isLoading || !prefs ? (
        <div className="m-auto py-20">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <main className="space-y-6 pb-10 pt-4">
          {/* Privacy & Opt-in Visibility Section */}
          <section className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Privacy &amp; Deck Visibility
            </p>
            <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    {isEnabled ? (
                      <Eye className="size-4 text-emerald-500 shrink-0" />
                    ) : (
                      <EyeOff className="size-4 text-amber-500 shrink-0" />
                    )}
                    <span>Show profile in Campus Match</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isEnabled
                      ? "Active: Classmates can discover your card in the match deck."
                      : "Paused & Hidden: Your card is 100% hidden from everyone's deck."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => save({ isEnabled: !isEnabled })}
                  className={cn(
                    "w-12 h-6.5 rounded-full transition-colors flex items-center p-1 cursor-pointer shrink-0 border border-border/40",
                    isEnabled ? "bg-primary justify-end" : "bg-muted justify-start"
                  )}
                  aria-label="Toggle profile visibility"
                >
                  <div className="size-4.5 rounded-full bg-white shadow-xs" />
                </button>
              </div>
            </div>
          </section>

          {/* Gender Filter Section */}
          <section className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Show me</p>
            <div className="grid gap-2">
              <Option selected={prefs.gender === "DEFAULT"} onClick={() => save({ gender: "DEFAULT" })}>
                Recommended · {recommended}
              </Option>
              <Option selected={prefs.gender === "FEMALE"} onClick={() => save({ gender: "FEMALE" })}>
                Girls
              </Option>
              <Option selected={prefs.gender === "MALE"} onClick={() => save({ gender: "MALE" })}>
                Guys
              </Option>
              <Option selected={prefs.gender === "ALL"} onClick={() => save({ gender: "ALL" })}>
                Everyone
              </Option>
            </div>
          </section>

          {/* Campus Scope Section */}
          <section className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Where</p>
            <div className="grid grid-cols-2 gap-2">
              <Option selected={prefs.scope === "GLOBAL"} onClick={() => save({ scope: "GLOBAL" })}>
                All Campuses
              </Option>
              <Option selected={prefs.scope === "CAMPUS"} onClick={() => save({ scope: "CAMPUS" })}>
                My Campus
              </Option>
            </div>
          </section>

          {/* Ranking Sort Section */}
          <section className="space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Rank by</p>
            <div className="grid grid-cols-3 gap-2">
              <Option
                selected={prefs.sort === "COMPATIBILITY"}
                onClick={() => save({ sort: "COMPATIBILITY" })}
              >
                Vibe Match
              </Option>
              <Option selected={prefs.sort === "RECENT"} onClick={() => save({ sort: "RECENT" })}>
                New
              </Option>
              <Option selected={prefs.sort === "POPULAR"} onClick={() => save({ sort: "POPULAR" })}>
                Top
              </Option>
            </div>
          </section>

          <button
            type="button"
            onClick={resetSwipes}
            className="flex w-full items-center justify-center gap-1.5 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer rounded-xl hover:bg-muted/40"
          >
            <RotateCcw className="size-3.5" /> Reset my swipes &amp; start over
          </button>
        </main>
      )}
    </div>
  );
}
