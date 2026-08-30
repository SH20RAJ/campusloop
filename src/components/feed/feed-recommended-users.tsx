"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { FollowButton } from "@/components/profile/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/api";
import type { RecommendedUser } from "@/lib/recommendations/recommended-users";
import { cn } from "@/lib/utils";

interface FeedRecommendedUsersProps {
  className?: string;
}

export function FeedRecommendedUsers({ className }: FeedRecommendedUsersProps) {
  const { data, isLoading } = useSWR<{ users: RecommendedUser[] }>(
    "/api/profile/recommended?limit=5",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const users = data?.users ?? [];

  if (isLoading && users.length === 0) {
    return (
      <div className={cn("p-4 space-y-3 select-none", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full bg-muted/65 shimmer-effect" />
            <div className="h-4 w-44 rounded-md bg-muted/65 shimmer-effect" />
          </div>
          <div className="h-3 w-16 rounded-md bg-muted/50 shimmer-effect" />
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-44 shrink-0 rounded-2xl border border-border/40 bg-card p-3 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-full bg-muted/65 shimmer-effect shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="h-3.5 w-20 rounded bg-muted/65 shimmer-effect" />
                  <div className="h-2.5 w-14 rounded bg-muted/50 shimmer-effect" />
                </div>
              </div>
              <div className="h-5 w-full rounded-full bg-muted/50 shimmer-effect" />
              <div className="h-7 w-full rounded-full bg-muted/40 shimmer-effect" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={cn("py-3.5 px-4 space-y-3 select-none", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-foreground tracking-tight flex items-center gap-1.5">
              People you might vibe with
            </h3>
          </div>
        </div>
        <Link
          href="/app/colleges"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
        >
          Explore
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Horizontal Carousel of Recommended Students */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth">
        {users.map((user) => (
          <div
            key={user.id}
            className="w-48 shrink-0 flex flex-col justify-between rounded-2xl border border-border/50 bg-card/80 p-3.5 shadow-2xs hover:border-border transition-all group"
          >
            {/* Top Row: Avatar & Match Badge */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-1.5">
                <Link href={`/@${user.username}`} className="shrink-0">
                  <Avatar className="size-11 rounded-full border border-border/60 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.displayName} />
                    <AvatarFallback className="bg-muted text-foreground font-bold text-xs">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* Vibe Badge */}
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary border border-primary/20 shrink-0">
                  {user.matchReason}
                </span>
              </div>

              {/* User Metadata */}
              <div className="min-w-0">
                <Link
                  href={`/@${user.username}`}
                  className="font-bold text-xs text-foreground hover:underline truncate block"
                >
                  {user.displayName}
                </Link>
                <p className="text-[11px] text-muted-foreground truncate">@{user.username}</p>

                {/* Institution / Branch subtitle */}
                <p className="text-[10px] text-muted-foreground/80 truncate mt-1">
                  {user.institution?.name?.split(",")[0] || "Verified Student"}
                  {user.branch ? ` · ${user.branch.toUpperCase()}` : ""}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3">
              <FollowButton
                username={user.username}
                displayName={user.displayName}
                initialIsFollowing={user.isFollowing || false}
                size="sm"
                className="w-full justify-center text-xs py-1 h-7 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
