"use client";

import { Loader2, Pin, Search, Zap, Trash2, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchResults {
  posts: Array<{ id: string; label: string; type: string; isAnonymous: boolean; votes: number }>;
  profiles: Array<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    points: number;
  }>;
}

type BoostMode = "NUDGE" | "PROMOTE" | "PIN" | "BURY";

interface BoostRow {
  id: string;
  targetType: "POST" | "PROFILE";
  targetId: string;
  multiplier: number;
  mode: BoostMode;
  scope: "GLOBAL" | "INSTITUTION";
  expiresAt: string | null;
  reason: string | null;
  createdAt: string;
  target: { kind: "POST" | "PROFILE"; label: string; username?: string } | null;
}

type Selection = { kind: "POST"; id: string; label: string } | { kind: "PROFILE"; id: string; label: string };

/**
 * Four honest modes.
 *
 * These are tiers, not just multipliers, because a multiplier alone cannot
 * promote: ranking scores span four orders of magnitude, so scaling a decayed
 * score leaves an old post exactly where it was. Only NUDGE is purely
 * multiplicative, and its description says so.
 */
const MODES: Array<{ mode: BoostMode; label: string; multiplier: number; hint: string }> = [
  { mode: "NUDGE", label: "Nudge", multiplier: 1.6, hint: "Weights the score. Blends in — may not surface." },
  { mode: "PROMOTE", label: "Promote", multiplier: 3, hint: "Ranks above every organic post." },
  { mode: "PIN", label: "Make it viral", multiplier: 8, hint: "Top of the feed, above promoted posts." },
  { mode: "BURY", label: "Bury", multiplier: 0.3, hint: "Sinks below everything, without deleting it." },
];

const DURATIONS = [
  { label: "6 hours", hours: 6 },
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "Indefinite", hours: 0 },
];

