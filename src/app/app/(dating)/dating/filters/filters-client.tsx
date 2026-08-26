"use client";

import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft,Check,Loader2,RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type Prefs = {
  gender: "DEFAULT" | "MALE" | "FEMALE" | "ALL";
  scope: "GLOBAL" | "CAMPUS";
  sort: "COMPATIBILITY" | "RECENT" | "POPULAR";
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
          ? "border-rose-500/60 bg-rose-500/10 text-rose-400"
          : "border-white/10 bg-white/5 text-white/60 hover:text-white"
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
  const recommended =
    data?.recommendedGender === "FEMALE" ? "Girls" : data?.recommendedGender === "MALE" ? "Guys" : "Everyone";

  async function save(updates: Partial<Prefs>) {
    if (!prefs) return;
    setSaving(true);
    // Optimistic UI, silent persist
    void mutate(
      data ? { ...data, preferences: { ...prefs, ...updates } } : data,
      { revalidate: false }
    );
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
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 select-none">
      <header className="flex items-center gap-3 py-3">
        <Link
          href="/app/dating"
          aria-label="Back"
          className="flex size-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-lg font-black tracking-tight">Preferences</h1>
        {saving && <Loader2 className="ml-auto size-4 animate-spin text-white/40" />}
      </header>

      {isLoading || !prefs ? (
        <div className="m-auto">
          <Loader2 className="size-6 animate-spin text-rose-500" />
        </div>
      ) : (
        <main className="space-y-7 pb-10 pt-2">
          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Show me</p>
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

          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Where</p>
            <div className="grid grid-cols-2 gap-2">
              <Option selected={prefs.scope === "GLOBAL"} onClick={() => save({ scope: "GLOBAL" })}>
                All India
              </Option>
              <Option selected={prefs.scope === "CAMPUS"} onClick={() => save({ scope: "CAMPUS" })}>
                My campus
              </Option>
            </div>
          </section>

          <section className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Rank by</p>
            <div className="grid grid-cols-3 gap-2">
              <Option
                selected={prefs.sort === "COMPATIBILITY"}
                onClick={() => save({ sort: "COMPATIBILITY" })}
              >
                Match
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
            className="flex w-full items-center justify-center gap-1.5 py-3 text-xs font-semibold text-white/35 transition-colors hover:text-rose-400 cursor-pointer"
          >
            <RotateCcw className="size-3.5" /> Reset my swipes
          </button>
        </main>
      )}
    </div>
  );
}
