import { describe, expect, it } from "vitest";

import { getCloutTier, isAutoVerified } from "./gamification";
import { normalizeApiFeedSort, sortFeedPosts } from "./feed";

describe("getCloutTier", () => {
	it("starts everyone at Bronze Rookie", () => {
		expect(getCloutTier(0).tierName).toBe("Bronze Rookie");
	});

	it("crosses tiers at exact boundaries", () => {
		expect(getCloutTier(49).level).toBe(1);
		expect(getCloutTier(50).level).toBe(2);
		expect(getCloutTier(149).level).toBe(2);
		expect(getCloutTier(150).level).toBe(3);
		expect(getCloutTier(500).level).toBe(4);
		expect(getCloutTier(1000).level).toBe(5);
	});

	it("unlocks the blue tick only at Gold Star (150 LP)", () => {
		expect(getCloutTier(149).hasBlueTick).toBe(false);
		expect(getCloutTier(150).hasBlueTick).toBe(true);
	});

	it("matches isAutoVerified", () => {
		for (const points of [0, 100, 149, 150, 400, 900]) {
			expect(isAutoVerified(points)).toBe(points >= 150);
		}
	});
});

type SortablePost = {
	id: string;
	createdAt: Date | string;
	votesCount: number;
	commentsCount: number;
	institutionId: string;
};

function post(overrides: Partial<SortablePost>): SortablePost {
	return {
		id: Math.random().toString(36).slice(2),
		createdAt: new Date("2026-01-01"),
		votesCount: 0,
		commentsCount: 0,
		institutionId: "inst_a",
		...overrides,
	};
}

const A = post({ id: "a", createdAt: "2026-01-03", votesCount: 5 });
const B = post({ id: "b", createdAt: "2026-01-05", votesCount: 1 });
const C = post({ id: "c", createdAt: "2026-01-04", votesCount: 3, commentsCount: 8 });

describe("sortFeedPosts", () => {
	it("sorts latest by descending creation time", () => {
		const sorted = sortFeedPosts([A, B, C], "latest");
		expect(sorted.map((p) => p.id)).toEqual(["b", "c", "a"]);
	});

	it("sorts top_voted by vote count", () => {
		const sorted = sortFeedPosts([A, B, C], "top_voted");
		expect(sorted[0].id).toBe("a");
	});

	it("weights comments in trending score", () => {
		const sorted = sortFeedPosts([A, B, C], "trending");
		// C: 3 + 8*2 = 19 beats A: 5
		expect(sorted[0].id).toBe("c");
	});

	it("boosts the viewer's campus under for_you", () => {
		const campus = post({ id: "campus", votesCount: 0 });
		const globalHot = post({ id: "hot", institutionId: "inst_z", votesCount: 100 });
		const sorted = sortFeedPosts([globalHot, campus], "for_you", "inst_a");
		expect(sorted[0].id).toBe("campus");
	});

	it("falls back to for_you for unknown sorts", () => {
		const sortedUnknown = sortFeedPosts([A, B, C], "mystery");
		const sortedDefault = sortFeedPosts([A, B, C], null);
		expect(sortedUnknown.map((p) => p.id)).toEqual(sortedDefault.map((p) => p.id));
	});

	it("does not mutate the input array", () => {
		const input = [A, B, C];
		const snapshot = input.map((p) => p.id);
		sortFeedPosts(input, "top_voted");
		expect(input.map((p) => p.id)).toEqual(snapshot);
	});
});

describe("normalizeApiFeedSort", () => {
	it("accepts known sorts", () => {
		expect(normalizeApiFeedSort("for_you")).toBe("for_you");
		expect(normalizeApiFeedSort("most_discussed")).toBe("most_discussed");
	});

	it("defaults unknown values to latest", () => {
		expect(normalizeApiFeedSort("hacker")).toBe("latest");
		expect(normalizeApiFeedSort(null)).toBe("latest");
	});
});
