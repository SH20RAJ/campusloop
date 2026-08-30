import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { BuyAndSellClient } from "./buy-and-sell-client";

export const metadata: Metadata = {
  title: "Buy & Sell | Verified Campus Marketplace | CampusLoop",
  description:
    "Buy and sell second-hand bicycles, coolers, mattresses, textbooks, drafters, and calculators safely with verified college batchmates.",
  keywords: [
    "Buy and Sell College",
    "Campus Marketplace",
    "Student Second Hand",
    "Hostel Essentials",
    "Used Bicycles College",
    "Used Textbooks India",
  ],
  alternates: { canonical: "https://campusloop.space/app/buy-and-sell" },
  openGraph: {
    title: "Buy & Sell | Verified Campus Marketplace | CampusLoop",
    description:
      "Buy and sell second-hand bicycles, coolers, mattresses, textbooks, and hostel essentials with verified students.",
    url: "https://campusloop.space/app/buy-and-sell",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy & Sell | Verified Campus Marketplace | CampusLoop",
    description:
      "Buy and sell second-hand bicycles, coolers, mattresses, textbooks, and hostel essentials with verified students.",
  },
  robots: { index: true, follow: true },
};

export default async function BuyAndSellPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <BuyAndSellClient profileId={profile.id} />;
}
