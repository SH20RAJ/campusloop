import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { LaundryMarketplaceClient } from "./laundry-client";

export const metadata: Metadata = {
  title: "Hostel Laundry & Dry Cleaning | CampusLoop",
  description:
    "Order doorstep hostel laundry pickup, wash & fold, steam pressing, and winter jacket dry cleaning inside your campus.",
  alternates: { canonical: "https://campusloop.space/app/marketplace/laundry" },
};

export default async function LaundryMarketplacePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <LaundryMarketplaceClient profileId={profile.id} collegeName={profile.institution?.name} />;
}
