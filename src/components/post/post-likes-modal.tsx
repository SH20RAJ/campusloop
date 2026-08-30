"use client";

import { Heart, Loader2, ShieldCheck, UserCheck, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface LikedUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  points: number;
  branch: string | null;
  year: number | null;
  institutionName: string | null;
  isVerified: boolean;
  likedAt: string | Date;
}

interface PostLikesResponse {
  likesCount: number;
  users: LikedUser[];
}

interface PostLikesModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export function PostLikesModal({ postId, isOpen, onClose, currentUserId }: PostLikesModalProps) {
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const { data, isLoading, error } = useSWR<PostLikesResponse>(
    isOpen ? `/api/posts/${postId}/likes` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );

  if (!isOpen) return null;

  const users = data?.users || [];
  const count = data?.likesCount ?? users.length;

  function handleFollowToggle(userId: string, name: string) {
    setFollowingMap((prev) => {
      const next = !prev[userId];
      if (next) {
        toast.success(`Connected with ${name}!`);
      }
      return { ...prev, [userId]: next };
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
            </div>
            <h3 className="text-base font-black text-foreground">Liked by</h3>
            {count > 0 && (
              <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
                {count}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* User List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/20 p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs font-semibold">Loading reactions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-xs text-destructive">Could not load likes list.</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                <Heart className="size-6" />
              </div>
              <p className="text-sm font-bold text-foreground">No likes yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Be the first classmate to drop a like on this campus post!
              </p>
            </div>
          ) : (
            users.map((user) => {
              const isSelf = currentUserId === user.id;
              const isFollowed = Boolean(followingMap[user.id]);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-muted/25 rounded-2xl transition-colors"
                >
                  <Link
                    href={`/@${user.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 min-w-0 flex-1 group cursor-pointer"
                  >
                    <Avatar className="size-10 shrink-0 border border-border/40 group-hover:scale-105 transition-transform">
                      <AvatarImage src={user.avatarUrl || ""} />
                      <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                        {user.displayName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-foreground truncate group-hover:underline flex items-center gap-1">
                        <span>{user.displayName}</span>
                        {user.isVerified && <ShieldCheck className="size-3.5 text-[#1d9bf0] shrink-0" />}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                        {user.branch ? ` · ${user.branch.split("&")[0].trim()}` : ""}
                        {user.year ? ` '${user.year.toString().slice(-2)}` : ""}
                      </p>
                    </div>
                  </Link>

                  {!isSelf ? (
                    <button
                      type="button"
                      onClick={() => handleFollowToggle(user.id, user.displayName)}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1 shadow-2xs",
                        isFollowed
                          ? "border border-border/60 bg-transparent text-foreground hover:border-destructive/40 hover:text-destructive"
                          : "bg-foreground text-background hover:opacity-90"
                      )}
                    >
                      {isFollowed ? (
                        <>
                          <UserCheck className="size-3" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="size-3" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/40">
                      You
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
