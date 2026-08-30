import { describe, expect, it } from "bun:test";
import { hasCapability, UserCapability } from "./capabilities";

describe("Campus Preview Capabilities Engine", () => {
  it("allows unauthenticated/guest users only READ_PUBLIC_CONTENT", async () => {
    expect(await hasCapability(null, "READ_PUBLIC_CONTENT")).toBe(true);
    expect(await hasCapability(null, "SAVE_POST")).toBe(false);
    expect(await hasCapability(null, "LIKE_POST")).toBe(false);
    expect(await hasCapability(null, "COMMENT_POST")).toBe(false);
  });

  it("allows VIEWER role users to READ_PUBLIC_CONTENT and SAVE_POST but blocks writes", async () => {
    const viewerProfile = {
      institutionId: "inst_random_viewer",
      role: "VIEWER" as const,
    };

    expect(await hasCapability(viewerProfile, "READ_PUBLIC_CONTENT")).toBe(true);
    expect(await hasCapability(viewerProfile, "SAVE_POST")).toBe(true);
    expect(await hasCapability(viewerProfile, "LIKE_POST")).toBe(false);
    expect(await hasCapability(viewerProfile, "COMMENT_POST")).toBe(false);
    expect(await hasCapability(viewerProfile, "CREATE_POST")).toBe(false);
    expect(await hasCapability(viewerProfile, "SEND_MESSAGE")).toBe(false);
    expect(await hasCapability(viewerProfile, "CAMPUS_MATCH")).toBe(false);
    expect(await hasCapability(viewerProfile, "SECRET_CRUSH")).toBe(false);
  });

  it("allows verified STUDENT users all capabilities", async () => {
    const studentProfile = {
      institutionId: "inst_bitmesra",
      role: "STUDENT" as const,
    };

    const allCapabilities: UserCapability[] = [
      "READ_PUBLIC_CONTENT",
      "SAVE_POST",
      "LIKE_POST",
      "COMMENT_POST",
      "CREATE_POST",
      "JOIN_COMMUNITY",
      "SEND_MESSAGE",
      "CAMPUS_MATCH",
      "SECRET_CRUSH",
      "ANONYMOUS_POST",
      "MARKETPLACE_ORDER",
    ];

    for (const cap of allCapabilities) {
      expect(await hasCapability(studentProfile, cap)).toBe(true);
    }
  });
});
