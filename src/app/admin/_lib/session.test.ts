import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createAdminSessionToken, isValidAdminSessionToken, verifyAdminPasskey } = await import("./session");

describe("Admin Passkey & Session Security", () => {
  it("verifies the configured admin passcode from .env (29092005)", () => {
    process.env.ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "29092005";
    // Correct passcode from .env.local
    expect(verifyAdminPasskey("29092005")).toBe(true);

    // Old passcode must be rejected
    expect(verifyAdminPasskey("17092006")).toBe(false);

    // Random wrong attempts must be rejected
    expect(verifyAdminPasskey("wrongpassword")).toBe(false);
    expect(verifyAdminPasskey("")).toBe(false);
    expect(verifyAdminPasskey("29092004")).toBe(false);
  });

  it("creates and verifies signed admin session tokens", () => {
    const token = createAdminSessionToken();
    expect(typeof token).toBe("string");
    expect(token.includes(".")).toBe(true);

    expect(isValidAdminSessionToken(token)).toBe(true);
    expect(isValidAdminSessionToken(null)).toBe(false);
    expect(isValidAdminSessionToken(undefined)).toBe(false);
    expect(isValidAdminSessionToken("invalid.token")).toBe(false);
    expect(isValidAdminSessionToken("9999999999999.fakename")).toBe(false);
  });

  it("throws error when ADMIN_PASSKEY is missing from environment without hardcoded fallback", () => {
    const originalPasskey = process.env.ADMIN_PASSKEY;
    try {
      delete process.env.ADMIN_PASSKEY;
      expect(() => verifyAdminPasskey("29092005")).toThrow("Missing required secret ADMIN_PASSKEY");
    } finally {
      process.env.ADMIN_PASSKEY = originalPasskey;
    }
  });
});
