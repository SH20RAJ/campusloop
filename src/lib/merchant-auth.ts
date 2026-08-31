import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { getDb } from "@/db";
import { merchants } from "@/db/schema";

const MERCHANT_COOKIE_NAME = "campusloop_merchant_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * HMAC key for merchant portal sessions.
 *
 * Fails closed when unset. There used to be a hardcoded fallback here, which
 * meant production — where the variable was never configured — signed every
 * session with a constant committed to a public repository. Anyone who read
 * the source could mint a session for any store.
 */
function getSessionSecret(): string {
  const secret = process.env.MERCHANT_AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("MERCHANT_AUTH_SECRET is not configured. Set it before using the merchant portal.");
  }
  return secret;
}

async function importHmacKey(usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded + "=".repeat((4 - (padded.length % 4)) % 4)), (c) => c.charCodeAt(0));
}

interface SessionClaims {
  /** Merchant id. */
  mid: string;
  /** Issued at (seconds). */
  iat: number;
  /** Expires at (seconds). */
  exp: number;
}

/**
 * Creates a signed session token for a merchant.
 *
 * The token is `<base64url(claims)>.<base64url(signature)>` and the merchant id
 * lives *inside* the signed claims. The previous format shipped the merchant id
 * as a sibling field next to the signature and returned that field after
 * verifying only the other one — so any merchant holding a legitimate token
 * could swap in another store's id and be authenticated as them.
 */
export async function createMerchantSessionToken(merchantId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = { mid: merchantId, iat: now, exp: now + SESSION_TTL_SECONDS };

  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(claims)));
  const key = await importHmacKey(["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));

  return `${payload}.${toBase64Url(signature)}`;
}

/**
 * Verifies a session token and returns the merchantId if valid.
 *
 * The id is read only from the verified payload, never from anything the
 * caller supplied alongside it.
 */
export async function verifyMerchantSessionToken(token: string): Promise<string | null> {
  try {
    const separator = token.indexOf(".");
    if (separator === -1) return null;

    const payload = token.slice(0, separator);
    const signature = token.slice(separator + 1);
    if (!payload || !signature) return null;

    const key = await importHmacKey(["verify"]);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature) as BufferSource,
      new TextEncoder().encode(payload)
    );
    if (!isValid) return null;

    const claims = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as SessionClaims;
    if (!claims?.mid || typeof claims.mid !== "string") return null;

    // An unchecked expiry made every token eternal; a leaked cookie never
    // stopped working.
    if (typeof claims.exp !== "number" || claims.exp <= Math.floor(Date.now() / 1000)) return null;

    return claims.mid;
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

    if (!merchant) return null;

    // Status is re-checked on every request, not just at login: suspending a
    // store must take effect immediately, not in 30 days when its cookie
    // happens to expire.
    if (merchant.status === "SUSPENDED" || merchant.status === "CLOSED") return null;

    return merchant;
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
    maxAge: SESSION_TTL_SECONDS,
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
