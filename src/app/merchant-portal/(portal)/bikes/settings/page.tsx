import type { Metadata } from "next";
import { MerchantBikeSettingsClient } from "./merchant-bike-settings-client";

export const metadata: Metadata = {
  title: "Rental Rules & Settings | Merchant Portal | CampusLoop",
  description: "Configure bike rental duration, deposit rules, and pickup locations.",
  robots: { index: false, follow: false },
};

export default function MerchantBikeSettingsPage() {
  return <MerchantBikeSettingsClient />;
}
