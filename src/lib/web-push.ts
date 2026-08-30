/**
 * Minimal Web Push sender built on Web Crypto, so it runs on Cloudflare
 * Workers where the usual `web-push` package (Node crypto) cannot.
 *
 * Pushes are sent as "tickles" — VAPID-authenticated, with no encrypted
 * payload. The service worker wakes, fetches the student's own recent
 * notifications over their session, and renders from that. This keeps
 * notification content off third-party push infrastructure entirely and
 * avoids hand-rolling RFC 8291 payload encryption.
 */

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function jsonToBase64Url(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export function getVapidKeys(): VapidKeys | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@campusloop.space";

  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

/**
 * An uncompressed P-256 public key is 0x04 || X(32) || Y(32); the JWK import
 * needs X and Y split back out, alongside the raw private scalar as `d`.
 */
async function importVapidSigningKey(keys: VapidKeys): Promise<CryptoKey> {
  const publicBytes = base64UrlToBytes(keys.publicKey);
  if (publicBytes.length !== 65 || publicBytes[0] !== 0x04) {
    throw new Error("VAPID_PUBLIC_KEY must be an uncompressed P-256 point (65 bytes)");
  }

  return crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      x: bytesToBase64Url(publicBytes.slice(1, 33)),
      y: bytesToBase64Url(publicBytes.slice(33, 65)),
      d: keys.privateKey,
      ext: true,
    },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}

async function createVapidHeader(endpoint: string, keys: VapidKeys): Promise<string> {
  const audience = new URL(endpoint).origin;
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: keys.subject,
  };

  const signingInput = `${jsonToBase64Url(header)}.${jsonToBase64Url(payload)}`;
  const signingKey = await importVapidSigningKey(keys);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    signingKey,
    new TextEncoder().encode(signingInput)
  );

  return `vapid t=${signingInput}.${bytesToBase64Url(signature)}, k=${keys.publicKey}`;
}

export type PushResult = "sent" | "expired" | "failed" | "not-configured";

/**
 * Send one payload-less push. "expired" means the endpoint is dead (404/410)
 * and the caller should drop the stored subscription.
 */
export async function sendPushTickle(
  endpoint: string,
  urgency: "normal" | "high" = "normal"
): Promise<PushResult> {
  const keys = getVapidKeys();
  if (!keys) return "not-configured";

  try {
    const authorization = await createVapidHeader(endpoint, keys);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authorization,
        TTL: "86400",
        Urgency: urgency,
        "Content-Length": "0",
      },
    });

    if (res.status === 404 || res.status === 410) return "expired";
    if (!res.ok) {
      console.warn(`Web push rejected (${res.status}): ${await res.text().catch(() => "")}`);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("Web push send failed:", error);
    return "failed";
  }
}
