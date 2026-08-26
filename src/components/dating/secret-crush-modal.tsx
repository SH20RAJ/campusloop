"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/db/schema";
import {
Flame,
Heart,
Loader2,
Lock,
MessageCircle,
Plus,
Search,
ShieldCheck,
Trash2,
X
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

interface SecretCrushResponse {
  crushes: SecretCrushItem[];
  usedSlots: number;
  maxSlots: number;
  remainingSlots: number;
  receivedCrushesCount: number;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

interface SecretCrushModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const usedSlots = data?.usedSlots || 0;
  const maxSlots = data?.maxSlots || 5;
  const receivedCrushesCount = data?.receivedCrushesCount || 0;

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
        toast.success("💘 IT'S A MUTUAL MATCH! You both secretly liked each other!");
      } else {
        toast.success("Secret crush locked in! 🔒 Your identity stays 100% hidden unless mutual.");
      }

      setShowAddSearch(false);
      setSearchQuery("");
      setSearchResults([]);
      mutate();
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

      toast.success("Crush removed. Slot freed up!");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove crush");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border/40 bg-card p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Heart className="size-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                  Secret Crush
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">
                  18+ Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Your intent stays 100% hidden unless it&apos;s mutual.
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

        {/* 5 Secret Crush Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Lock className="size-3.5" />
              Your Secret Crush Vault ({usedSlots}/{maxSlots})
            </span>

            {usedSlots < maxSlots && !showAddSearch && (
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
                  Add up to 5 verified students you secretly like. They will NEVER know unless they add you too!
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
