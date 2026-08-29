import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout | Campus Marketplace | CampusLoop",
  description: "Complete your campus order with verified hostel delivery or pickup.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <CheckoutClient profileId={profile.id} collegeName={profile.institution?.name} />;
}
