import type { Metadata } from "next";
import { MerchantLoginClient } from "./merchant-login-client";

export const metadata: Metadata = {
  title: "Merchant Portal Login | CampusLoop",
  description:
    "Sign in to your CampusLoop merchant console to manage food orders, store menu, and bike rentals.",
  robots: { index: false, follow: false },
};

export default function MerchantLoginPage() {
  return <MerchantLoginClient />;
}
