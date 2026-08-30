"use client";

import {
FEED_CATEGORY_OPTIONS as CATEGORY_OPTIONS,
FEED_SORT_TABS as SORT_TABS,
FEED_VISIBILITY_OPTIONS as VISIBILITY_OPTIONS,
} from "@/constants";
import { cn } from "@/lib/utils";
import { Flame, Globe, ListFilter, RotateCw, School } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


interface FeedHeaderProps {
  scope: "CAMPUS" | "GLOBAL";
  onScopeChange: (scope: "CAMPUS" | "GLOBAL") => void;
  sort: string;
  onSortChange: (sort: string) => void;
  type: string;
  onTypeChange: (type: string) => void;
  visibility: string;
  onVisibilityChange: (visibility: string) => void;
  institutionSlug?: string | null;
  onRefresh?: () => Promise<unknown> | void;
  isRefreshing?: boolean;
}


export function FeedHeader({
  scope,
  onScopeChange,
  sort,
  onSortChange,
  type,
  onTypeChange,
  visibility,
  onVisibilityChange,
  institutionSlug,
  onRefresh,
  isRefreshing,
}: FeedHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount =
    (scope !== "GLOBAL" ? 1 : 0) +
    (type !== "ALL" ? 1 : 0) +
    (sort !== "for_you" ? 1 : 0) +
    (visibility !== "all" ? 1 : 0);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-4 flex flex-col gap-3">
      {/* Top Bar Header (Inspired by Reference 2 Explore header) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-black tracking-tight text-foreground">
            Campus <span className="text-primary">Loop</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer active:scale-95"
              title="Refresh feed"
              aria-label="Refresh feed"
            >
              <RotateCw className={cn("size-3.5 transition-transform", isRefreshing && "animate-spin text-primary")} />
            </button>
          )}

          {/* Scope selection pill */}
          <div className="flex rounded-full bg-muted/50 p-1 text-[11px] font-bold">
            <button
              onClick={() => onScopeChange("CAMPUS")}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer",
                scope === "CAMPUS" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <School className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{institutionSlug ? `${institutionSlug.charAt(0).toUpperCase() + institutionSlug.slice(1)}` : "Campus"}</span>
            </button>
            <button
              onClick={() => onScopeChange("GLOBAL")}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer",
                scope === "GLOBAL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="h-3 w-3" />
              Global
            </button>
          </div>
        </div>
      </div>


      {/* Twitter/X Style Segmented Sort Tabs */}
      <div className="flex items-center justify-between border-t border-border/25 pt-1 -mb-4 -mx-4 px-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1">
          {SORT_TABS.map((s) => {
            const isCurrent = sort === s.id;
            return (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onSortChange(s.id)}
                  className={cn(
                    "relative px-4 py-3 font-bold transition-colors cursor-pointer shrink-0 text-[14px]",
                    isCurrent
                      ? "text-foreground font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg"
                  )}
                >
                  <span>{s.label}</span>
                  {isCurrent && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-primary" />
                  )}
                </button>

                {/* Confessions Quick Tab Link immediately after For You */}
                {s.id === "for_you" && (
                  <Link
                    href="/app/confessions"
                    className="relative px-3.5 py-3 font-bold transition-colors cursor-pointer shrink-0 text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg flex items-center gap-1.5 group"
                  >
                    <span className="group-hover:text-foreground">Confessions</span>
                    <Flame className="size-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Filter button */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer mr-2",
            showFilters || activeFiltersCount > 1
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          aria-label="Filter feed"
          title="Filter feed"
        >
          <ListFilter className="size-4" />
        </button>
      </div>


      {/* Advanced Filters Dropdown */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out border-t border-transparent bg-muted/10 rounded-2xl",
          showFilters ? "max-h-[160px] border-border/30 pb-3.5 pt-3 px-3.5 mt-2" : "max-h-0 pb-0 pt-0"
        )}
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Identity filter */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Show Posts By</span>
            <div className="flex rounded-lg bg-muted/65 p-0.5 border border-border/40 text-[9px] font-bold">
              {VISIBILITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onVisibilityChange(option.id)}
                  className={cn(
                    "flex-1 py-1 rounded-md transition-all cursor-pointer",
                    visibility === option.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Category</span>
            <div className="flex rounded-lg bg-muted/65 p-0.5 border border-border/40 text-[9px] font-bold">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onTypeChange(option.id)}
                  className={cn(
                    "flex-1 py-1 rounded-md transition-all cursor-pointer",
                    type === option.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-3 text-[10px] font-bold">
          <button
            onClick={() => {
              onScopeChange("GLOBAL");
              onTypeChange("ALL");
              onSortChange("for_you");
              onVisibilityChange("all");
            }}
            className="text-primary hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </header>
  );
}
