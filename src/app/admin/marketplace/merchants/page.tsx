import type { Metadata } from "next";
import { AdminMerchantsClient } from "./admin-merchants-client";

export const metadata: Metadata = {
  title: "Merchants Directory | CampusLoop Admin",
  description: "Manage registered campus partner businesses and stores.",
  robots: { index: false, follow: false },
};

export default function AdminMerchantsPage() {
  return <AdminMerchantsClient />;
}
