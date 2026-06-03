import type { InferSelectModel } from "drizzle-orm";

import type { posts } from "@/db/schema";

type ContentStatus = InferSelectModel<typeof posts>["status"];

type SafetyDecision = {
	status: ContentStatus;
	riskScore: number;
	blocked: boolean;
	messages: string[];
};

const checks = [
	{
		name: "phone number",
		risk: 35,
		message: "Remove phone numbers before posting.",
		pattern: /(?:\+?91[-.\s]?)?[6-9]\d{9}\b/,
	},
	{
		name: "email address",
		risk: 30,
		message: "Remove email addresses before posting.",
		pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
	},
	{
		name: "address",
		risk: 35,
		message: "Avoid sharing exact addresses, rooms, hostels, or private locations.",
		pattern: /\b(?:room|flat|house|hostel|block|wing|sector|street|lane|near)\s+[a-z0-9-]{1,20}\b/i,
	},
	{
		name: "doxxing",
		risk: 70,
		message: "Posts that expose private identity or contact details need review.",
		pattern: /\b(?:dox|doxx|leak|expose|address is|phone is|number is)\b/i,
	},
	{
		name: "threat",
		risk: 90,
		message: "Threats or calls for violence are not allowed.",
		pattern: /\b(?:i will kill|kill them|beat them up|attack|stab|shoot|bomb|set fire)\b/i,
		block: true,
	},
	{
		name: "severe abuse",
		risk: 80,
		message: "Severe abuse or targeted harassment is not allowed.",
		pattern: /\b(?:kill yourself|kys|go die|ruin their life)\b/i,
		block: true,
	},
] as const;

export function runSafetyCheck(input: { title?: string | null; body: string }): SafetyDecision {
	const content = `${input.title ?? ""}\n${input.body}`.trim();
	const messages = new Set<string>();
	let riskScore = 0;
	let blocked = false;

	for (const check of checks) {
		if (check.pattern.test(content)) {
			riskScore += check.risk;
			messages.add(check.message);
			blocked = blocked || Boolean("block" in check && check.block);
		}
	}

	const repeatedInsults = content.match(/\b(?:idiot|loser|trash|creep|fraud)\b/gi)?.length ?? 0;
	if (repeatedInsults >= 3) {
		riskScore += 25;
		messages.add("This looks like targeted abuse. Rewrite it to criticize behavior without harassment.");
	}

	if (blocked) {
		return {
			status: "PENDING_REVIEW",
			riskScore: Math.min(riskScore, 100),
			blocked: true,
			messages: Array.from(messages),
		};
	}

	return {
		status: riskScore >= 45 ? "PENDING_REVIEW" : "PUBLISHED",
		riskScore: Math.min(riskScore, 100),
		blocked: false,
		messages: Array.from(messages),
	};
}
