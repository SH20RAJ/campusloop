import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { CreateListingClient } from "./create-listing-client";

export const metadata: Metadata = {
  title: "Sell Campus Gear & Books | Buy & Sell Hub | CampusLoop",
  description:
    "List textbooks, cycles, coolers, mattresses, and hostel gear for verified peer-to-peer campus trades.",
  alternates: { canonical: "https://campusloop.space/app/buy-and-sell/new" },
  openGraph: {
    title: "Sell Campus Gear & Books | Buy & Sell Hub | CampusLoop",
    description: "List textbooks, cycles, coolers, mattresses, and hostel gear for verified campus trades.",
    url: "https://campusloop.space/app/buy-and-sell/new",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell Campus Gear & Books | Buy & Sell Hub | CampusLoop",
    description: "List textbooks, cycles, coolers, mattresses, and hostel gear for verified campus trades.",
  },
  robots: { index: true, follow: true },
};

export default async function NewBuyAndSellPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <CreateListingClient profileId={profile.id} />;
}
