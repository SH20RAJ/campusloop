import { Metadata } from "next";
import { MerchantProductsClient } from "./merchant-products-client";

export const metadata: Metadata = {
  title: "Menu & Products | Merchant Portal | CampusLoop",
  description: "Manage product listings, pricing, and availability.",
  robots: { index: false, follow: false },
};

export default function MerchantProductsPage() {
  return <MerchantProductsClient />;
}
