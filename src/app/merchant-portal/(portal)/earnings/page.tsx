import type { Metadata } from "next";
import { MerchantEarningsClient } from "./merchant-earnings-client";

export const metadata: Metadata = {
  title: "Earnings & Statements | Merchant Portal",
  description: "Track store earnings, daily settlements, and revenue metrics.",
  robots: { index: false, follow: false },
};

export default function MerchantEarningsPage() {
  return <MerchantEarningsClient />;
}
