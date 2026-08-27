import { DedicatedHubClient } from "@/components/communities/dedicated-hub-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Gaming Arena | Campus Esports | CampusLoop",
  description: "Find college teammates, scrim lobbies, and host Valorant, BGMI, and Chess duels.",
  alternates: { canonical: "https://campusloop.space/app/gaming" },
};

export default async function GamingArenaPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <DedicatedHubClient hubType="gaming" profileId={profile.id} />;
}
