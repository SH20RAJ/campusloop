import { Institution,Post,UserProfile } from "@/db/schema";
import { feedPagesCache,feedSizeCache,getPendingFeedPosts } from "@/lib/feed-mutations";
import { getSeenPostIds,markPostsAsSeen } from "@/lib/seen-posts";
import { useCallback,useEffect } from "react";
import useSWRInfinite from "swr/infinite";

export type TopCommentPreview = {

  id: string;
  body: string;
  createdAt: Date | string;
  isAnonymous: boolean;
  pseudonym?: string | null;
  author?: {
    id?: string;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    points?: number | null;
  } | null;
};

export type FeedPost = Post & {
  // Stripped to null by the server for anonymous posts.
  author: UserProfile | null;
  institution: Institution;
  community?: { id: string; name: string } | null;
  repostOf?: (Post & { author: UserProfile | null; institution?: Institution }) | null;
  votesCount: number;
  commentsCount: number;
  userVote: number;
  topComment?: TopCommentPreview | null;
  pollOptions?: {
    id: string;
    text: string;
    votesCount: number;
    userVoted: boolean;
  }[];
  hasVotedPoll?: boolean;
  totalPollVotes?: number;
  isSaved?: boolean;
};


const feedFetcher = async <T,>(url: string): Promise<T> => {
  const seenIds = getSeenPostIds();
  const headers: Record<string, string> = {};
  if (seenIds.length > 0) {
    headers["x-seen-ids"] = seenIds.slice(0, 50).join(",");
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json() as Promise<T>;
};

const PAGE_LIMIT = 20;

export function useFeed(

  scope: "CAMPUS" | "GLOBAL" = "CAMPUS",
  type?: string,
  sort?: string,
  visibility?: string,
  hashtag?: string,
) {
  const cacheKey = `${scope}_${type || "ALL"}_${sort || "latest"}_${visibility || "all"}_${hashtag || ""}`;
  const initialSize = feedSizeCache.get(cacheKey) || 1;
  const fallbackData = feedPagesCache.get(cacheKey);

  const getKey = (pageIndex: number, previousPageData: FeedPost[] | null) => {
    if (previousPageData && previousPageData.length < PAGE_LIMIT) return null;

    const url = new URL("/api/feed", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    url.searchParams.set("scope", scope);
    if (type && type !== "ALL") url.searchParams.set("type", type);
    if (sort) url.searchParams.set("sort", sort);
    if (visibility && visibility !== "all") url.searchParams.set("visibility", visibility);
    if (hashtag) url.searchParams.set("hashtag", hashtag);
    url.searchParams.set("page", String(pageIndex + 1));
    url.searchParams.set("limit", String(PAGE_LIMIT));

    return url.toString();
  };

  const { data, error, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<FeedPost[]>(
    getKey,
    feedFetcher,
    {
      initialSize,
      fallbackData,
      // Only the first page is refetched: later pages are append-only history,
      // so revalidating all of them on every focus would be wasteful.
      revalidateFirstPage: true,
      revalidateAll: false,
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      // The cached pages stay on screen while the refresh runs, so returning to
      // the feed never flashes a skeleton over content we already have.
      keepPreviousData: true,
    }
  );

  // Sync cache on updates
  useEffect(() => {
    if (data && data.length > 0) {
      feedPagesCache.set(cacheKey, data);
    }
  }, [cacheKey, data]);

  const handleSetSize = useCallback(
    (sizeOrFn: number | ((size: number) => number)) => {
      setSize((prev) => {
        const next = typeof sizeOrFn === "function" ? sizeOrFn(prev) : sizeOrFn;
        feedSizeCache.set(cacheKey, next);
        return next;
      });
    },
    [cacheKey, setSize]
  );

  const refresh = useCallback(async () => {
    feedSizeCache.set(cacheKey, 1);
    return mutate();
  }, [cacheKey, mutate]);

  const rawFeed = (data || fallbackData)?.flat();
  // Posts published moments ago sit on top until the API starts returning
  // them, so the author always sees their post land in the feed.
  const pending = rawFeed ? getPendingFeedPosts() : [];
  const merged = rawFeed ? [...pending, ...rawFeed] : undefined;
  const feed = merged
    ? Array.from(new Map(merged.map((post) => [post.id, post])).values())
    : undefined;

  // Track impressions when feed items load
  useEffect(() => {
    if (feed && feed.length > 0) {
      markPostsAsSeen(feed.slice(0, 25).map((p) => p.id));
    }
  }, [feed]);

  const isReachingEnd = Boolean(
    data && (data.length === 0 || (data[data.length - 1] && data[data.length - 1].length < PAGE_LIMIT))
  );
  const isLoadingMore = Boolean(isLoading || (size > 0 && data && typeof data[size - 1] === "undefined"));

  return {
    feed,
    isLoading,
    isLoadingMore,
    isValidating,
    isReachingEnd,
    isError: error,
    size,
    setSize: handleSetSize,
    mutate,
    refresh,
  };
}


export { useStories } from "./use-stories";
