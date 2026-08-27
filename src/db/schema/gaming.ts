import { integer,pgTable,text } from "drizzle-orm/pg-core";
import { createdAt,id,updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const gamingLobbies = pgTable("gaming_lobbies", {
  id: id(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  hostId: text("host_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  gameName: text("game_name").notNull(), // 'Valorant' | 'Chess' | 'BGMI' | 'FIFA' | 'CS2' | 'Rocket League' | 'Other'
  title: text("title").notNull(),
  description: text("description"),
  mode: text("mode").default("5v5").notNull(), // '1v1' | '5v5' | 'SCRIM' | 'RANKED' | 'TOURNAMENT' | 'CASUAL'
  rankTier: text("rank_tier"), // e.g. 'Gold / Platinum' or '1600+ ELO'
  gamerTag: text("gamer_tag"), // Host's in-game ID / Riot ID / Chess username
  slotsTotal: integer("slots_total").default(5).notNull(),
  slotsFilled: integer("slots_filled").default(1).notNull(),
  discordOrVoiceUrl: text("discord_or_voice_url"),
  scheduledAt: text("scheduled_at"), // e.g. 'Tonight 10:30 PM'
  status: text("status").default("OPEN").notNull(), // 'OPEN' | 'FULL' | 'IN_GAME' | 'COMPLETED'
  players: text("players"), // JSON stringified array of player objects [{ userId, username, displayName, avatarUrl, gamerTag, role }]
  createdAt,
  updatedAt,
});

export type GamingLobby = typeof gamingLobbies.$inferSelect;
export type NewGamingLobby = typeof gamingLobbies.$inferInsert;
