import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { Post, UserProfile, Institution } from "@/db/schema";

export type FeedPost = Post & {
  author: UserProfile;
  institution: Institution;
  community?: { id: string; name: string } | null;
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

export function useFeed(
  scope: "CAMPUS" | "GLOBAL" = "CAMPUS",
  type?: string,
  sort?: string,
  visibility?: string,
  hashtag?: string,
) {
  const getKey = (pageIndex: number, previousPageData: FeedPost[] | null) => {
    if (previousPageData && !previousPageData.length) return null;

    const url = new URL("/api/feed", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    url.searchParams.set("scope", scope);
    if (type && type !== "ALL") url.searchParams.set("type", type);
    if (sort) url.searchParams.set("sort", sort);
    if (visibility && visibility !== "all") url.searchParams.set("visibility", visibility);
    if (hashtag) url.searchParams.set("hashtag", hashtag);
    url.searchParams.set("page", String(pageIndex + 1));
    url.searchParams.set("limit", "20");

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
  const isReachingEnd = sort === "for_you" ? false : Boolean(data && data[data.length - 1]?.length === 0);
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

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

export interface StoryGroupUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  stories: {
    id: string;
    mediaUrl: string | null;
    text: string | null;
    backgroundColor: string | null;
    createdAt: string;
    expiresAt: string;
  }[];
}

export function useStories() {
  const { data, error, isLoading, mutate } = useSWR<StoryGroupUser[]>("/api/stories", fetcher);
  return { stories: data, isLoading, isError: error, mutate };
}
