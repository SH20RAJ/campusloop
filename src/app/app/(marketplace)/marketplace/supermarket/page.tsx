import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { SupermarketMarketplaceClient } from "./supermarket-client";

export const metadata: Metadata = {
  title: "Campus Supermarket & Mart | 15-Min Hostel Delivery",
  description:
    "Order snacks, midnight munchies, stationery, exam kits, toiletries, and hostel essentials with instant delivery inside your college campus.",
  alternates: { canonical: "https://campusloop.space/app/marketplace/supermarket" },
  openGraph: {
    title: "Campus Supermarket & Daily Mart | CampusLoop",
    description: "Instant groceries, exam stationery, beverages, and dorm essentials delivered to hostel rooms.",
    url: "https://campusloop.space/app/marketplace/supermarket",
    siteName: "CampusLoop Mart",
  },
};

export default async function SupermarketPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <SupermarketMarketplaceClient profileId={profile.id} collegeName={profile.institution?.name} />;
}
