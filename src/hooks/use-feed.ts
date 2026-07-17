import useSWR from "swr";
import { Post, UserProfile, Institution } from "@/db/schema";

export type FeedPost = Post & {
  author: UserProfile;
  institution: Institution;
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
) {
  const url = new URL("/api/feed", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  url.searchParams.set("scope", scope);
  if (type && type !== "ALL") url.searchParams.set("type", type);
  if (sort) url.searchParams.set("sort", sort);
  if (visibility && visibility !== "all") url.searchParams.set("visibility", visibility);

  const { data, error, isLoading, mutate } = useSWR<FeedPost[]>(url.toString(), fetcher);

  return { feed: data, isLoading, isError: error, mutate };
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
