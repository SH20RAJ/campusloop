import { Metadata } from "next";
import { MerchantFleetClient } from "./merchant-fleet-client";

export const metadata: Metadata = {
  title: "Fleet Vehicles | Merchant Portal | CampusLoop",
  description: "Manage registered scooters, bikes, and vehicle inventory.",
  robots: { index: false, follow: false },
};

export default function MerchantFleetPage() {
  return <MerchantFleetClient />;
}
