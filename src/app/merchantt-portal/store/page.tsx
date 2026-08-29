import { Metadata } from "next";
import { MerchantStoreClient } from "./merchant-store-client";

export const metadata: Metadata = {
  title: "Store Settings | Merchant Portal | CampusLoop",
  description: "Configure store details, delivery radius, and prep timing.",
  robots: { index: false, follow: false },
};

export default function MerchantStorePage() {
  return <MerchantStoreClient />;
}
