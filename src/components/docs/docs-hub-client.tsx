"use client";

import { ArrowRight, Search } from "lucide-react";
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
        f.description.toLowerCase().includes(q)
      );
    });
  }, [features, query, filter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search features</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features — try “anonymous” or “marketplace”"
            className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {FILTERS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                filter === c
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <p className="text-sm font-semibold">No features match “{query}”.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((f) => (
            <Link
              key={f.slug}
              href={`/docs/${f.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <DocsFeatureIcon slug={f.slug} />
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                  {f.category}
                </span>
              </div>
              <h2 className="mt-4 text-base font-bold tracking-tight group-hover:text-primary">{f.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Read the explainer
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
