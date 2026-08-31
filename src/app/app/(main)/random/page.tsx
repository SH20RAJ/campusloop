import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RandomLoopClient } from "@/components/random/random-loop-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { isViewerProfile } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Random Loop | Serendipitous Verified Campus Discovery",
  description:
    "Meet someone unexpected. Real-time anonymous conversations with verified college students across campus.",
  openGraph: {
    title: "Random Loop | CampusLoop",
    description: "You don't know who you'll meet. You know they're part of the Loop.",
    url: "https://campusloop.space/app/random",
  },
};

export default async function RandomLoopPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile?.onboardingCompleted) redirect("/app/onboarding");

  const viewerMode = await isViewerProfile(profile);
  if (viewerMode) {
    redirect("/app/more");
  }

  return (
    <RandomLoopClient
      currentProfile={{
        id: profile.id,
        displayName: profile.displayName,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        institutionId: profile.institutionId,
        yearOfStudy: profile.yearOfStudy,
        branch: profile.branch,
      }}
    />
  );
}
