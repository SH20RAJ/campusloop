import useSWR from "swr";
import { fetcher } from "@/lib/api";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  slug?: string | null;
  isPrivate: boolean;
  avatarUrl?: string | null;
  memberCount?: number;
  creator?: {
    id: string;
    username: string;
    displayName: string;
  } | null;
}

export function useCommunities() {
  const { data, error, isLoading, mutate } = useSWR<Community[]>(
    "/api/communities",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 20000,
    }
  );

  return {
    communities: data || [],
    isLoading,
    error,
    mutate,
  };
}
