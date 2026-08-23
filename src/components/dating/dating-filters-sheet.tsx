"use client";

import { Drawer } from "vaul";
import { Sparkles, Clock, Flame, RotateCcw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatingFilters {
  gender: "DEFAULT" | "MALE" | "FEMALE" | "ALL";
  scope: "GLOBAL" | "CAMPUS";
  sort: "COMPATIBILITY" | "RECENT" | "POPULAR";
}

interface DatingFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: DatingFilters;
  /** e.g. "FEMALE" — what DEFAULT currently resolves to for this user */
  recommendedGender: "MALE" | "FEMALE" | "ALL";
  onChange: (updates: Partial<DatingFilters>) => void;
  onResetSwipes: () => void;
}

function OptionPill({
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
        "flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-bold transition-all cursor-pointer active:scale-95",
        selected
          ? "border-rose-500/60 bg-rose-500/15 text-rose-400 shadow-xs"
          : "border-white/10 bg-white/5 text-white/60 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

export function DatingFiltersSheet({
  open,
  onOpenChange,
  filters,
  recommendedGender,
  onChange,
  onResetSwipes,
}: DatingFiltersSheetProps) {
  const recommendedLabel =
    recommendedGender === "FEMALE" ? "Girls" : recommendedGender === "MALE" ? "Guys" : "Everyone";

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border-t border-white/10 bg-neutral-950 p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] outline-none">
          <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-white/20" />

          <Drawer.Title className="text-base font-black text-white">Discovery Preferences</Drawer.Title>
          <p className="mt-0.5 text-xs font-medium text-white/50">
            Tune who shows up in your deck. Changes apply instantly.
          </p>

          <div className="mt-5 space-y-5">
            {/* Show me */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Show me</p>
              <div className="grid grid-cols-2 gap-2">
                <OptionPill
                  selected={filters.gender === "DEFAULT"}
                  onClick={() => onChange({ gender: "DEFAULT" })}
                >
                  <Wand2 className="size-3.5" /> Recommended · {recommendedLabel}
                </OptionPill>
                <OptionPill selected={filters.gender === "ALL"} onClick={() => onChange({ gender: "ALL" })}>
                  Everyone
                </OptionPill>
                <OptionPill selected={filters.gender === "FEMALE"} onClick={() => onChange({ gender: "FEMALE" })}>
                  👩 Girls
                </OptionPill>
                <OptionPill selected={filters.gender === "MALE"} onClick={() => onChange({ gender: "MALE" })}>
                  👨 Guys
                </OptionPill>
              </div>
            </div>

            {/* Scope */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Campus scope</p>
              <div className="grid grid-cols-2 gap-2">
                <OptionPill selected={filters.scope === "GLOBAL"} onClick={() => onChange({ scope: "GLOBAL" })}>
                  🌏 All India
                </OptionPill>
                <OptionPill selected={filters.scope === "CAMPUS"} onClick={() => onChange({ scope: "CAMPUS" })}>
                  🏫 My campus only
                </OptionPill>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Rank deck by</p>
              <div className="grid grid-cols-3 gap-2">
                <OptionPill
                  selected={filters.sort === "COMPATIBILITY"}
                  onClick={() => onChange({ sort: "COMPATIBILITY" })}
                >
                  <Sparkles className="size-3.5" /> Best match
                </OptionPill>
                <OptionPill selected={filters.sort === "RECENT"} onClick={() => onChange({ sort: "RECENT" })}>
                  <Clock className="size-3.5" /> Newest
                </OptionPill>
                <OptionPill selected={filters.sort === "POPULAR"} onClick={() => onChange({ sort: "POPULAR" })}>
                  <Flame className="size-3.5" /> Top clout
                </OptionPill>
              </div>
            </div>

            <button
              type="button"
              onClick={onResetSwipes}
              className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white/40 transition-colors hover:text-rose-400 cursor-pointer"
            >
              <RotateCcw className="size-3.5" /> Reset all my swipes
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
