import type { Metadata } from "next";
import { MerchantAvailabilityClient } from "./merchant-availability-client";

export const metadata: Metadata = {
  title: "Availability Calendar | Merchant Portal | CampusLoop",
  description: "Manage time slot availability, maintenance schedules, and locked bookings.",
  robots: { index: false, follow: false },
};

export default function MerchantAvailabilityPage() {
  return <MerchantAvailabilityClient />;
}