export function FeedBoostsClient() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mode, setMode] = useState<BoostMode>("PROMOTE");
  const [multiplier, setMultiplier] = useState(3);
  const [durationHours, setDurationHours] = useState(24);
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading: isSearching } = useSWR<SearchResults>(
    debounced.length >= 2 ? `/api/admin/feed-boosts/search?q=${encodeURIComponent(debounced)}` : null,
    fetcher
  );

  const { data: boostData, mutate } = useSWR<{ boosts: BoostRow[] }>("/api/admin/feed-boosts", fetcher, {
    refreshInterval: 30_000,
  });
  const boosts = boostData?.boosts ?? [];

  async function applyBoost() {
    if (!selection) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/feed-boosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: selection.kind,
          targetId: selection.id,
          mode,
          multiplier,
          durationHours,
          reason: reason.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not apply boost");

      const modeLabel = MODES.find((m) => m.mode === mode)?.label ?? mode;
      toast.success(
        `${selection.kind === "POST" ? "Post" : "@" + selection.label} — ${modeLabel} applied, live within a minute`
      );
      setSelection(null);
      setReason("");
      setQuery("");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not apply boost");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeBoost(id: string) {
    try {
      const res = await fetch(`/api/admin/feed-boosts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Boost lifted");
      mutate();
    } catch {
      toast.error("Could not lift that boost");
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" /> Feed Curation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Put a thumb on the ranking scale. A <span className="font-semibold text-foreground">boost</span>{" "}
          multiplies a post&rsquo;s score across For You, Trending, Viral, Spicy, Top and Discussed — it
          leaves <span className="font-semibold text-foreground">Latest</span> chronological and{" "}
          <span className="font-semibold text-foreground">Random</span> random. A{" "}
          <span className="font-semibold text-foreground">pin</span> goes further: it sits first everywhere
          except Random, Latest included. Changes go live within a minute.
        </p>
      </header>

      {/* ── Pick a target ── */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a post phrase, a student name, @username, or paste an id"
            className="w-full h-11 rounded-xl border border-border bg-muted/30 pl-10 pr-4 text-sm text-foreground outline-none focus:border-foreground"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {selection ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-primary">
                {selection.kind === "POST" ? "Post" : "Student"}
              </p>
              <p className="text-sm font-bold text-foreground truncate">{selection.label}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelection(null)}
              className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          results && (
            <div className="space-y-3">
              {results.profiles.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Students</p>
                  {results.profiles.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelection({ kind: "PROFILE", id: person.id, label: person.username })}
                      className="w-full flex items-center gap-3 rounded-xl border border-border/60 p-2.5 text-left hover:border-border hover:bg-muted/40 cursor-pointer"
                    >
                      <User className="size-4 text-muted-foreground shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-foreground truncate">
                          {person.displayName}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          @{person.username} · {person.points} LP
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.posts.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Posts</p>
                  {results.posts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => setSelection({ kind: "POST", id: post.id, label: post.label })}
                      className="w-full flex items-center gap-3 rounded-xl border border-border/60 p-2.5 text-left hover:border-border hover:bg-muted/40 cursor-pointer"
                    >
                      <Zap className="size-4 text-muted-foreground shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-foreground truncate">{post.label}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {post.type} · {post.votes} votes
                          {post.isAnonymous && " · anonymous"}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.posts.length === 0 && results.profiles.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">Nothing matched that.</p>
              )}
            </div>
          )
        )}
      </section>

      {/* ── Configure and apply ── */}
      {selection && (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <div>
            <p className="text-xs font-bold text-foreground mb-2">How hard</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODES.map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => {
                    setMode(option.mode);
                    setMultiplier(option.multiplier);
                  }}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all cursor-pointer",
                    mode === option.mode
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border/60 hover:border-border"
                  )}
                >
                  <span className="block text-xs font-black text-foreground">{option.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{option.hint}</span>
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Weight</span>
              <input
                type="number"
                min={0.01}
                max={25}
                step={0.1}
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
                className="h-9 w-24 rounded-lg border border-border bg-muted/30 px-2 text-xs font-mono text-foreground outline-none focus:border-foreground"
              />
              <span>× — orders posts within the same mode. Capped at 25.</span>
            </label>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground mb-2">Duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.label}
                  type="button"
                  onClick={() => setDurationHours(duration.hours)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                    durationHours === duration.hours
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why? (recorded against your admin account)"
            className="w-full h-10 rounded-xl border border-border bg-muted/30 px-3.5 text-xs text-foreground outline-none focus:border-foreground"
          />

          <button
            type="button"
            onClick={applyBoost}
            disabled={isSaving}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-black hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <TrendingUp className="size-4" />}
            Apply boost
          </button>
        </section>
      )}

      {/* ── Live boosts ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-black text-foreground">
          Live boosts {boosts.length > 0 && <span className="text-muted-foreground">({boosts.length})</span>}
        </h2>

        {boosts.length === 0 ? (
          <p className="text-xs text-muted-foreground rounded-xl border border-dashed border-border p-6 text-center">
            Nothing is boosted. The feed is running purely on its own ranking.
          </p>
        ) : (
          <div className="space-y-2">
            {boosts.map((boost) => (
              <div
                key={boost.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    boost.mode === "BURY" ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                  )}
                >
                  {boost.mode === "PIN" ? <Pin className="size-3.5" /> : <TrendingUp className="size-3.5" />}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    {boost.target?.label ?? (
                      <span className="text-muted-foreground italic">target deleted</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {boost.targetType === "PROFILE" ? "every post by this student" : "single post"} ·{" "}
                    {boost.mode.toLowerCase()} · {boost.multiplier}× ·{" "}
                    {boost.expiresAt ? `until ${new Date(boost.expiresAt).toLocaleString()}` : "indefinite"}
                    {boost.reason && ` · ${boost.reason}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeBoost(boost.id)}
                  className="size-8 shrink-0 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex items-center justify-center cursor-pointer"
                  title="Lift this boost"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
