import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { BikeRentalsClient } from "./rentals-client";

export const metadata: Metadata = {
  title: "Campus Bike & Vehicle Rentals | Hourly & Daily Scooters",
  description:
    "Rent verified mountain bicycles, campus gear cycles, and electric scooters with free helmets and zero fuel hassle.",
  alternates: { canonical: "https://campusloop.space/app/marketplace/rentals" },
  openGraph: {
    title: "Campus Bike Rentals | CampusLoop",
    description: "Rent verified cycles and e-scooters for quick intra-campus transit and city rides.",
    url: "https://campusloop.space/app/marketplace/rentals",
    siteName: "CampusLoop Rentals",
  },
};

export default async function RentalsPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <BikeRentalsClient profileId={profile.id} collegeName={profile.institution?.name} />;
}
