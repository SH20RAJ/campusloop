import { DedicatedHubClient } from "@/components/communities/dedicated-hub-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ride Share | Station & Airport Cab Pool | CampusLoop",
  description: "Split station and airport cab fares with verified college batchmates.",
  alternates: { canonical: "https://campusloop.space/app/rideshare" },
};

export default async function RidesharePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <DedicatedHubClient hubType="rideshare" profileId={profile.id} />;
}
