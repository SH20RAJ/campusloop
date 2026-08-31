import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser } from "@/lib/server-cache";
import { FoodOrdersClient } from "./food-orders-client";

export const metadata: Metadata = {
  title: "Food & Canteen Orders | CampusLoop",
  description: "Track your live canteen and hostel food delivery orders.",
  robots: { index: false, follow: false },
};

export default async function FoodOrdersPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  return <FoodOrdersClient />;
}
