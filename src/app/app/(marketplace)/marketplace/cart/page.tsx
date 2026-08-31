import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser } from "@/lib/server-cache";
import { CartClient } from "./cart-client";

export const metadata: Metadata = {
  title: "Your Cart | Campus Marketplace",
  description: "Review items in your campus marketplace cart and proceed to checkout.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  return <CartClient />;
}
