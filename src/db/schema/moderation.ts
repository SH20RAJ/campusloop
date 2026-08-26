import { index,pgTable,text } from "drizzle-orm/pg-core";
import { createdAt,id,reportStatusEnum,reportTargetTypeEnum,updatedAt } from "./common";
import { userProfiles } from "./users";

export const reports = pgTable(
  "reports",
  {
    id: id(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    details: text("details"),
    status: reportStatusEnum("status").default("OPEN").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("reports_status_created_idx").on(table.status, table.createdAt),
    index("reports_target_idx").on(table.targetType, table.targetId),
  ],
);

export const moderationActions = pgTable(
  "moderation_actions",
  {
    id: id(),
    moderatorId: text("moderator_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: text("target_id").notNull(),
    action: text("action").notNull(),
    reason: text("reason"),
    createdAt,
  },
  (table) => [index("moderation_actions_target_idx").on(table.targetType, table.targetId)],
);

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ModerationAction = typeof moderationActions.$inferSelect;
export type NewModerationAction = typeof moderationActions.$inferInsert;
