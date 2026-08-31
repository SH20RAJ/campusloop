import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser } from "@/lib/server-cache";
import { BikeBookingClient } from "./bike-booking-client";

interface BikeBookingPageProps {
  params: Promise<{ bookingId: string }>;
}

export const metadata: Metadata = {
  title: "Track Bike Reservation | CampusLoop Marketplace",
  description: "Live real-time reservation status, pickup instructions, and deposit refund tracking.",
  robots: { index: false, follow: false },
};

export default async function BikeBookingPage({ params }: BikeBookingPageProps) {
  const { bookingId } = await params;
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  return <BikeBookingClient bookingId={bookingId} />;
}
