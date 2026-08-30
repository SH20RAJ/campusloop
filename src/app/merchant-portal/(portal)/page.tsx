import type { Metadata } from "next";
import { MerchantDashboardClient } from "./merchant-dashboard-client";

export const metadata: Metadata = {
  title: "Merchant Dashboard | CampusLoop",
  description: "Live partner dashboard with incoming orders, daily revenue, and store controls.",
  robots: { index: false, follow: false },
};

export default function MerchantDashboardPage() {
  return <MerchantDashboardClient />;
}
