import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

/**
 * Designated authorized administrator emails.
 * Users logged in with these emails are automatically granted ADMIN privileges.
 */
export const ADMIN_EMAILS = [
  "sh20raj@gmail.com",
  "btech10574.24@bitmesra.ac.in",
] as const;

/**
 * Checks if the given email is an authorized administrator email (case-insensitive).
 */
export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
}

function requireSecret(name: "ADMIN_SESSION_SECRET"): string {
  const value = process.env[name];
  if (value && value.length >= 6) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required secret ${name}. Set it via wrangler secret put ${name}.`);
  }

  return `${name}-dev-secret`;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function sign(payload: string, expiresAt: number): string {
  return createHmac("sha256", requireSecret("ADMIN_SESSION_SECRET"))
    .update(`${payload}.${expiresAt}`)
    .digest("base64url");
}

/**
 * Signed, expiring session token: `<expiresAt>.<hmac>`.
 */
export function createAdminSessionToken(email?: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = email ? `admin:${email.toLowerCase()}` : "admin";
  return `${expiresAt}.${sign(payload, expiresAt)}`;
}

export function isValidAdminSessionToken(token: string | undefined | null, email?: string): boolean {
  if (!token) return false;

  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0) return false;

  const expiresPart = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expiresAt = Number(expiresPart);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Date.now()) return false;

  const payload = email ? `admin:${email.toLowerCase()}` : "admin";
  return safeEqual(signature, sign(payload, expiresAt));
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE;
export const ADMIN_SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
