import type { Metadata } from "next";
import { MerchantNewBikeClient } from "./merchant-new-bike-client";

export const metadata: Metadata = {
  title: "Add Bike to Fleet | Merchant Portal | CampusLoop",
  description: "Register a new bike, scooter, or EV for student rentals.",
  robots: { index: false, follow: false },
};

export default function MerchantNewBikePage() {
  return <MerchantNewBikeClient />;
}
