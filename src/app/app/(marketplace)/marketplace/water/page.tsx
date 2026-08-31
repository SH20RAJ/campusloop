import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { WaterMarketplaceClient } from "./water-client";

export const metadata: Metadata = {
  title: "20L Chilled RO Water Can Delivery to Hostel Rooms | CampusLoop",
  description:
    "Order 20L chilled RO and mineral drinking water cans delivered directly to your hostel floor and room inside campus.",
  alternates: { canonical: "https://campusloop.space/app/marketplace/water" },
};

export default async function WaterMarketplacePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <WaterMarketplaceClient profileId={profile.id} collegeName={profile.institution?.name} />;
}
