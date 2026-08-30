import { getAuthenticatedMerchant } from "@/lib/merchant-auth";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { MerchantLayoutClient } from "../merchant-layout-client";

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
  // 1. Try direct merchant session cookie
  const directMerchant = await getAuthenticatedMerchant();
  if (directMerchant) {
    return (
      <MerchantLayoutClient
        merchant={directMerchant}
        profile={{
          displayName: directMerchant.name,
          username: directMerchant.loginUsername || directMerchant.slug,
          avatarUrl: directMerchant.logoUrl,
        }}
      >
        {children}
      </MerchantLayoutClient>
    );
  }

  // 2. Fallback to Hexclave user session
  const user = await getCachedAuthUser();
  if (user) {
    const profile = await getCachedUserProfile(user.id);
    if (profile) {
      return <MerchantLayoutClient profile={profile}>{children}</MerchantLayoutClient>;
    }
  }

  // 3. Not logged in -> Redirect to dedicated merchant login page
  redirect("/merchant-portal/login");
}
