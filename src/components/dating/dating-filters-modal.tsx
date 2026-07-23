"use client";

import { X, Search, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatingFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  gender: string;
  collegeScope: string;
  targetCollegeId: string;
  onUpdateFilters: (updates: { gender?: string; scope?: string; collegeId?: string }) => void;
  colleges: Array<{ id: string; name: string }>;
  collegeSearchQuery: string;
  setCollegeSearchQuery: (q: string) => void;
  showCollegeDropdown: boolean;
  setShowCollegeDropdown: (show: boolean) => void;
}

export function DatingFiltersModal({
  isOpen,
  onClose,
  gender,
  collegeScope,
  targetCollegeId,
  onUpdateFilters,
  colleges,
  collegeSearchQuery,
  setCollegeSearchQuery,
  showCollegeDropdown,
  setShowCollegeDropdown,
}: DatingFiltersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Discovery Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Gender Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Show Me</label>
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
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  gender === g.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/20 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scope Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Campus Radius</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "GLOBAL", label: "Global (All India)" },
              { id: "CAMPUS", label: "My Campus Only" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdateFilters({ scope: s.id })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  collegeScope === s.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/20 border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={onClose}
          className="w-full text-xs font-semibold h-9 rounded-xl bg-primary text-primary-foreground cursor-pointer shadow-xs mt-2"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
