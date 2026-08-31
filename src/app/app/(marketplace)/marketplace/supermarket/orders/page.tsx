import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser } from "@/lib/server-cache";
import { SupermarketOrdersClient } from "./supermarket-orders-client";

export const metadata: Metadata = {
  title: "Supermarket & Mart Orders | CampusLoop",
  description: "Track your live campus grocery, snack, and exam stationery orders.",
  robots: { index: false, follow: false },
};

export default async function SupermarketOrdersPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  return <SupermarketOrdersClient />;
}
