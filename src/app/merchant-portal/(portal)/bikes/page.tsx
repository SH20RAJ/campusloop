import type { Metadata } from "next";
import { MerchantBikeDashboardClient } from "./merchant-bike-dashboard-client";

export const metadata: Metadata = {
  title: "Bike Rental Dashboard | Merchant Portal | CampusLoop",
  description: "Manage campus bike rentals, fleet availability, and active bookings.",
  robots: { index: false, follow: false },
};

export default function MerchantBikeDashboardPage() {
  return <MerchantBikeDashboardClient />;
}
