import { randomUUID } from "node:crypto";
import { pgEnum, text, timestamp } from "drizzle-orm/pg-core";

export const id = (name = "id") =>
  text(name)
    .primaryKey()
    .$defaultFn(() => randomUUID());

export const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull()
  .$onUpdateFn(() => new Date());

export const userRoleEnum = pgEnum("user_role", ["STUDENT", "MODERATOR", "ADMIN"]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "SUSPENDED", "BANNED"]);
export const contentStatusEnum = pgEnum("content_status", [
  "PUBLISHED",
  "HIDDEN",
  "DELETED",
  "PENDING_REVIEW",
  "ARCHIVED",
]);
export const reportTargetTypeEnum = pgEnum("report_target_type", ["POST", "COMMENT", "USER"]);
export const reportStatusEnum = pgEnum("report_status", ["OPEN", "REVIEWING", "RESOLVED", "REJECTED"]);
