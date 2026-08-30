import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { MarketplaceClient } from "./marketplace-client";

export const metadata: Metadata = {
  title: "Campus Marketplace | Food, Essentials, Rentals & Services | CampusLoop",
  description:
    "Discover local canteens, momos, campus essentials, vehicle rentals, and laundry services from verified businesses near your college.",
  keywords: [
    "Campus Marketplace",
    "College Food Delivery",
    "Campus Canteens",
    "Hostel Essentials",
    "Scooter Rentals College",
    "College Laundry Services",
  ],
  alternates: { canonical: "https://campusloop.space/app/marketplace" },
  openGraph: {
    title: "Campus Marketplace | CampusLoop",
    description: "Shop from verified local businesses, canteens, and services around your college campus.",
    url: "https://campusloop.space/app/marketplace",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Marketplace | CampusLoop",
    description: "Shop from verified local businesses, canteens, and services around your college campus.",
  },
  robots: { index: true, follow: true },
};

export default async function MarketplacePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <MarketplaceClient profileId={profile.id} collegeName={profile.institution?.name} />;
}
