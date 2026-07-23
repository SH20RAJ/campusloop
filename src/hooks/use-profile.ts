import useSWR from "swr";
import { fetcher, updateProfile as updateProfileApi } from "@/lib/api";

export interface UserProfileData {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  gender: string | null;
  course: string | null;
  branch: string | null;
  year: number | null;
  bio: string | null;
  interests: string[];
  loopPoints: number;
  institutionId?: string | null;
  institution?: {
    id: string;
    name: string;
    slug?: string | null;
  } | null;
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfileData>(
    "/api/profile/me",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  async function updateProfile(updatedFields: Partial<UserProfileData>) {
    try {
      await updateProfileApi(updatedFields);
      await mutate();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update profile",
      };
    }
  }

  return {
    profile: data,
    isLoading,
    error,
    mutate,
    updateProfile,
  };
}
