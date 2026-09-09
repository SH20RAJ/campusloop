import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DedicatedHubClient } from "@/components/communities/dedicated-hub-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const metadata: Metadata = {
  title: "Housing & Flats | Student PGs & Roommates | CampusLoop",
  description: "Find verified student PGs, apartments, shared flats, and roommates near college campus.",
  alternates: { canonical: "https://campusloop.space/app/housing" },
  openGraph: {
    title: "Housing & Flats | Student PGs & Roommates | CampusLoop",
    description: "Find verified student PGs, apartments, shared flats, and roommates near college campus.",
    url: "https://campusloop.space/app/housing",
    siteName: "CampusLoop Housing",
    images: [
      {
        url: "https://campusloop.space/og-housing.png",
        width: 1536,
        height: 1024,
        alt: "CampusLoop Housing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Housing & Flats | Student PGs & Roommates | CampusLoop",
    description: "Find verified student PGs, apartments, shared flats, and roommates near college campus.",
    images: ["https://campusloop.space/og-housing.png"],
  },
};

export default async function HousingPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <DedicatedHubClient hubType="housing" profileId={profile.id} />;
}
