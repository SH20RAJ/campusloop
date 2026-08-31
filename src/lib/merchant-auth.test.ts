import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createMerchantSessionToken, verifyMerchantSessionToken } from "./merchant-auth";

const SECRET = "test-secret-that-is-long-enough";
const ORIGINAL = process.env.MERCHANT_AUTH_SECRET;

// The secret is read inside each call rather than at module load, so these
// tests can rotate it in place without re-importing the module.
beforeAll(() => {
  process.env.MERCHANT_AUTH_SECRET = SECRET;
});
afterAll(() => {
  process.env.MERCHANT_AUTH_SECRET = ORIGINAL;
});

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
}

function splitToken(token: string) {
  const at = token.indexOf(".");
  return { payload: token.slice(0, at), signature: token.slice(at + 1) };
}

function decodeClaims(token: string) {
  return JSON.parse(fromBase64Url(splitToken(token).payload)) as {
    mid: string;
    iat: number;
    exp: number;
  };
}

/** Mint a properly signed token with arbitrary claims, using the real secret. */
async function signClaims(claims: object, secret = SECRET): Promise<string> {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(claims)));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

describe("merchant session tokens", () => {
  it("round-trips the merchant id", async () => {
    const token = await createMerchantSessionToken("merchant-a");
    expect(await verifyMerchantSessionToken(token)).toBe("merchant-a");
  });

  it("cannot be re-pointed at another merchant", async () => {
    // The original format shipped the merchant id as a sibling field next to
    // the signature, and returned that field after verifying only the *other*
    // one — so any merchant holding a legitimate token could swap in a rival's
    // id and be authenticated as them. Here the id is inside the signed
    // payload, so editing it breaks the signature.
    const token = await createMerchantSessionToken("merchant-a");
    const { signature } = splitToken(token);
    const claims = decodeClaims(token);

    const forgedPayload = toBase64Url(
      new TextEncoder().encode(JSON.stringify({ ...claims, mid: "merchant-victim" }))
    );

    expect(await verifyMerchantSessionToken(`${forgedPayload}.${signature}`)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const foreign = await signClaims(
      { mid: "merchant-a", iat: 0, exp: Math.floor(Date.now() / 1000) + 999 },
      "some-other-secret-entirely"
    );
    expect(await verifyMerchantSessionToken(foreign)).toBeNull();
  });

  it("rejects a correctly signed but expired token", async () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    const expired = await signClaims({ mid: "merchant-a", iat: past - 100, exp: past });

    // Signature is genuine — this is purely the expiry check. Without it a
    // leaked cookie would work forever.
    expect(await verifyMerchantSessionToken(expired)).toBeNull();
  });

  it("rejects a token with no expiry at all", async () => {
    const noExpiry = await signClaims({ mid: "merchant-a", iat: 0 });
    expect(await verifyMerchantSessionToken(noExpiry)).toBeNull();
  });

  it("issues a 30-day expiry", async () => {
    const claims = decodeClaims(await createMerchantSessionToken("merchant-a"));
    expect(claims.exp - claims.iat).toBe(60 * 60 * 24 * 30);
    expect(claims.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("rejects structurally invalid tokens without throwing", async () => {
    for (const junk of ["", ".", "no-separator", "a.b", "....", "%%%.%%%"]) {
      expect(await verifyMerchantSessionToken(junk)).toBeNull();
    }
  });
});

describe("secret configuration", () => {
  it("fails closed when MERCHANT_AUTH_SECRET is missing or too short", async () => {
    // There used to be a hardcoded fallback here, so production — where the
    // variable was never set — signed every session with a constant committed
    // to a public repository.
    for (const bad of ["", "short"]) {
      process.env.MERCHANT_AUTH_SECRET = bad;
      await expect(createMerchantSessionToken("merchant-a")).rejects.toThrow(/MERCHANT_AUTH_SECRET/);
    }
    process.env.MERCHANT_AUTH_SECRET = SECRET;
  });

  it("does not authenticate anyone while the secret is missing", async () => {
    const token = await createMerchantSessionToken("merchant-a");
    process.env.MERCHANT_AUTH_SECRET = "";
    expect(await verifyMerchantSessionToken(token)).toBeNull();
    process.env.MERCHANT_AUTH_SECRET = SECRET;
  });
});
