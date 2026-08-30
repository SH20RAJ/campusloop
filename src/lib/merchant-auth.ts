import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getDb } from "@/db";
import { merchants } from "@/db/schema";

const MERCHANT_COOKIE_NAME = "campusloop_merchant_session";
const SESSION_SECRET = process.env.MERCHANT_AUTH_SECRET || "campusloop-merchant-secret-key-2026";

/**
 * Creates a signed session token for a merchant.
 */
export async function createMerchantSessionToken(merchantId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = `${merchantId}:${Date.now()}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const payload = Buffer.from(JSON.stringify({ merchantId, data, sigHex })).toString("base64url");
  return payload;
}

/**
 * Verifies a session token and returns the merchantId if valid.
 */
export async function verifyMerchantSessionToken(token: string): Promise<string | null> {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const { merchantId, data, sigHex } = JSON.parse(raw);
    if (!merchantId || !data || !sigHex) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []);

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data));
    return isValid ? merchantId : null;
  } catch {
    return null;
  }
}

/**
 * Resolves the authenticated merchant from cookies or server requests.
 */
export async function getAuthenticatedMerchant(): Promise<typeof merchants.$inferSelect | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(MERCHANT_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    const merchantId = await verifyMerchantSessionToken(sessionCookie);
    if (!merchantId) return null;

    const db = getDb();
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, merchantId),
    });

    return merchant || null;
  } catch (err) {
    console.error("Error resolving merchant session:", err);
    return null;
  }
}

/**
 * Attaches the merchant session cookie to a response.
 */
export function setMerchantSessionCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: MERCHANT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Clears the merchant session cookie from a response.
 */
export function clearMerchantSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: MERCHANT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
