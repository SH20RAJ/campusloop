"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/db/schema";
import {
Crown,
Flame,
Heart,
Loader2,
Lock,
MessageCircle,
Plus,
Search,
ShieldCheck,
Trash2,
X,
Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

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

export interface SecretCrushResponse {
  crushes: SecretCrushItem[];
  usedSlots: number;
  maxSlots: number;
  remainingSlots: number;
  attemptsUsedIn7Days?: number;
  maxAttemptsIn7Days?: number;
  remainingAttemptsIn7Days?: number;
  receivedCrushesCount: number;
  slotProgress?: {
    isExpanded: boolean;
    points: number;
    threshold: number;
    pointsNeeded: number;
    progressPercent: number;
  };
}

interface SecretCrushModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

export function SecretCrushModal({ isOpen, onClose }: SecretCrushModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddSearch, setShowAddSearch] = useState(false);

  const { data, mutate, isLoading } = useSWR<SecretCrushResponse>(
    isOpen ? "/api/dating/crush" : null,
    fetcher
  );

  const crushes = data?.crushes || [];
  const usedSlots = data?.usedSlots || crushes.length;
  const maxSlots = data?.maxSlots || 5;
  const attemptsUsedIn7Days = data?.attemptsUsedIn7Days ?? usedSlots;
  const maxAttemptsIn7Days = data?.maxAttemptsIn7Days ?? 5;
  const receivedCrushesCount = data?.receivedCrushesCount || 0;
  const slotProgress = data?.slotProgress;

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
        setSearchResults(users);
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  }

  async function addSecretCrush(targetId: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dating/crush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });

      const resData = (await res.json()) as { error?: string; matched?: boolean };

      if (!res.ok) {
        throw new Error(resData.error || "Failed to add secret crush");
      }

      if (resData.matched) {
        toast.success("💕 It's a Secret Crush Match! You both secretly liked each other.", {
          duration: 6000,
        });
      } else {
        toast.success("Secret crush locked in! 🔒 Your identity stays 100% hidden unless mutual.");
      }

      mutate();
      setShowAddSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add crush");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeCrush(crushId: string) {
    try {
      const res = await fetch(`/api/dating/crush?id=${crushId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove crush");
      toast.success("Crush removed from vault. Note: Rolling 7-day attempt is not refunded.");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove crush");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-linear-to-tr from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <Heart className="size-5.5 fill-rose-500 stroke-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
                Secret Crush Vault
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Zero Doxxing
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Intent-hidden campus matching • 100% anonymous until mutual
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Anonymous Incoming Banner */}
        {receivedCrushesCount > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 animate-in fade-in">
            <Flame className="size-5 shrink-0 animate-bounce" />
            <p className="text-xs font-bold leading-tight">
              {receivedCrushesCount === 1
                ? "1 student on your campus secretly added you!"
                : `${receivedCrushesCount} students on your campus secretly added you!`}{" "}
              <span className="font-normal text-rose-500/80">Add your crushes below to discover if it&apos;s a match.</span>
            </p>
          </div>
        )}

        {/* Rules & Policy Pill Banner */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center justify-between font-bold text-foreground">
            <span className="flex items-center gap-1 text-rose-500">
              <Lock className="size-3" />
              <span>{usedSlots}/5 Active Slots</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider bg-muted px-2 py-0.5 rounded-md text-foreground">
              {attemptsUsedIn7Days}/5 Attempts this week
            </span>
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground pt-0.5">
            5 active slots + 5 new crush attempts per rolling 7 days. Removing a crush never refunds an attempt. 7-day cooldown applies per person.
          </p>
        </div>

        {/* Secret Crush Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Lock className="size-3.5" />
              Active Crushes ({usedSlots}/{maxSlots})
            </span>

            {usedSlots < maxSlots && attemptsUsedIn7Days < maxAttemptsIn7Days && !showAddSearch && (
              <button
                type="button"
                onClick={() => setShowAddSearch(true)}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add Student
              </button>
            )}
          </div>

          {/* Student Search Picker Dropdown */}
          {showAddSearch && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 space-y-3 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Select a Verified Student</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSearch(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search classmate name or username..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/50 bg-background text-xs font-semibold placeholder:text-muted-foreground/60 outline-none focus:border-rose-500 transition-all"
                  autoFocus
                />
              </div>

              {isSearching ? (
                <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Searching classmates...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-border/20 pr-1">
                  {searchResults.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-2 p-2 hover:bg-muted rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={u.avatarUrl || ""} />
                          <AvatarFallback className="text-[9px] font-bold">
                            {u.displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{u.displayName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">@{u.username}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => addSecretCrush(u.id)}
                        className="px-3 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        <Heart className="size-3 fill-white" />
                        <span>Crush</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  No verified students found for &ldquo;{searchQuery}&rdquo;.
                </p>
              ) : null}
            </div>
          )}

          {/* Slots List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Loading your vault...</span>
              </div>
            ) : crushes.length > 0 ? (
              crushes.map((c, idx) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-black text-muted-foreground w-4">
                      #{idx + 1}
                    </span>

                    <Avatar className="size-10 shrink-0 border border-border/40">
                      <AvatarImage src={c.target?.avatarUrl || ""} />
                      <AvatarFallback className="text-xs font-bold bg-rose-500/10 text-rose-500">
                        {c.target?.displayName?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-black text-foreground truncate flex items-center gap-1">
                        <span>{c.target?.displayName || "Classmate"}</span>
                        <ShieldCheck className="size-3 text-blue-500 shrink-0" />
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        @{c.target?.username} {c.target?.branch ? `• ${c.target.branch}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {c.isMutual ? (
                      <Link
                        href={`/app/chat?userId=${c.targetId}`}
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-2xs transition-transform active:scale-95"
                      >
                        <MessageCircle className="size-3.5" />
                        <span>Chat</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/40">
                        <Lock className="size-2.5" />
                        <span>Intent Hidden</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeCrush(c.id)}
                      className="size-7 rounded-full hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                      title="Remove from vault"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-2 border border-dashed border-border/50 rounded-2xl p-6">
                <div className="size-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="size-6" />
                </div>
                <h3 className="text-xs font-black text-foreground">Your Secret Crush vault is empty</h3>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Add up to {maxSlots} verified students you secretly like. They will NEVER know unless they add you too!
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddSearch(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="size-3.5" />
                  <span>Add First Crush</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Safety & Anonymity Footnote */}
        <div className="rounded-2xl bg-muted/40 p-3 text-[10px] text-muted-foreground leading-relaxed space-y-1">
          <p className="font-bold text-foreground flex items-center gap-1">
            <ShieldCheck className="size-3 text-blue-500" />
            CampusLoop Zero-Embarrassment Guarantee
          </p>
          <p>
            Your crushes are end-to-end intent-hidden. No one can see your list, and no notification reveals your name until a mutual match occurs.
          </p>
        </div>
      </div>
    </div>
  );
}
