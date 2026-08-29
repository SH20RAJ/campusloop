import { getCachedAuthUser } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrdersClient } from "./orders-client";

export const metadata: Metadata = {
  title: "My Campus Orders | CampusLoop Marketplace",
  description: "View and track all your active and previous campus marketplace orders.",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  return <OrdersClient />;
}
