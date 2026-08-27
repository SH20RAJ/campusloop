"use client";

import { FollowListItem,FollowListRow } from "@/components/profile/follow-list-row";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft,Loader2,Users } from "lucide-react";
import Link from "next/link";
import { useEffect,useMemo,useRef } from "react";
import useSWRInfinite from "swr/infinite";

export interface FollowListPageData {
  items: FollowListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface FollowListClientProps {
  username: string;
  displayName: string;
  direction: "followers" | "following";
  initialPage: FollowListPageData;
  followersCount: number;
  followingCount: number;
  isSignedIn: boolean;
}

export function FollowListClient({
  username,
  displayName,
  direction,
  initialPage,
  followersCount,
  followingCount,
  isSignedIn,
}: FollowListClientProps) {
  const getKey = (pageIndex: number, previousPageData: FollowListPageData | null) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor || "";
    return `/api/profile/${encodeURIComponent(username)}/${direction}?cursor=${encodeURIComponent(
      cursor,
    )}&limit=20`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite<FollowListPageData>(getKey, fetcher, {
    // The first page is rendered on the server, so don't refetch it on mount.
    fallbackData: [initialPage],
    revalidateFirstPage: false,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  const users = useMemo(() => {
    const seen = new Set<string>();
    const merged: FollowListItem[] = [];
    for (const page of data || []) {
      for (const item of page?.items || []) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  }, [data]);

  const isReachingEnd = data ? data[data.length - 1]?.hasMore === false : false;
  const isLoadingMore = isValidating && data && typeof data[size - 1] === "undefined";

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isReachingEnd || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSize((prev) => prev + 1);
        }
      },
      { rootMargin: "400px" },
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [isReachingEnd, isValidating, setSize]);

  const tabs = [
    { id: "followers" as const, label: "Followers", count: followersCount },
    { id: "following" as const, label: "Following", count: followingCount },
  ];

  return (
    <div className="flex w-full flex-col min-h-screen select-none">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href={`/@${username}`}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Back to profile"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-black tracking-tight text-foreground truncate">
              {displayName}
            </h1>
            <p className="text-xs font-semibold text-muted-foreground">@{username}</p>
          </div>
        </div>

        <div className="grid grid-cols-2">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/@${username}/${tab.id}`}
              className={cn(
                "py-3 text-center text-xs font-black transition-colors border-b-2",
                tab.id === direction
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              {tab.count} {tab.label}
            </Link>
          ))}
        </div>
      </header>

      {users.length === 0 && !isLoadingMore ? (
        <div className="flex flex-col items-center justify-center gap-3 px-8 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <p className="text-sm font-bold text-foreground">
            {direction === "followers"
              ? `No one follows @${username} yet`
              : `@${username} isn't following anyone yet`}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            {direction === "followers"
              ? "Campus connections show up here as soon as students hit follow."
              : "When they start following students, you'll see them here."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/30">
          {users.map((user) => (
            <FollowListRow key={user.id} user={user} showFollowButton={isSignedIn} />
          ))}
        </ul>
      )}

      {isLoadingMore && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isReachingEnd && <div ref={sentinelRef} className="h-1" />}

      {isReachingEnd && users.length > 0 && (
        <p className="py-6 text-center text-[11px] font-semibold text-muted-foreground">
          That&apos;s everyone · {users.length} shown
        </p>
      )}
    </div>
  );
}
