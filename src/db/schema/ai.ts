import { integer, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { userProfiles } from "./users";

export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
    mode: text("mode").default("campus").notNull(),
    title: text("title"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt,
    updatedAt,
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  },
  (table) => [
    index("ai_conversations_user_updated_idx").on(table.userId, table.updatedAt),
  ]
);

export const aiMessages = pgTable(
  "ai_messages",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => aiConversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    model: text("model"),
    inputTokens: integer("input_tokens").default(0),
    outputTokens: integer("output_tokens").default(0),
    toolCalls: jsonb("tool_calls").$type<Array<Record<string, unknown>>>().default([]),
    sourceIds: jsonb("source_ids").$type<Array<string>>().default([]),
    createdAt,
  },
  (table) => [index("ai_messages_conversation_created_idx").on(table.conversationId, table.createdAt)]
);

export const aiUsageEvents = pgTable(
  "ai_usage_events",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id"),
    requestType: text("request_type").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").default(0).notNull(),
    outputTokens: integer("output_tokens").default(0).notNull(),
    toolCount: integer("tool_count").default(0).notNull(),
    latencyMs: integer("latency_ms"),
    createdAt,
  },
  (table) => [index("ai_usage_user_created_idx").on(table.userId, table.createdAt)]
);

export const aiFeedback = pgTable(
  "ai_feedback",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
    messageId: text("message_id").notNull().references(() => aiMessages.id, { onDelete: "cascade" }),
    rating: text("rating").notNull(),
    reason: text("reason"),
    createdAt,
  },
  (table) => [index("ai_feedback_message_idx").on(table.messageId)]
);

export type AiConversation = typeof aiConversations.$inferSelect;
export type NewAiConversation = typeof aiConversations.$inferInsert;
export type AiMessage = typeof aiMessages.$inferSelect;
export type NewAiMessage = typeof aiMessages.$inferInsert;
