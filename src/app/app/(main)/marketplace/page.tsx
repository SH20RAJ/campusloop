import { DedicatedHubClient } from "@/components/communities/dedicated-hub-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Buy & Sell | Campus Marketplace | CampusLoop",
  description: "Buy and sell second-hand cycles, coolers, textbooks, and hostel essentials with verified students.",
  alternates: { canonical: "https://campusloop.space/app/marketplace" },
};

export default async function MarketplacePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <DedicatedHubClient hubType="marketplace" profileId={profile.id} />;
}
