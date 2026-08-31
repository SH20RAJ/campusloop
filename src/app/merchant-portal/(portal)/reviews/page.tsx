import type { Metadata } from "next";
import { MerchantReviewsClient } from "./merchant-reviews-client";

export const metadata: Metadata = {
  title: "Customer Reviews | Merchant Portal",
  description: "Read and reply to student reviews and ratings.",
  robots: { index: false, follow: false },
};

export default function MerchantReviewsPage() {
  return <MerchantReviewsClient />;
}
