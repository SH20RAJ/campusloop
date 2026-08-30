import { fetcher,updateProfile as updateProfileApi } from "@/lib/api";
import useSWR from "swr";

export interface UserProfileData {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bannerUrl?: string | null;
  role?: string | null;
  headline?: string | null;

  photos?: string[];
  gender: string | null;
  dob?: string | null;
  isDobPrivate?: boolean;
  course: string | null;
  branch: string | null;
  year: number | null;
  bio: string | null;
  interests: string[];
  loopPoints: number;
  points?: number;
  referralCount?: number;
  anonymousUsername?: string | null;
  feedVisibility?: string;
  onboardingCompleted?: boolean;

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
      revalidateIfStale: true,
      keepPreviousData: true,
      dedupingInterval: 15000,
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
