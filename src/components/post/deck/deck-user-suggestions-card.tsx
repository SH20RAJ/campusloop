"use client";

import { BadgeCheck, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import type { DeckUserSuggestion } from "./deck-types";

interface DeckUserSuggestionsCardProps {
  users: DeckUserSuggestion[];
  institutionName?: string;
}

export function DeckUserSuggestionsCard({ users, institutionName }: DeckUserSuggestionsCardProps) {
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    users.forEach((u) => {
      init[u.id] = Boolean(u.isFollowing);
    });
    return init;
  });

  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  async function handleToggleFollow(username: string, userId: string) {
    const isCurrentlyFollowing = Boolean(followingMap[userId]);
    setLoadingMap((prev) => ({ ...prev, [userId]: true }));

    // Optimistic
    setFollowingMap((prev) => ({ ...prev, [userId]: !isCurrentlyFollowing }));

    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(username)}/follow`, {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle follow");
    } catch {
      // Revert
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [userId]: false }));
    }
  }

  return (
    <article className="relative w-full max-w-xl mx-auto rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl p-5 sm:p-6 flex flex-col justify-between max-h-[calc(100dvh-5rem)] overflow-y-auto no-scrollbar select-none transition-all">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-foreground">Who to Follow on Campus</h3>
              <p className="text-[11px] text-muted-foreground">{institutionName || "Active verified peers"}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
            Suggested
          </span>
        </div>

        {/* User list */}
        <div className="space-y-3 pt-1">
          {users.map((user) => {
            const isFollowing = Boolean(followingMap[user.id]);
            const isLoading = Boolean(loadingMap[user.id]);
            const avatarUrl = getAvatarUrl(user.avatarUrl, user.username);

            return (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <Link
                  href={`/@${user.username}`}
                  className="flex items-center gap-3 min-w-0 flex-1 group"
                >
                  <Avatar className="size-11 border border-border/60 shrink-0">
                    <AvatarImage src={avatarUrl} alt={user.displayName} />
                    <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                      {user.displayName[0] || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {user.displayName}
                      </span>
                      <BadgeCheck className="size-3.5 text-primary shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    {(user.branch || user.year) && (
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">
                        {[user.branch, user.year ? `Year ${user.year}` : null].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleToggleFollow(user.username, user.id)}
                  disabled={isLoading}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none shrink-0 ${
                    isFollowing
                      ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                      : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-xs"
                  }`}
                >
                  {isLoading ? "..." : isFollowing ? "Following" : "+ Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="pt-4 border-t border-border/30 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
        <span>Swipe down to continue your loop</span>
        <span className="text-primary font-bold">↓</span>
      </div>
    </article>
  );
}
