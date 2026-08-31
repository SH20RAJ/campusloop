import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { BikeDetailClient } from "./bike-detail-client";

interface BikeDetailPageProps {
  params: Promise<{ bikeId: string }>;
}

export const metadata: Metadata = {
  title: "Book Campus Bike Rental | CampusLoop Marketplace",
  description: "Rent verified scooters, motorcycles, and EV bikes on campus with instant pickup.",
  robots: { index: true, follow: true },
};

export default async function BikeDetailPage({ params }: BikeDetailPageProps) {
  const { bikeId } = await params;
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <BikeDetailClient bikeId={bikeId} profileId={profile.id} />;
}
