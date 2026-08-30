import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { HubCreateClient } from "../../hub/new/hub-create-client";

export const metadata: Metadata = {
  title: "Host Gaming Lobby | CampusLoop Arena",
  description: "Find teammates for Valorant, BGMI, CS2, Dota 2, and campus esports tournaments.",
  alternates: { canonical: "https://campusloop.space/app/gaming/new" },
};

export default async function NewGamingPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <HubCreateClient initialType="gaming" profileId={profile.id} />;
}
