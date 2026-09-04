import { describe, expect, it } from "vitest";
import { getCloutTier, isAutoVerified } from "../constants/gamification";
import { DEMO_CREDENTIALS } from "./demo-credentials";

describe("Public Demo Account Specification & Verification Invariants", () => {
  it("has the expected public demo email and credentials", () => {
    expect(DEMO_CREDENTIALS.email).toBe("demo@campusloop.space");
    expect(DEMO_CREDENTIALS.password).toBe("CampusLoop@2026!");
    expect(DEMO_CREDENTIALS.username).toBe("demo_tester");
    expect(DEMO_CREDENTIALS.points).toBeGreaterThanOrEqual(150);
  });

  it("qualifies for Gold Star tier and automatic blue tick verification", () => {
    const tier = getCloutTier(DEMO_CREDENTIALS.points);
    expect(tier.tierName).toBe("Gold Star");
    expect(tier.hasBlueTick).toBe(true);
    expect(isAutoVerified(DEMO_CREDENTIALS.points)).toBe(true);
  });

  it("extracts college domain correctly for campusloop.space", () => {
    const domain = DEMO_CREDENTIALS.email.split("@")[1]?.toLowerCase();
    expect(domain).toBe("campusloop.space");
  });

  it("generates a valid student referral link structure", () => {
    const refUrl = `https://campusloop.space/join?ref=${DEMO_CREDENTIALS.username}`;
    expect(refUrl).toContain("/join?ref=demo_tester");
  });
});
