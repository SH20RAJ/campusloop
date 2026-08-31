import type { Metadata } from "next";
import { AdminMarketplaceClient } from "./admin-marketplace-client";

export const metadata: Metadata = {
  title: "Marketplace Management",
  description: "Manage local business onboarding, product catalogs, and campus commerce.",
  robots: { index: false, follow: false },
};

export default function AdminMarketplacePage() {
  return <AdminMarketplaceClient />;
}
