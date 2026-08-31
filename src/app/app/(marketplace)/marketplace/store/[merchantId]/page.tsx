import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { StoreClient } from "./store-client";

interface StorePageProps {
  params: Promise<{ merchantId: string }>;
}

export const metadata: Metadata = {
  title: "Campus Store Menu & Orders",
  description: "Browse menu, configure add-ons, and place orders with verified campus stores.",
  robots: { index: true, follow: true },
};

export default async function StorePage({ params }: StorePageProps) {
  const { merchantId } = await params;
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <StoreClient merchantId={merchantId} profileId={profile.id} />;
}
