import { boolean, doublePrecision, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

/**
 * Editorial control over ranking — the campus desk's thumb on the scale.
 *
 * A boost targets either a single post or a whole profile (every post that
 * author writes while the boost is live). It multiplies the post's ranking
 * score, and may additionally pin it above everything else.
 *
 * Deliberately NOT joined into the feed query. The curated set is small — tens
 * of rows — so it is cached in Redis and inlined into the ranking SQL as a
 * constant CASE expression. That keeps the feed's cost identical whether a
 * boost exists or not: no extra join, no correlated subquery, no extra round
 * trip on the hot path. See src/lib/feed-boosts.ts.
 */
export const feedBoosts = pgTable(
  "feed_boosts",
  {
    id: id(),
    /** POST — one specific post. PROFILE — everything that author posts. */
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),

    /**
     * Score multiplier, applied within whichever tier `mode` selects. It is the
     * whole mechanism for NUDGE and a tiebreaker elsewhere.
     */
    multiplier: doublePrecision("multiplier").default(2).notNull(),

    /**
     * How the boost is applied. This is the important field — the multiplier
     * alone cannot promote reliably.
     *
     * Ranking scores span four orders of magnitude (a measured max of 23.9
     * against a median of 0.017 on the trending sort), because gravity decay
     * crushes anything old or quiet. Multiplying such a score by even 25 leaves
     * it far below the top, so a purely multiplicative "make it viral" control
     * would silently do nothing — the worst kind of admin tool.
     *
     *   NUDGE   — multiplier only; blends into organic ranking, may not surface
     *   PROMOTE — ranks above all organic results, ordered by `priority`
     *   PIN     — ranks above even promoted results; for real announcements
     *   BURY    — ranks below all organic results, without deleting anything
     */
    mode: text("mode").default("PROMOTE").notNull(),

    /** Ordering within a tier, descending. */
    priority: doublePrecision("priority").default(0).notNull(),

    /** GLOBAL, or INSTITUTION to confine the boost to one campus. */
    scope: text("scope").default("GLOBAL").notNull(),
    institutionId: text("institution_id").references(() => institutions.id, { onDelete: "cascade" }),

    /** Null expiry means indefinite; the loader still filters on startsAt. */
    startsAt: timestamp("starts_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    isActive: boolean("is_active").default(true).notNull(),

    /** Why, and by whom — this is an editorial act and should be attributable. */
    reason: text("reason"),
    createdByProfileId: text("created_by_profile_id").references(() => userProfiles.id, {
      onDelete: "set null",
    }),

    createdAt,
    updatedAt,
  },
  (table) => [
    // The loader's only query: active, in-window rows.
    index("feed_boosts_active_idx").on(table.isActive, table.expiresAt),
    index("feed_boosts_target_idx").on(table.targetType, table.targetId),
    index("feed_boosts_scope_idx").on(table.scope, table.institutionId),
  ]
);

export type FeedBoost = typeof feedBoosts.$inferSelect;
export type NewFeedBoost = typeof feedBoosts.$inferInsert;
