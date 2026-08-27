import { sql } from "drizzle-orm";
import {
boolean,
index,
integer,
jsonb,
pgTable,
text,
timestamp,
uniqueIndex,
type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { createdAt,id,updatedAt,userRoleEnum,userStatusEnum } from "./common";
import { institutions } from "./institutions";

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: id(),
    userId: text("user_id").notNull(),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    officialName: text("official_name"),
    avatarUrl: text("avatar_url"),
    bannerUrl: text("banner_url"),
    headline: text("headline"),
    institutionId: text("institution_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "restrict" }),
    course: text("course"),
    branch: text("branch"),
    year: integer("year"),
    bio: text("bio"),
    gender: text("gender").default("MALE"),
    dob: text("dob"), // Format: YYYY-MM-DD
    isDobPrivate: boolean("is_dob_private").default(false).notNull(),
    interests: jsonb("interests").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    photos: jsonb("photos").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    datingPreferences: jsonb("dating_preferences").$type<{
      gender?: "DEFAULT" | "MALE" | "FEMALE" | "ALL";
      scope?: "GLOBAL" | "CAMPUS";
      sort?: "COMPATIBILITY" | "RECENT" | "POPULAR";
    }>(),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    role: userRoleEnum("role").default("STUDENT").notNull(),
    status: userStatusEnum("status").default("ACTIVE").notNull(),
    referralCount: integer("referral_count").default(0).notNull(),
    referredById: text("referred_by_id").references((): AnyPgColumn => userProfiles.id, { onDelete: "set null" }),
    points: integer("points").default(0).notNull(),
    anonymousUsername: text("anonymous_username"),
    feedVisibility: text("feed_visibility").default("ALL").notNull(),
    /**
     * Heartbeat timestamp driving presence. "Online" is derived from this
     * being recent rather than stored as a boolean, so a closed tab, a lost
     * connection or a crashed worker all decay to offline on their own —
     * there is no stale "true" left behind for anyone to clean up.
     */
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("user_profiles_user_id_idx").on(table.userId),
    uniqueIndex("user_profiles_username_idx").on(table.username),
    uniqueIndex("user_profiles_anon_username_idx").on(table.anonymousUsername),
    index("user_profiles_institution_idx").on(table.institutionId),
    index("user_profiles_points_idx").on(table.points),
    index("user_profiles_branch_idx").on(table.branch),
    index("user_profiles_last_seen_idx").on(table.lastSeenAt),
  ],
);


export const blocks = pgTable(
  "blocks",
  {
    id: id(),
    blockerId: text("blocker_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    blockedUserId: text("blocked_user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [uniqueIndex("blocks_blocker_blocked_idx").on(table.blockerId, table.blockedUserId)],
);

export const follows = pgTable(
  "follows",
  {
    id: id(),
    followerId: text("follower_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    /**
     * True when the reverse edge also exists — i.e. the two students follow
     * each other and are "friends". Denormalized so friend lists and counts
     * are a single indexed scan instead of a self-join against follows.
     * Maintained by followUser / unfollowUser in src/lib/follows.ts.
     */
    isMutual: boolean("is_mutual").default(false).notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex("follows_follower_following_idx").on(table.followerId, table.followingId),
    // Reverse covering index: lets the mutual-edge lookup be index-only.
    index("follows_following_follower_idx").on(table.followingId, table.followerId),
    // Keyset pagination for the follower / following list pages
    index("follows_following_created_idx").on(table.followingId, table.createdAt),
    index("follows_follower_created_idx").on(table.followerId, table.createdAt),
    // Partial index — the friends list only ever scans mutual edges
    index("follows_mutual_created_idx")
      .on(table.followerId, table.createdAt)
      .where(sql`${table.isMutual}`),
  ],
);

/**
 * Web Push endpoints registered by a student's browsers. One row per device;
 * the endpoint is the natural key, and a 404/410 from the push service means
 * the subscription is dead and the row should be deleted.
 */
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    failureCount: integer("failure_count").default(0).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("push_subscriptions_endpoint_idx").on(table.endpoint),
    index("push_subscriptions_user_idx").on(table.userId),
  ],
);

/**
 * Anonymous identity vault. Maps a pseudonym handle to the AES-256-GCM
 * sealed profile id of the real author. Deliberately has NO foreign key to
 * user_profiles, so no SQL join can deanonymize content — resolution requires
 * ANON_VAULT_SECRET and is restricted to audited ADMIN-only server actions.
 */
export const anonIdentityVault = pgTable(
  "anon_identity_vault",
  {
    id: id(),
    handle: text("handle").notNull(),
    sealedIdentity: text("sealed_identity").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("anon_identity_vault_handle_idx").on(table.handle),
  ],
);

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
export type AnonIdentityVaultEntry = typeof anonIdentityVault.$inferSelect;
export type NewAnonIdentityVaultEntry = typeof anonIdentityVault.$inferInsert;
