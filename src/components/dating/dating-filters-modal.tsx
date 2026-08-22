"use client";

import { X, Filter, RotateCcw, Sparkles, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatingFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  gender: string;
  collegeScope: string;
  sort: string;
  onUpdateFilters: (updates: { gender?: string; scope?: string; sort?: string }) => void;
  onResetSwipes: () => void;
}

export function DatingFiltersModal({
  isOpen,
  onClose,
  gender,
  collegeScope,
  sort,
  onUpdateFilters,
  onResetSwipes,
}: DatingFiltersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-rose-500" />
            <h3 className="text-sm font-bold text-foreground">Discovery Preferences</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Sorting Engine Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Candidates By</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "COMPATIBILITY", label: "Vibe Match", icon: Sparkles },
              { id: "RECENT", label: "Newest", icon: Clock },
              { id: "POPULAR", label: "Top Clout", icon: Flame },
            ].map((s) => {
              const Icon = s.icon;
              const isSelected = sort === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onUpdateFilters({ sort: s.id })}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-500 shadow-xs"
                      : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" /> {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gender Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Show Me</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "ALL", label: "Everyone" },
              { id: "MALE", label: "Guys" },
              { id: "FEMALE", label: "Girls" },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onUpdateFilters({ gender: g.id })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  gender === g.id
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Campus Scope Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Campus Scope</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "GLOBAL", label: "Global (All India)" },
              { id: "CAMPUS", label: "My Campus Only" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdateFilters({ scope: s.id })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  collegeScope === s.id
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions: Apply & Reset Swipes */}
        <div className="pt-2 space-y-2">
          <Button
            type="button"
            onClick={onClose}
            className="w-full text-xs font-bold h-10 rounded-xl bg-primary text-primary-foreground cursor-pointer shadow-md shadow-primary/20"
          >
            Apply Filters
          </Button>

          <button
            type="button"
            onClick={onResetSwipes}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" /> Reset All My Swipes
          </button>
        </div>
      </div>
    </div>
  );
}
