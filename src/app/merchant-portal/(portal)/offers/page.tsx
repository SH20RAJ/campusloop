import type { Metadata } from "next";
import { MerchantOffersClient } from "./merchant-offers-client";

export const metadata: Metadata = {
  title: "Offers & Promotions | Merchant Portal | CampusLoop",
  description: "Create and manage student deals and discounts.",
  robots: { index: false, follow: false },
};

export default function MerchantOffersPage() {
  return <MerchantOffersClient />;
}
