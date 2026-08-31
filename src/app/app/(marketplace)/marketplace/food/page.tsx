import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { FoodMarketplaceClient } from "./food-marketplace-client";

export const metadata: Metadata = {
  title: "Campus Food & Canteens | Fast Delivery & Night Mess",
  description:
    "Order food from verified college canteens, momo stalls, late-night Maggie spots, and mess menus delivered directly to your hostel room.",
  alternates: { canonical: "https://campusloop.space/app/marketplace/food" },
  openGraph: {
    title: "Campus Food & Canteens | CampusLoop",
    description: "Order food from verified canteens and late-night food stalls around your campus.",
    url: "https://campusloop.space/app/marketplace/food",
    siteName: "CampusLoop Food",
  },
};

export default async function FoodMarketplacePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <FoodMarketplaceClient profileId={profile.id} collegeName={profile.institution?.name} />;
}
