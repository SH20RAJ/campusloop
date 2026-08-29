import { Metadata } from "next";
import { MerchantBikeBookingDetailClient } from "./merchant-bike-booking-detail-client";

interface MerchantBikeBookingDetailPageProps {
  params: Promise<{ bookingId: string }>;
}

export const metadata: Metadata = {
  title: "Process Reservation & Inspection | Merchant Portal | CampusLoop",
  description: "Verify customer credentials, perform vehicle handover, and complete returns.",
  robots: { index: false, follow: false },
};

export default async function MerchantBikeBookingDetailPage({
  params,
}: MerchantBikeBookingDetailPageProps) {
  const { bookingId } = await params;
  return <MerchantBikeBookingDetailClient bookingId={bookingId} />;
}
