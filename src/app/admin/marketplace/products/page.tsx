import { Metadata } from "next";
import { AdminMarketplaceClient } from "../admin-marketplace-client";

export const metadata: Metadata = {
  title: "Products Catalog | CampusLoop Admin",
  description: "Browse and manage products across all campus merchants.",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return <AdminMarketplaceClient />;
}
