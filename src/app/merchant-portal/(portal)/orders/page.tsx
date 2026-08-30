import type { Metadata } from "next";
import { MerchantOrdersClient } from "./merchant-orders-client";

export const metadata: Metadata = {
  title: "Merchant Orders Pipeline | CampusLoop",
  description: "Track and fulfill campus orders in real time.",
  robots: { index: false, follow: false },
};

export default function MerchantOrdersPage() {
  return <MerchantOrdersClient />;
}
