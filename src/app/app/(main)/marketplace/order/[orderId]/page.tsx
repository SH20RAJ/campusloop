import { getCachedAuthUser } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderTrackingClient } from "./order-tracking-client";

interface OrderTrackingPageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "Track Campus Order | CampusLoop Marketplace",
  description: "Live real-time order tracking and store timeline.",
  robots: { index: false, follow: false },
};

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { orderId } = await params;
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  return <OrderTrackingClient orderId={orderId} />;
}
