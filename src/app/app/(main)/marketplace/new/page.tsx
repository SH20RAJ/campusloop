import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { HubCreateClient } from "../../hub/new/hub-create-client";

export const metadata: Metadata = {
  title: "Sell Campus Gear & Books | CampusLoop Marketplace",
  description: "List textbooks, cycles, calculators, monitors, and dorm essentials for peer-to-peer campus sale.",
  alternates: { canonical: "https://campusloop.space/app/marketplace/new" },
};

export default async function NewMarketplacePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <HubCreateClient initialType="marketplace" profileId={profile.id} />;
}
