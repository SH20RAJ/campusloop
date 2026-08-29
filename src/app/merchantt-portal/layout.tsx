import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { MerchantLayoutClient } from "./merchant-layout-client";

export const metadata: Metadata = {
  title: "Merchant Portal | CampusLoop",
  description: "Manage orders, menu items, business hours, and delivery settings for your campus store.",
  robots: { index: false, follow: false },
};

export default async function MerchantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <MerchantLayoutClient profile={profile}>{children}</MerchantLayoutClient>;
}
