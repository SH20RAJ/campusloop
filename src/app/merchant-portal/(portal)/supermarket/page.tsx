import type { Metadata } from "next";
import { SupermarketDashboardClient } from "./supermarket-dashboard-client";

export const metadata: Metadata = {
  title: "Supermarket Console | Merchant Portal",
  description: "Campus mart inventory tracking, fast packing pipeline, and daily revenue stats.",
  robots: { index: false, follow: false },
};

export default function SupermarketDashboardPage() {
  return <SupermarketDashboardClient />;
}
