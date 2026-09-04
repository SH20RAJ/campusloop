"use client";

import {
  ArrowLeft,
  Crown,
  Flame,
  Heart,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface SecretCrushItem {
  id: string;
  targetId: string;
  target: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    branch?: string | null;
    year?: number | null;
  };
  isMutual: boolean;
  matchedAt?: string | null;
  createdAt: string;
}

interface SecretCrushResponse {
  crushes: SecretCrushItem[];
  usedSlots: number;
  maxSlots: number;
  remainingSlots: number;
  receivedCrushesCount: number;
  slotProgress?: {
    isExpanded: boolean;
    maxSlots: number;
    points: number;
    threshold: number;
    pointsNeeded: number;
    progressPercent: number;
  };
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

export function CrushClient() {
  const router = useRouter();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data, mutate, isLoading } = useSWR<SecretCrushResponse>("/api/dating/crush", fetcher);

  const crushes = data?.crushes || [];
  const usedSlots = data?.usedSlots || 0;
  const maxSlots = data?.maxSlots || 5;
  const receivedCrushesCount = data?.receivedCrushesCount || 0;
  const slotProgress = data?.slotProgress;

  // Build dynamic slot array (5 default, or up to 50 when expanded with LP clout)
  const displaySlotCount = maxSlots <= 5 ? maxSlots : Math.min(maxSlots, Math.max(usedSlots + 2, 5));
  const slots = Array.from({ length: displaySlotCount }, (_, i) => crushes[i] || null);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/chat/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const users = (await res.json()) as UserProfile[];
        // Filter out already crushed
        const existingTargetIds = new Set(crushes.map((c) => c.targetId));
        setSearchResults(users.filter((u) => !existingTargetIds.has(u.id)));
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  }

  async function handleAddCrush(targetId: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dating/crush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });

      const resData = (await res.json()) as { error?: string; matched?: boolean };
      if (!res.ok) {
        throw new Error(resData.error || "Failed to add crush");
      }

      if (resData.matched) {
        sounds.match();
        haptics.match();
        toast.success("💘 MUTUAL MATCH! You both secretly liked each other!");
      } else {
        sounds.archive();
        haptics.success();
        toast.success("Locked into your vault! 🔒 Intent is 100% hidden unless mutual.");
      }

      setShowSearchModal(false);
      setSearchQuery("");
      setSearchResults([]);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add crush");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveCrush(crushId: string) {
    sounds.tap();
    haptics.light();
    setRemovingId(crushId);
    try {
      const res = await fetch(`/api/dating/crush?id=${crushId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove");

      toast.success("Crush removed. Slot freed up!");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="min-h-screen pb-24 text-foreground select-none max-w-2xl mx-auto px-4 pt-3 space-y-4">
      {/* ─── Sticky Minimal Top Header ─── */}
      <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-background/85 backdrop-blur-xl border-b border-border/30 px-1 -mx-4 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              <span>Secret Crush Vault</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                Safe &amp; Mutual
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              {usedSlots} of {maxSlots} slots filled
            </p>
          </div>
        </div>

        {usedSlots < maxSlots && (
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="size-3.5 stroke-3" />
            <span>Add Crush</span>
          </button>
        )}
      </div>

      {/* ─── Anonymous Incoming Alert ─── */}
      {receivedCrushesCount > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          <Flame className="size-5 shrink-0 animate-bounce" />
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight">
              {receivedCrushesCount === 1
                ? "1 student on your campus secretly added you!"
                : `${receivedCrushesCount} students on your campus secretly added you!`}
            </p>
            <p className="text-[11px] text-rose-500/80">
              Fill your slots below to discover if the feeling is mutual.
            </p>
          </div>
        </div>
      )}

      {/* ─── Loop Points Clout Expansion Banner ─── */}
      {slotProgress && !slotProgress.isExpanded && (
        <div className="p-4 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-amber-600 dark:text-amber-400 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Zap className="size-4 fill-amber-500" />
              </div>
              <div>
                <h3 className="text-xs font-black text-foreground">Expand Vault from 5 to 50 Slots</h3>
                <p className="text-[11px] text-muted-foreground">
                  {slotProgress.points} / {slotProgress.threshold} LP earned
                </p>
              </div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
              {slotProgress.pointsNeeded} LP to 50 slots
            </span>
          </div>

          <div className="w-full h-2 bg-amber-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${slotProgress.progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Reach <strong>150 Loop Points (LP)</strong> by sharing campus posts, participating in polls, and
            inviting friends to automatically expand your Secret Crush vault to <strong>50 slots</strong>.
          </p>
        </div>
      )}

      {slotProgress?.isExpanded && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400">
          <div className="size-8 rounded-xl bg-violet-500/20 text-violet-500 flex items-center justify-center shrink-0">
            <Crown className="size-4" />
          </div>
          <div>
            <p className="text-xs font-black text-foreground">Vault Expanded to 50 Slots</p>
            <p className="text-[11px] text-violet-600/80 dark:text-violet-400/80">
              Gold Star verified clout unlocked. You have access to the maximum 50 secret crush slots.
            </p>
          </div>
        </div>
      )}

      {/* ─── Vault Slots ─── */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Loading secret crush vault...</span>
          </div>
        ) : (
          slots.map((slot, index) => {
            const slotNumber = index + 1;

            if (!slot) {
              return (
                <div
                  key={`empty-${slotNumber}`}
                  className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 hover:bg-muted/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted/40 text-muted-foreground text-xs font-black">
                      {slotNumber}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Empty Slot</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        Add a verified student you secretly like
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSearchModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/60 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Select</span>
                  </button>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/50 bg-card hover:border-border transition-all shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex size-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 text-xs font-black shrink-0">
                    {slotNumber}
                  </span>

                  <Link
                    href={`/@${slot.target?.username}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <Avatar className="size-10 shrink-0 border border-border/40">
                      <AvatarImage src={slot.target?.avatarUrl || ""} />
                      <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                        {slot.target?.displayName?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                        <span>{slot.target?.displayName}</span>
                        <ShieldCheck className="size-3 text-brand shrink-0" />
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        @{slot.target?.username} {slot.target?.branch ? `• ${slot.target.branch}` : ""}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {slot.isMutual ? (
                    <Link
                      href={`/app/chat?userId=${slot.targetId}`}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95"
                    >
                      <MessageSquare className="size-3" />
                      <span>Chat</span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/40">
                      <Lock className="size-2.5" />
                      <span>Hidden</span>
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={removingId === slot.id}
                    onClick={() => handleRemoveCrush(slot.id)}
                    className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove from vault"
                  >
                    {removingId === slot.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}

        {maxSlots > displaySlotCount && (
          <div className="p-3.5 text-center rounded-2xl border border-dashed border-border/50 bg-muted/10 text-xs font-bold text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="size-3.5" />
            <span>
              +{maxSlots - usedSlots} more slots unlocked in your expanded vault ({usedSlots}/{maxSlots} used)
            </span>
          </div>
        )}
      </div>

      {/* ─── Safety & Anonymity Callout ─── */}
      <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 text-xs text-muted-foreground space-y-1.5">
        <p className="font-bold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-brand" />
          How Secret Crush Works
        </p>
        <p className="text-[11px] leading-relaxed">
          Your selections are <strong>100% intent-hidden</strong>. No classmate can see your list, and no
          notifications reveal your identity until both of you select each other.
        </p>
      </div>

      {/* ─── Search Student Modal ─── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowSearchModal(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/50 bg-card p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <h3 className="text-sm font-black text-foreground">Select a Verified Student</h3>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="size-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search classmate name or @username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-2xl border border-border/60 bg-background text-xs font-semibold placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
                autoFocus
              />
            </div>

            {isSearching ? (
              <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Searching classmates...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-border/20 pr-1">
                {searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 p-2.5 hover:bg-muted/60 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-8.5 shrink-0">
                        <AvatarImage src={u.avatarUrl || ""} />
                        <AvatarFallback className="text-[9px] font-bold">{u.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground truncate">{u.displayName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">@{u.username}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleAddCrush(u.id)}
                      className="px-3.5 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Heart className="size-3 fill-rose-500 text-rose-500" />
                      <span>Lock In</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No students found for &ldquo;{searchQuery}&rdquo;.
              </p>
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Type a classmate&apos;s name or username to add to your vault.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
