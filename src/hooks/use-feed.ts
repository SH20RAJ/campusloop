import useSWR from "swr";
import { Post, UserProfile, Institution } from "@/db/schema";

type FeedPost = Post & {
  author: UserProfile;
  institution: Institution;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useFeed() {
  const { data, error, isLoading, mutate } = useSWR<FeedPost[]>("/api/feed", fetcher);

  return {
    feed: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useStories() {
  const { data, error, isLoading } = useSWR<UserProfile[]>("/api/stories", fetcher);

  return {
    stories: data,
    isLoading,
    isError: error,
  };
}
