import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import {
  type ActiveBoost,
  applicableBoosts,
  buildBoostMultiplierSql,
  buildBoostTierSql,
} from "./feed-boosts";

function boost(overrides: Partial<ActiveBoost> = {}): ActiveBoost {
  return {
    targetType: "POST",
    targetId: "post-1",
    multiplier: 3,
    mode: "PROMOTE",
    priority: 0,
    scope: "GLOBAL",
    institutionId: null,
    ...overrides,
  };
}

const dialect = new PgDialect();

/** Compile a fragment to the real statement text Postgres would receive. */
function text(fragment: SQL<unknown> | null): string {
  if (!fragment) return "";
  return dialect.sqlToQuery(fragment).sql;
}

/** The values bound as parameters, i.e. never part of the statement text. */
function params(fragment: SQL<unknown> | null): unknown[] {
  if (!fragment) return [];
  return dialect.sqlToQuery(fragment).params;
}

describe("buildBoostMultiplierSql", () => {
  it("returns null when nothing is boosted, so the term is omitted entirely", () => {
    // Not "multiply every row by 1" — the expression should not appear at all,
    // which is what keeps an unboosted feed exactly as cheap as before.
    expect(buildBoostMultiplierSql([])).toBeNull();
  });

  it("ignores a multiplier of exactly 1", () => {
    expect(buildBoostMultiplierSql([boost({ multiplier: 1 })])).toBeNull();
  });

  it("builds a CASE over the posts table", () => {
    const sql = buildBoostMultiplierSql([boost({ targetId: "post-abc", multiplier: 4 })]);
    expect(sql).not.toBeNull();
    expect(text(sql)).toContain("case");
    expect(text(sql)).toContain("else 1.0 end");
    expect(text(sql)).toContain('"posts"."id"');
  });

  it("binds ids as parameters rather than concatenating them", () => {
    // The ids must travel as bound params. If they were inlined into the
    // statement text this would be an injection surface.
    const sql = buildBoostMultiplierSql([boost({ targetId: "post-abc" })]);
    expect(params(sql)).toContain("post-abc");
    expect(text(sql)).not.toContain("post-abc");
  });

  it("clamps an absurd multiplier so one entry cannot swallow the feed", () => {
    expect(params(buildBoostMultiplierSql([boost({ multiplier: 100000 })]))).toContain(25);
    expect(params(buildBoostMultiplierSql([boost({ multiplier: -50 })]))).toContain(0.01);
  });

  it("drops ids that do not look like ids", () => {
    const hostile = buildBoostMultiplierSql([boost({ targetId: "'; drop table posts; --" })]);
    expect(hostile).toBeNull();
  });

  it("groups ids sharing a multiplier into one branch", () => {
    const sql = buildBoostMultiplierSql([
      boost({ targetId: "a", multiplier: 2 }),
      boost({ targetId: "b", multiplier: 2 }),
      boost({ targetId: "c", multiplier: 5 }),
    ]);
    // Two distinct multipliers -> two `when` branches, not three.
    expect(text(sql).split("when ").length - 1).toBe(2);
  });

  it("keys profile boosts on author_id, which is null for anonymous posts", () => {
    // This is the anonymity guarantee: a profile boost cannot match a
    // confession, because a confession carries no author id. It falls out of
    // the data model rather than being a rule anyone has to remember.
    const sql = buildBoostMultiplierSql([boost({ targetType: "PROFILE", targetId: "prof-1" })]);
    expect(text(sql)).toContain('"posts"."author_id"');
    expect(text(sql)).not.toContain('"posts"."id"');
  });
});

describe("buildBoostTierSql", () => {
  it("returns null when every live boost is a nudge", () => {
    // A nudge is purely multiplicative, so no tier clause is needed and the
    // ordinary feed pays nothing for it.
    expect(buildBoostTierSql([boost({ mode: "NUDGE" })])).toBeNull();
    expect(buildBoostTierSql([])).toBeNull();
  });

  it("ranks pin above promote above organic above bury", () => {
    // The whole point of tiers: scores span four orders of magnitude, so a
    // multiplier cannot reliably promote. Tier ordering can.
    const pin = params(buildBoostTierSql([boost({ mode: "PIN" })]));
    const promote = params(buildBoostTierSql([boost({ mode: "PROMOTE" })]));
    const bury = params(buildBoostTierSql([boost({ mode: "BURY" })]));

    expect(pin).toContain(3);
    expect(promote).toContain(2);
    expect(bury).toContain(0);
    // Organic is the ELSE branch, so BURY has somewhere below it to sit.
    expect(pin).toContain(1);
  });

  it("keeps priority inside its tier", () => {
    // A priority offset must never push a PROMOTE into the PIN tier.
    const sql = buildBoostTierSql([boost({ mode: "PROMOTE", priority: 99 })]);
    const values = params(sql).filter((v): v is number => typeof v === "number");
    const rank = Math.max(...values.filter((v) => v >= 2));
    expect(rank).toBeLessThan(3);
  });

  it("excludes nudges from the tier expression", () => {
    const sql = buildBoostTierSql([
      boost({ targetId: "a", mode: "NUDGE" }),
      boost({ targetId: "b", mode: "PROMOTE" }),
    ]);
    expect(params(sql)).toContain("b");
    expect(params(sql)).not.toContain("a");
  });
});

describe("applicableBoosts", () => {
  it("keeps global boosts for everyone", () => {
    const set = [boost({ scope: "GLOBAL" })];
    expect(applicableBoosts(set, "inst-1")).toHaveLength(1);
    expect(applicableBoosts(set, null)).toHaveLength(1);
  });

  it("confines a campus boost to that campus", () => {
    const set = [boost({ scope: "INSTITUTION", institutionId: "inst-1" })];
    expect(applicableBoosts(set, "inst-1")).toHaveLength(1);
    expect(applicableBoosts(set, "inst-2")).toHaveLength(0);
    // A signed-out viewer has no campus and must not receive campus curation.
    expect(applicableBoosts(set, null)).toHaveLength(0);
  });
});
