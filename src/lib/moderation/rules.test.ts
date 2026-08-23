import { describe, expect, it } from "vitest";

import { runSafetyCheck } from "./rules";

describe("runSafetyCheck", () => {
	it("publishes clean content", () => {
		const result = runSafetyCheck({ body: "The canteen paneer today was elite, no notes." });
		expect(result.status).toBe("PUBLISHED");
		expect(result.blocked).toBe(false);
		expect(result.riskScore).toBe(0);
	});

	it("blocks explicit threats outright", () => {
		const result = runSafetyCheck({ body: "I will kill them during the fest" });
		expect(result.blocked).toBe(true);
		expect(result.status).toBe("PENDING_REVIEW");
		expect(result.riskScore).toBeGreaterThanOrEqual(90);
	});

	it("blocks severe abuse", () => {
		const result = runSafetyCheck({ body: "go die you loser" });
		expect(result.blocked).toBe(true);
	});

	it("flags phone numbers as doxxing risk", () => {
		const result = runSafetyCheck({ body: "ping me at 9876543210 for notes" });
		expect(result.riskScore).toBeGreaterThan(0);
		expect(result.messages.length).toBeGreaterThan(0);
	});

	it("flags email addresses", () => {
		const result = runSafetyCheck({ body: "send it to student@gmail.com please" });
		expect(result.riskScore).toBeGreaterThan(0);
	});

	it("sends high-risk doxxing content to pending review without blocking", () => {
		const result = runSafetyCheck({ body: "his room number is 42 in hostel block C, go expose him" });
		expect(result.blocked).toBe(false);
		expect(result.riskScore).toBeGreaterThanOrEqual(45);
		expect(result.status).toBe("PENDING_REVIEW");
	});

	it("scores repeated insults as targeted abuse", () => {
		const clean = runSafetyCheck({ body: "idiot" });
		const repeated = runSafetyCheck({ body: "you idiot loser trash human" });
		expect(repeated.riskScore).toBeGreaterThan(clean.riskScore);
	});

	it("caps the risk score at 100", () => {
		const result = runSafetyCheck({
			body: "I will kill them 9876543210 student@gmail.com room 42 hostel",
		});
		expect(result.riskScore).toBeLessThanOrEqual(100);
	});

	it("scans the title alongside the body", () => {
		const result = runSafetyCheck({ title: "call me", body: "nice post" });
		expect(result.riskScore).toBe(0);
		const withPhoneTitle = runSafetyCheck({ title: "contact 9876543210", body: "hi" });
		expect(withPhoneTitle.riskScore).toBeGreaterThan(0);
	});
});
