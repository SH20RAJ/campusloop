import useSWR from "swr";
import { fetcher } from "@/lib/api";

export interface StoryAuthor {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  institution?: { name: string } | null;
}

export interface StoryItem {
  id: string;
  mediaUrl: string | null;
  text: string | null;
  backgroundColor: string | null;
  createdAt: string;
  expiresAt: string;
  author?: StoryAuthor;
}

export interface UserStoryGroup {
  user: StoryAuthor;
  stories: StoryItem[];
  hasUnseen?: boolean;
}

export function useStories() {
  const { data, error, isLoading, mutate } = useSWR<UserStoryGroup[]>(
    "/api/stories",
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000,
    }
  );

  return {
    stories: data || [],
    storyGroups: data || [],
    isLoading,
    error,
    mutate,
  };
}
