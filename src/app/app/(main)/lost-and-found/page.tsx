import { DedicatedHubClient } from "@/components/communities/dedicated-hub-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Lost & Found | CampusLoop",
  description: "Report lost student IDs, keys, earphones, and reclaim found items safely on your college campus.",
  alternates: { canonical: "https://campusloop.space/app/lost-and-found" },
};

export default async function LostAndFoundPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <DedicatedHubClient hubType="lost_found" profileId={profile.id} />;
}
