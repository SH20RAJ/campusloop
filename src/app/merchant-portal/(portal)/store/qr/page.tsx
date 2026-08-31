import type { Metadata } from "next";
import { MerchantQrClient } from "./merchant-qr-client";

export const metadata: Metadata = {
  title: "Printable QR Code | Merchant Portal",
  description: "Download and print store QR codes for offline customer ordering.",
  robots: { index: false, follow: false },
};

export default function MerchantQrPage() {
  return <MerchantQrClient />;
}
