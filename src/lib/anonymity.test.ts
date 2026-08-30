import { beforeAll, describe, expect, it } from "vitest";

import { deriveAnonHandle, openSealedIdentity, sealIdentity } from "./anonymity";

beforeAll(() => {
  const env = process.env as Record<string, string | undefined>;
  env.ANON_PEPPER = "test-pepper-secret-0123456789abcdef";
  env.ANON_VAULT_SECRET = "test-vault-secret-0123456789abcdef";
  env.NODE_ENV = "test";
});

describe("deriveAnonHandle", () => {
  it("is deterministic for the same profile", () => {
    expect(deriveAnonHandle("prof_abc")).toBe(deriveAnonHandle("prof_abc"));
  });

  it("differs across profiles", () => {
    const handles = new Set(Array.from({ length: 50 }, (_, i) => deriveAnonHandle(`prof_${i}`)));
    expect(handles.size).toBe(50);
  });

  it("uses the anon_ prefix with fixed length", () => {
    const handle = deriveAnonHandle("prof_xyz");
    expect(handle).toMatch(/^anon_[0-9a-f]{12}$/);
  });

  it("changes when the pepper changes", () => {
    const handleBeforeRotation = deriveAnonHandle("prof_abc");
    const original = process.env.ANON_PEPPER;
    process.env.ANON_PEPPER = "a-completely-different-pepper";
    expect(deriveAnonHandle("prof_abc")).not.toBe(handleBeforeRotation);
    process.env.ANON_PEPPER = original;
  });
});

describe("sealIdentity / openSealedIdentity", () => {
  it("round-trips a profile id", () => {
    const sealed = sealIdentity("prof_roundtrip");
    expect(openSealedIdentity(sealed)).toBe("prof_roundtrip");
  });

  it("produces fresh ciphertext each time (random IV)", () => {
    expect(sealIdentity("prof_same")).not.toBe(sealIdentity("prof_same"));
  });

  it("rejects tampered ciphertext via GCM auth tag", () => {
    const sealed = sealIdentity("prof_tamper");
    const parts = sealed.split(".");
    const payload = Buffer.from(parts[2], "base64url");
    payload[0] ^= 0xff;
    parts[2] = payload.toString("base64url");
    expect(() => openSealedIdentity(parts.join("."))).toThrow();
  });

  it("rejects truncated and malformed payloads", () => {
    expect(() => openSealedIdentity("garbage")).toThrow();
    expect(() => openSealedIdentity("v9.abc.def.ghi")).toThrow();
  });

  it("cannot decrypt under a different vault secret", () => {
    const sealed = sealIdentity("prof_secretswap");
    process.env.ANON_VAULT_SECRET = "another-vault-secret-9876543210fedcba";
    expect(() => openSealedIdentity(sealed)).toThrow();
  });
});
