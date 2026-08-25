"use client";

import { useState } from "react";
import { Globe, ListFilter, School } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FEED_SORT_TABS as SORT_TABS,
  FEED_VISIBILITY_OPTIONS as VISIBILITY_OPTIONS,
  FEED_CATEGORY_OPTIONS as CATEGORY_OPTIONS,
} from "@/constants";

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

        {/* Scope selection pill */}
        <div className="flex rounded-full bg-muted/60 p-0.5 border border-border/50 text-[11px] font-bold">
          <button
            onClick={() => onScopeChange("CAMPUS")}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer",
              scope === "CAMPUS" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <School className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{institutionSlug ? `${institutionSlug} Hub` : "Campus"}</span>
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

      {/* Underline Category & Sort Tabs (Matching Reference 2 Segmented Tabs) */}
      <div className="flex items-center justify-between gap-3 border-t border-border/30 pt-2 -mb-1 touch-manipulation">
        {/* Sort links */}
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground overflow-x-auto no-scrollbar py-1">
          {SORT_TABS.map((s) => {
            const isCurrent = sort === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSortChange(s.id)}
                className={cn(
                  "relative pb-2 font-bold transition-colors cursor-pointer shrink-0 text-xs",
                  isCurrent ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{s.label}</span>
                {isCurrent && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-foreground" />
                )}
              </button>
            );
          })}
        </div>

        {/* Toggle filter drawer button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[10px] font-bold border transition-all cursor-pointer active:scale-95 mb-2",
            showFilters || activeFiltersCount > 1
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border/60 text-muted-foreground hover:bg-muted/50"
          )}
          aria-label="Filter feed"
        >
          <ListFilter className="h-3 w-3" />
          <span className="hidden sm:inline">Filter</span>
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
