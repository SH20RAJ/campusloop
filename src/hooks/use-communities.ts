import useSWR from "swr";
import { fetcher } from "@/lib/api";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  slug?: string | null;
  privacy?: string;
  isPrivate?: boolean;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  category?: string;
  points?: number;
  memberCount?: number;
  membersCount?: number;
  isMember?: boolean;
  members?: any[];
  creator?: {
    id: string;
    username: string;
    displayName: string;
  } | null;
}

export function useCommunities() {
  const { data, error, isLoading, mutate } = useSWR<Community[]>("/api/communities", fetcher, {
    revalidateIfStale: true,
    keepPreviousData: true,
    dedupingInterval: 20000,
  });

  return {
    communities: data || [],
    isLoading,
    error,
    mutate,
  };
}
