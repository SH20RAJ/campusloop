import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { BarberMarketplaceClient } from "./barber-client";

export const metadata: Metadata = {
  title: "Campus Barber & Salon Grooming | CampusLoop",
  description:
    "Book live token slots for haircuts, beard styling, head massage, and facial de-tan at campus salons near your hostel.",
  alternates: { canonical: "https://campusloop.space/app/marketplace/barber" },
};

export default async function BarberMarketplacePage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <BarberMarketplaceClient profileId={profile.id} collegeName={profile.institution?.name} />;
}
