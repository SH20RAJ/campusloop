import { boolean,index,jsonb,pgTable,text,timestamp,uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt,id,updatedAt } from "./common";
import { userProfiles } from "./users";

export const conversations = pgTable(
  "conversations",
  {
    id: id(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("conversations_updated_idx").on(table.updatedAt),
  ]
);

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    isArchived: boolean("is_archived").default(false).notNull(),
    isMuted: boolean("is_muted").default(false).notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    lastClearedAt: timestamp("last_cleared_at", { withTimezone: true }),
    createdAt,
  },
  (table) => [
    uniqueIndex("conversation_participants_user_conv_idx").on(table.userId, table.conversationId),
    index("conversation_participants_conv_idx").on(table.conversationId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    reactions: jsonb("reactions").$type<{ emoji: string; userId: string; userDisplayName?: string }[]>().default([]),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
    index("messages_sender_created_idx").on(table.senderId, table.createdAt),
    index("messages_read_idx").on(table.conversationId, table.readAt),
  ]
);


export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant = typeof conversationParticipants.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
