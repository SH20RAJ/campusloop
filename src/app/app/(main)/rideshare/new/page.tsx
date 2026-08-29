import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { HubCreateClient } from "../../hub/new/hub-create-client";

export const metadata: Metadata = {
  title: "Offer Campus Ride Share | CampusLoop",
  description: "Split cab and auto fares to railway stations, airports, and city hubs with verified classmates.",
  alternates: { canonical: "https://campusloop.space/app/rideshare/new" },
};

export default async function NewRidesharePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <HubCreateClient initialType="rideshare" profileId={profile.id} />;
}
