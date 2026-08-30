import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

function requireSecret(name: "ADMIN_PASSKEY" | "ADMIN_SESSION_SECRET"): string {
  const value = process.env[name];
  if (value && value.length >= 6) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required secret ${name}. Set it via wrangler secret put ${name}.`);
  }

  return name === "ADMIN_PASSKEY" ? "17092006" : `${name}-dev-secret`;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Constant-time passkey check against the ADMIN_PASSKEY secret. */
export function verifyAdminPasskey(input: string): boolean {
  return safeEqual(input, requireSecret("ADMIN_PASSKEY"));
}

function sign(payload: string, expiresAt: number): string {
  return createHmac("sha256", requireSecret("ADMIN_SESSION_SECRET"))
    .update(`${payload}.${expiresAt}`)
    .digest("base64url");
}

/**
 * Signed, expiring session token: `<expiresAt>.<hmac>`.
 * The cookie value alone is useless without ADMIN_SESSION_SECRET.
 */
export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  return `${expiresAt}.${sign("admin", expiresAt)}`;
}

export function isValidAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0) return false;

  const expiresPart = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expiresAt = Number(expiresPart);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Date.now()) return false;

  return safeEqual(signature, sign("admin", expiresAt));
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE;
export const ADMIN_SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
