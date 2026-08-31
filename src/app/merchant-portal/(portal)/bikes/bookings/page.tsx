import type { Metadata } from "next";
import { MerchantBikeBookingsClient } from "./merchant-bike-bookings-client";

export const metadata: Metadata = {
  title: "Bike Reservations Pipeline | Merchant Portal",
  description: "Approve student reservations, track active rentals, and settle return deposits.",
  robots: { index: false, follow: false },
};

export default function MerchantBikeBookingsPage() {
  return <MerchantBikeBookingsClient />;
}
