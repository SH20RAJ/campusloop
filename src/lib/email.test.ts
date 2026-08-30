import { describe, expect, it } from "vitest";
import { sendEmail } from "./email";
import { buildNotificationEmail, buildWelcomeEmail } from "./email-templates";

describe("Cloudflare Email Sending & Templates", () => {
  it("builds notification email with correct subject and snippet", () => {
    const notification = buildNotificationEmail({
      recipientName: "Shreemaya",
      actorName: "ananya_k",
      type: "MENTION",
      snippet: "Did you submit the assignment for machine learning?",
    });

    expect(notification.subject).toContain("@ananya_k mentioned you");
    expect(notification.html).toContain("Shreemaya");
    expect(notification.html).toContain("Did you submit the assignment");
    expect(notification.text).toContain("View it on CampusLoop");
  });

  it("builds match notification email correctly", () => {
    const matchEmail = buildNotificationEmail({
      recipientName: "Devanshu",
      actorName: "priya_sharma",
      type: "MATCH",
    });

    expect(matchEmail.subject).toContain("Mutual Match");
    expect(matchEmail.html).toContain("@priya_sharma");
  });

  it("builds welcome verification email with college branding", () => {
    const welcome = buildWelcomeEmail({
      displayName: "Kabir",
      collegeName: "Birla Institute of Technology, Mesra",
    });

    expect(welcome.subject).toContain("Welcome to CampusLoop");
    expect(welcome.subject).toContain("Birla Institute of Technology, Mesra");
    expect(welcome.html).toContain("Birla Institute of Technology, Mesra");
    expect(welcome.html).toContain("Campus Feed");
  });

  it("sendEmail succeeds cleanly with simulated delivery in test environment", async () => {
    const result = await sendEmail({
      to: "test-student@bitmesra.ac.in",
      subject: "Test CampusLoop Notification",
      text: "Hello from unit test!",
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(["cloudflare-worker", "cloudflare-api", "simulated"]).toContain(result.provider!);
  });

  it("sendEmail rejects empty recipients gracefully", async () => {
    const result = await sendEmail({
      to: [],
      subject: "Empty recipient test",
      text: "Should fail validation",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("No recipients");
  });
});
