import type { Metadata } from "next";
import { AdminNewMerchantClient } from "./admin-new-merchant-client";

export const metadata: Metadata = {
  title: "Onboard Merchant",
  description: "Register a local business to start selling on the campus marketplace.",
  robots: { index: false, follow: false },
};

export default function AdminNewMerchantPage() {
  return <AdminNewMerchantClient />;
}
