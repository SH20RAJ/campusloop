import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { HubCreateClient } from "./hub-create-client";

export const metadata: Metadata = {
  title: "New Hub Listing | CampusLoop",
  description:
    "Create and publish listings for Lost & Found, Buy & Sell, Gaming Lobbies, Ride Sharing, Housing, and Notes.",
  alternates: { canonical: "https://campusloop.space/app/hub/new" },
};

export default async function NewHubListingPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <HubCreateClient profileId={profile.id} />;
}
