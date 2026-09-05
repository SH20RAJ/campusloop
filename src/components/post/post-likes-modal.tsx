"use client";

import { Heart, Loader2, Search, ShieldCheck, User, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { FollowButton } from "@/components/profile/follow-button";
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
  isFollowing?: boolean;
  isSelf?: boolean;
  likedAt: string | Date;
}

interface PostLikesResponse {
  likesCount: number;
  users: LikedUser[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface PostLikesModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export function PostLikesModal({ postId, isOpen, onClose, currentUserId }: PostLikesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getKey = (pageIndex: number, previousPageData: PostLikesResponse | null) => {
    if (!isOpen) return null;
    if (previousPageData && !previousPageData.hasMore) return null;
    const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor || "";
    const q = encodeURIComponent(debouncedQuery.trim());
    return `/api/posts/${postId}/likes?cursor=${encodeURIComponent(cursor)}&limit=15${q ? `&q=${q}` : ""}`;
  };

  const { data, size, setSize, isValidating, isLoading, error } = useSWRInfinite<PostLikesResponse>(
    getKey,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  // Reset pagination on search change
  useEffect(() => {
    setSize(1);
  }, [debouncedQuery, setSize]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedQuery("");
    }
  }, [isOpen]);

  const users = useMemo(() => {
    const seen = new Set<string>();
    const merged: LikedUser[] = [];
    for (const page of data || []) {
      for (const user of page?.users || []) {
        if (seen.has(user.id)) continue;
        seen.add(user.id);
        merged.push(user);
      }
    }
    return merged;
  }, [data]);

  const totalCount = data?.[0]?.likesCount ?? users.length;
  const isReachingEnd = data ? data[data.length - 1]?.hasMore === false : false;
  const isLoadingInitial = isLoading && users.length === 0;
  const isLoadingMore = isValidating && data && typeof data[size - 1] === "undefined";

  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const isValidatingRef = useRef(isValidating);
  isValidatingRef.current = isValidating;

  useEffect(() => {
    if (!sentinelNode || isReachingEnd || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isValidatingRef.current) {
          setSize((prev) => prev + 1);
        }
      },
      { rootMargin: "250px" }
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [sentinelNode, isReachingEnd, setSize, isOpen]);

  if (!isOpen) return null;

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
            <div className="size-7 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-2xs">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
            </div>
            <h3 className="text-base font-black text-foreground">Liked by</h3>
            {totalCount > 0 && (
              <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
                {totalCount}
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

        {/* Search Bar */}
        <div className="px-4 py-2.5 border-b border-border/30 bg-muted/20">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search who liked this post..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-border/50 bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* User List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/20 p-2 scroll-smooth">
          {isLoadingInitial ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl animate-pulse">
                  <div className="size-10 rounded-full bg-muted/60 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-3.5 w-28 bg-muted/60 rounded" />
                    <div className="h-2.5 w-40 bg-muted/40 rounded" />
                  </div>
                  <div className="h-7 w-16 bg-muted/40 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 text-xs text-destructive">
              Could not load likes list.
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              {debouncedQuery ? (
                <>
                  <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                    <Search className="size-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">No matches found</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    No classmates matching &quot;{debouncedQuery}&quot; found in likes.
                  </p>
                </>
              ) : (
                <>
                  <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground">
                    <Heart className="size-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">No likes yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Be the first classmate to drop a like on this campus post!
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {users.map((user) => {
                const isSelf = Boolean(user.isSelf || currentUserId === user.id);

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
                      <Avatar className="size-10 shrink-0 border border-border/40 group-hover:scale-105 transition-transform shadow-2xs">
                        <AvatarImage src={user.avatarUrl || ""} />
                        <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                          {(user.displayName?.[0] || "S").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                          <span>{user.displayName}</span>
                          {user.isVerified && (
                            <ShieldCheck className="size-3.5 text-brand shrink-0" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate font-medium">
                          @{user.username}
                          {user.branch ? ` · ${user.branch.split("&")[0].trim()}` : ""}
                          {user.year ? ` '${user.year.toString().slice(-2)}` : ""}
                        </p>
                      </div>
                    </Link>

                    {!isSelf ? (
                      <FollowButton
                        username={user.username}
                        displayName={user.displayName}
                        initialIsFollowing={user.isFollowing || false}
                        size="sm"
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/40">
                        You
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Sentinel element for infinite scrolling */}
              {!isReachingEnd && <div ref={setSentinelNode} className="h-2" />}

              {/* Loading More Spinner */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span className="text-xs font-semibold">Loading more...</span>
                </div>
              )}

              {/* End of list indicator */}
              {isReachingEnd && users.length > 5 && (
                <p className="py-4 text-center text-[11px] font-semibold text-muted-foreground">
                  All {users.length} {users.length === 1 ? "student" : "students"} loaded
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

