import { clearMerchantSessionCookie } from "@/lib/merchant-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out from merchant portal" });
  clearMerchantSessionCookie(res);
  return res;
}
