import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, userRoleEnum, userStatusEnum } from "./common";
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
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("user_profiles_user_id_idx").on(table.userId),
    uniqueIndex("user_profiles_username_idx").on(table.username),
    index("user_profiles_institution_idx").on(table.institutionId),
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
export type AnonIdentityVaultEntry = typeof anonIdentityVault.$inferSelect;
export type NewAnonIdentityVaultEntry = typeof anonIdentityVault.$inferInsert;
