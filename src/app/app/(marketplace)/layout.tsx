import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MarketplaceShellClient } from "@/components/marketplace/marketplace-shell-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { isViewerProfile } from "@/lib/viewer";

export const metadata: Metadata = {
  title: {
    default: "Campus Marketplace | Verified Local Canteens, Rentals & Campus Services",
    template: "%s | CampusLoop Marketplace",
  },
  description:
    "Order food from campus canteens, book bike rentals, schedule barber appointments, get laundry picked up, order 20L water cans, and shop hostel essentials.",
  openGraph: {
    title: "CampusLoop Marketplace | Food, Bike Rentals, Barber, Laundry & Essentials",
    description: "Verified local campus businesses, food delivery, bike rentals, and hostel services.",
    url: "https://campusloop.space/app/marketplace",
    siteName: "CampusLoop Marketplace",
    images: [{ url: "https://campusloop.space/og-marketplace.png", width: 1536, height: 1024, alt: "CampusLoop Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Marketplace | Night Canteens, Rentals & Campus Services",
    description: "Verified local campus businesses, food delivery, bike rentals, and hostel services.",
    images: ["https://campusloop.space/og-marketplace.png"],
  },
};

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedAuthUser();
  if (!user) {
    redirect("/handler/sign-in");
  }

  const profile = await getCachedUserProfile(user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/app/onboarding");
  }

  const viewerMode = await isViewerProfile(profile);

  return (
    <MarketplaceShellClient profile={profile} viewerMode={viewerMode}>
      {children}
    </MarketplaceShellClient>
  );
}
