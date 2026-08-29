import { DedicatedHubClient } from "@/components/communities/dedicated-hub-client";
import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Housing & Flats | Student PGs & Roommates | CampusLoop",
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
