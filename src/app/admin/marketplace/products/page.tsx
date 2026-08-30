import type { Metadata } from "next";
import { AdminProductsClient } from "./admin-products-client";

export const metadata: Metadata = {
  title: "Products Catalog | CampusLoop Admin",
  description: "Browse, audit, and manage product pricing and stock across all campus merchants.",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}
