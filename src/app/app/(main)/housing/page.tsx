import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DedicatedHubClient } from "@/components/communities/dedicated-hub-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const metadata: Metadata = {
  title: "Housing & Flats | Student PGs & Roommates",
  description: "Find verified student PGs, apartments, shared flats, and roommates near college campus.",
  alternates: { canonical: "https://campusloop.space/app/housing" },
};

export default async function HousingPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <DedicatedHubClient hubType="housing" profileId={profile.id} />;
}
