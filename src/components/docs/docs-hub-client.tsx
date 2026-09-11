"use client";

import { ArrowRight, Clock, Flame, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DocsFeatureIcon } from "@/components/docs/docs-feature-icon";
import { DOCS_CATEGORIES, type DocsCategory, type DocsFeature } from "@/lib/docs-features";
import { cn } from "@/lib/utils";

const FILTERS: ("All" | DocsCategory)[] = ["All", ...DOCS_CATEGORIES];

export function DocsHubClient({ features }: { features: DocsFeature[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return features.filter((f) => {
      if (filter !== "All" && f.category !== filter) return false;
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        f.tagline.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [features, query, filter]);

  // Featured essay (first or matching)
  const featured = features[1]; // Anonymous Confessions or Campus Feed

  return (
    <div className="space-y-10">
      {/* Search & Filter Bar (Twitter/Grok Minimalist Layout) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search technical documentation</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search engineering docs — try “anonymous”, “cryptographic”, or “escrow”..."
            className="h-11 w-full rounded-xl border border-border/60 bg-card pr-4 pl-10 text-xs sm:text-sm font-medium outline-none placeholder:text-muted-foreground focus:border-[#1D9BF0] transition-colors"
          />
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {FILTERS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer",
                filter === c
                  ? "bg-foreground text-background shadow-xs"
                  : "border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Viral Essay Banner (if not filtering heavily) */}
      {!query && filter === "All" && featured && (
        <Link
          href={`/docs/${featured.slug}`}
          className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card p-6 sm:p-8 transition-all hover:border-[#1D9BF0]/60 hover:shadow-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1D9BF0]/30 bg-[#1D9BF0]/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#1D9BF0]">
              <Flame className="size-3.5 text-[#1D9BF0]" />
              <span>{"FEATURED_ESSAY // HIGH_IMPACT"}</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>{featured.readTime}</span>
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground group-hover:text-[#1D9BF0] transition-colors">
              {featured.title}: {featured.tagline}
            </h2>
            <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted-foreground font-normal">
              {featured.hook.split("\n\n")[0]}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
            <span className="font-mono text-xs font-bold text-[#1D9BF0] flex items-center gap-1">
              <span>Read the engineering breakdown</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="font-mono text-[11px] text-muted-foreground uppercase">
              CampusLoop Architecture Team
            </span>
          </div>
        </Link>
      )}

      {/* Grid of Essay Cards */}
      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center space-y-2">
          <p className="font-mono text-sm font-bold text-foreground">No documentation found for “{query}”.</p>
          <p className="text-xs text-muted-foreground">
            Try searching for keywords like feed, polls, or verification.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((f) => (
            <Link
              key={f.slug}
              href={`/docs/${f.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-border/40 bg-card p-5 sm:p-6 transition-all hover:border-[#1D9BF0]/50 hover:bg-muted/10 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[#1D9BF0]/10 text-[#1D9BF0]">
                      <DocsFeatureIcon slug={f.slug} />
                    </span>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase">
                      {f.category}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>{f.readTime}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-[#1D9BF0] transition-colors leading-snug">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed font-normal">
                    {f.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#1D9BF0]">
                  <span>Read essay</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {f.proofPoints.length} Invariants
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
