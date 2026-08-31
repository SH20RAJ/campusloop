import type { Metadata } from "next";
import { MerchantPWAInstallBanner } from "@/components/merchant/merchant-pwa-banner";

export const metadata: Metadata = {
  title: "Merchant Portal | CampusLoop",
  description: "Manage orders, menu items, business hours, and delivery settings for your campus store.",
  manifest: "/manifest-merchant.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Merchant App",
  },
  robots: { index: false, follow: false },
};

/**
 * Metadata shell. The session gate lives in the `(portal)` route group so
 * that `/merchant-portal/login` is reachable while signed out.
 */
export default function MerchantPortalRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MerchantPWAInstallBanner />
    </>
  );
}
