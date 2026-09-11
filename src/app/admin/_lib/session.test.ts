import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
  ADMIN_EMAILS,
  createAdminSessionToken,
  isAllowedAdminEmail,
  isValidAdminSessionToken,
} = await import("./session");

describe("Admin Email Authorization & Session Security", () => {
  it("recognizes authorized administrator emails (sh20raj@gmail.com, btech10574.24@bitmesra.ac.in)", () => {
    expect(ADMIN_EMAILS).toContain("sh20raj@gmail.com");
    expect(ADMIN_EMAILS).toContain("btech10574.24@bitmesra.ac.in");

    // Exact matches
    expect(isAllowedAdminEmail("sh20raj@gmail.com")).toBe(true);
    expect(isAllowedAdminEmail("btech10574.24@bitmesra.ac.in")).toBe(true);

    // Case-insensitivity
    expect(isAllowedAdminEmail("SH20RAJ@GMAIL.COM")).toBe(true);
    expect(isAllowedAdminEmail("BTECH10574.24@BITMESRA.AC.IN")).toBe(true);
    expect(isAllowedAdminEmail(" Sh20Raj@gmail.com ")).toBe(true);
  });

  it("strictly rejects unauthorized emails and nullish values", () => {
    expect(isAllowedAdminEmail("hacker@malicious.com")).toBe(false);
    expect(isAllowedAdminEmail("student@iitb.ac.in")).toBe(false);
    expect(isAllowedAdminEmail("sh20raj@otherdomain.com")).toBe(false);
    expect(isAllowedAdminEmail("")).toBe(false);
    expect(isAllowedAdminEmail(null)).toBe(false);
    expect(isAllowedAdminEmail(undefined)).toBe(false);
  });

  it("creates and validates signed session tokens with HMAC integrity", () => {
    const token = createAdminSessionToken("sh20raj@gmail.com");
    expect(typeof token).toBe("string");
    expect(token.includes(".")).toBe(true);

    expect(isValidAdminSessionToken(token, "sh20raj@gmail.com")).toBe(true);
    expect(isValidAdminSessionToken(token, "btech10574.24@bitmesra.ac.in")).toBe(false);
    expect(isValidAdminSessionToken(null)).toBe(false);
    expect(isValidAdminSessionToken(undefined)).toBe(false);
    expect(isValidAdminSessionToken("invalid.token")).toBe(false);
    expect(isValidAdminSessionToken("9999999999999.fakename")).toBe(false);
  });
});
