import { describe, expect, it } from "vitest";
import {
  generateMerchantPassword,
  hashMerchantPassword,
  isHashedPassword,
  stripMerchantSecrets,
  verifyMerchantPassword,
} from "./merchant-password";

describe("hashing", () => {
  it("round-trips a correct password", async () => {
    const stored = await hashMerchantPassword("canteen@password123");
    const result = await verifyMerchantPassword("canteen@password123", stored);
    expect(result.valid).toBe(true);
    expect(result.needsRehash).toBe(false);
  });

  it("rejects a wrong password", async () => {
    const stored = await hashMerchantPassword("canteen@password123");
    expect((await verifyMerchantPassword("canteen@password124", stored)).valid).toBe(false);
    expect((await verifyMerchantPassword("", stored)).valid).toBe(false);
  });

  it("never stores the password itself", async () => {
    const stored = await hashMerchantPassword("momo@password123");
    expect(stored).not.toContain("momo@password123");
    expect(isHashedPassword(stored)).toBe(true);
  });

  it("salts, so the same password hashes differently every time", async () => {
    const a = await hashMerchantPassword("same-password");
    const b = await hashMerchantPassword("same-password");
    expect(a).not.toBe(b);
    // ...and both still verify.
    expect((await verifyMerchantPassword("same-password", a)).valid).toBe(true);
    expect((await verifyMerchantPassword("same-password", b)).valid).toBe(true);
  });
});

describe("the two login backdoors that used to exist", () => {
  it("an account with no password stored cannot be logged into", async () => {
    // The old route skipped its whole password check when this was empty, so
    // any password logged in — and was then saved as the real one.
    for (const stored of [null, undefined, ""]) {
      const result = await verifyMerchantPassword("literally anything", stored);
      expect(result.valid).toBe(false);
    }
  });

  it("does not accept a password derived from the store slug", async () => {
    // `store@<slug>` used to be accepted even for accounts with a real
    // password set. Slugs are public, so it was a master key.
    const stored = await hashMerchantPassword("the-real-password");
    expect((await verifyMerchantPassword("store@sharma-ji-canteen", stored)).valid).toBe(false);
  });
});

describe("legacy plaintext migration", () => {
  it("accepts a correct legacy password once and asks to be rehashed", async () => {
    const result = await verifyMerchantPassword("canteen@password123", "canteen@password123");
    expect(result.valid).toBe(true);
    expect(result.needsRehash).toBe(true);
  });

  it("still rejects a wrong legacy password", async () => {
    const result = await verifyMerchantPassword("guess", "canteen@password123");
    expect(result.valid).toBe(false);
  });

  it("survives a malformed stored hash without throwing", async () => {
    for (const junk of ["pbkdf2$", "pbkdf2$abc$$", "pbkdf2$0$c2FsdA==$aGFzaA=="]) {
      const result = await verifyMerchantPassword("anything", junk);
      expect(result.valid).toBe(false);
    }
  });
});

describe("generateMerchantPassword", () => {
  it("avoids characters that get misheard when read aloud", () => {
    for (let i = 0; i < 40; i++) {
      const password = generateMerchantPassword();
      expect(password.startsWith("cl-")).toBe(true);
      expect(password.slice(3)).not.toMatch(/[oil01]/);
    }
  });

  it("does not repeat", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateMerchantPassword()));
    expect(seen.size).toBe(200);
  });
});

describe("stripMerchantSecrets", () => {
  it("removes the credential before a row leaves the server", () => {
    const safe = stripMerchantSecrets({
      id: "m1",
      name: "Sharma Ji Canteen",
      loginUsername: "sharma-ji",
      loginPassword: "pbkdf2$210000$abc$def",
    });
    expect(safe).not.toHaveProperty("loginPassword");
    expect(safe.name).toBe("Sharma Ji Canteen");
    expect(safe.loginUsername).toBe("sharma-ji");
  });
});
