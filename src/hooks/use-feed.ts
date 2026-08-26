import { Institution,Post,UserProfile } from "@/db/schema";
import { getSeenPostIds,markPostsAsSeen } from "@/lib/seen-posts";
import { useEffect } from "react";
import useSWRInfinite from "swr/infinite";

export type FeedPost = Post & {
  // Stripped to null by the server for anonymous posts.
  author: UserProfile | null;
  institution: Institution;
  community?: { id: string; name: string } | null;
  repostOf?: (Post & { author: UserProfile | null; institution?: Institution }) | null;
  votesCount: number;
  commentsCount: number;
  userVote: number;
  pollOptions?: {
    id: string;
    text: string;
    votesCount: number;
    userVoted: boolean;
  }[];
  hasVotedPoll?: boolean;
  totalPollVotes?: number;
};

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

const PAGE_LIMIT = 20;

export function useFeed(
  scope: "CAMPUS" | "GLOBAL" = "CAMPUS",
  type?: string,
  sort?: string,
  visibility?: string,
  hashtag?: string,
) {
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

    if (pageIndex === 0) {
      const seenIds = getSeenPostIds();
      if (seenIds.length > 0) {
        url.searchParams.set("seenIds", seenIds.slice(0, 50).join(","));
      }
    }

    return url.toString();
  };

  const { data, error, size, setSize, isLoading, mutate } = useSWRInfinite<FeedPost[]>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const rawFeed = data ? data.flat() : undefined;
  const feed = rawFeed
    ? Array.from(new Map(rawFeed.map((post) => [post.id, post])).values())
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
    isReachingEnd,
    isError: error,
    size,
    setSize,
    mutate,
  };
}

export { useStories } from "./use-stories";
