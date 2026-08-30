import { describe, expect, it } from "vitest";

/**
 * Guards for the campus upgrade. These encode the rules that were violated by
 * the original endpoint, so a regression fails here rather than in production.
 */

// Mirrors the shape check in campus-upgrade.ts.
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

describe("campus upgrade email shape", () => {
  it("accepts real college addresses", () => {
    expect(looksLikeEmail("btech10223.25@bitmesra.ac.in")).toBe(true);
    expect(looksLikeEmail("student@iitb.ac.in")).toBe(true);
  });

  it("rejects input that is not an address", () => {
    for (const bad of ["", "   ", "bitmesra.ac.in", "@bitmesra.ac.in", "a@b", "a b@c.in", "a@b.c"]) {
      expect(looksLikeEmail(bad)).toBe(false);
    }
  });
});

describe("campus upgrade contract", () => {
  it("never reads an institution id from the request body", async () => {
    // The caller choosing its own campus was a full bypass of domain checking.
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("src/app/api/profile/upgrade-campus/route.ts", "utf8")
    );
    expect(source).not.toMatch(/body\.institutionId/);
    expect(source).not.toMatch(/institutionId\s*[,}]/);
  });

  it("resolves the campus only from the whitelisted domain table", async () => {
    const source = await import("node:fs").then((fs) => fs.readFileSync("src/lib/campus-upgrade.ts", "utf8"));
    expect(source).toMatch(/institutionDomains\.domain/);
    // Fuzzy website/slug matching is not proof of enrolment.
    expect(source).not.toMatch(/ilike\(institutions\.website/);
    expect(source).not.toMatch(/ilike\(institutions\.slug/);
  });

  it("refuses to apply the upgrade unless the channel is verified", async () => {
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("src/app/api/profile/upgrade-campus/confirm/route.ts", "utf8")
    );
    expect(source).toMatch(/if \(!collegeChannel\.isVerified\)/);
    // The verification gate must come before any write to the profile.
    expect(source.indexOf("isVerified")).toBeLessThan(source.indexOf("db\n      .update"));
  });

  it("keeps the same profile row instead of copying and deleting", async () => {
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("src/app/api/profile/upgrade-campus/confirm/route.ts", "utf8")
    );
    expect(source).toMatch(/\.update\(userProfiles\)/);
    expect(source).not.toMatch(/\.delete\(userProfiles\)/);
    expect(source).not.toMatch(/insert\(userProfiles\)/);
  });

  it("only grants campus access at onboarding for a verified address", async () => {
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync("src/app/app/onboarding/actions.ts", "utf8")
    );
    expect(source).toMatch(/user\.primaryEmailVerified/);
    expect(source).toMatch(/isVerifiedCollegeEmail/);
  });
});
