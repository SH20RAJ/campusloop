import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Portal | CampusLoop",
  description: "Manage orders, menu items, business hours, and delivery settings for your campus store.",
  robots: { index: false, follow: false },
};

/**
 * Metadata-only shell. The session gate lives in the `(portal)` route group so
 * that `/merchant-portal/login` — which sits outside it — is reachable while
 * signed out. Gating here redirected the login page to itself forever.
 */
export default function MerchantPortalRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
