import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

const id = (name = "id") =>
	text(name)
		.primaryKey()
		.$defaultFn(() => randomUUID());

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true })
	.defaultNow()
	.notNull()
	.$onUpdateFn(() => new Date());

export const userRoleEnum = pgEnum("user_role", ["STUDENT", "MODERATOR", "ADMIN"]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "SUSPENDED", "BANNED"]);
export const institutionDomainTypeEnum = pgEnum("institution_domain_type", [
	"WEBSITE",
	"EMAIL",
	"STUDENT_EMAIL",
	"UNKNOWN",
]);
export const domainVerificationStatusEnum = pgEnum("domain_verification_status", [
	"UNVERIFIED",
	"AUTO_IMPORTED",
	"STUDENT_VERIFIED",
	"ADMIN_VERIFIED",
	"REJECTED",
]);
export const postTypeEnum = pgEnum("post_type", [
	"NORMAL",
	"ANONYMOUS",
	"CONFESSION",
	"POLL",
	"QUESTION",
	"MEME",
	"EVENT",
	"LOST_FOUND",
]);
export const postScopeEnum = pgEnum("post_scope", ["CAMPUS", "STATE", "INDIA", "GLOBAL"]);
export const contentStatusEnum = pgEnum("content_status", [
	"PUBLISHED",
	"HIDDEN",
	"DELETED",
	"PENDING_REVIEW",
]);
export const reportTargetTypeEnum = pgEnum("report_target_type", ["POST", "COMMENT", "USER"]);
export const reportStatusEnum = pgEnum("report_status", ["OPEN", "REVIEWING", "RESOLVED", "REJECTED"]);
export const institutionRequestStatusEnum = pgEnum("institution_request_status", [
	"PENDING",
	"APPROVED",
	"REJECTED",
]);

export const institutions = pgTable(
	"institutions",
	{
		id: id(),
		aisheCode: text("aishe_code").notNull(),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		state: text("state"),
		district: text("district"),
		website: text("website"),
		websiteDomain: text("website_domain"),
		yearOfEstablishment: integer("year_of_establishment"),
		locationType: text("location_type"),
		country: text("country").default("India").notNull(),
		source: text("source").default("colleges_csv").notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [
		uniqueIndex("institutions_aishe_code_idx").on(table.aisheCode),
		uniqueIndex("institutions_slug_idx").on(table.slug),
		index("institutions_search_idx").on(table.name, table.state, table.district, table.websiteDomain),
	],
);

export const institutionDomains = pgTable(
	"institution_domains",
	{
		id: id(),
		institutionId: text("institution_id")
			.notNull()
			.references(() => institutions.id, { onDelete: "cascade" }),
		domain: text("domain").notNull(),
		domainType: institutionDomainTypeEnum("domain_type").default("UNKNOWN").notNull(),
		verificationStatus: domainVerificationStatusEnum("verification_status").default("UNVERIFIED").notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [
		uniqueIndex("institution_domains_domain_idx").on(table.domain),
		uniqueIndex("institution_domains_institution_domain_idx").on(table.institutionId, table.domain),
	],
);

export const userProfiles = pgTable(
	"user_profiles",
	{
		id: id(),
		userId: text("user_id").notNull(),
		username: text("username").notNull(),
		displayName: text("display_name").notNull(),
		avatarUrl: text("avatar_url"),
		institutionId: text("institution_id")
			.notNull()
			.references(() => institutions.id, { onDelete: "restrict" }),
		course: text("course"),
		branch: text("branch"),
		year: integer("year"),
		bio: text("bio"),
		interests: jsonb("interests").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
		onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
		role: userRoleEnum("role").default("STUDENT").notNull(),
		status: userStatusEnum("status").default("ACTIVE").notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [
		uniqueIndex("user_profiles_user_id_idx").on(table.userId),
		uniqueIndex("user_profiles_username_idx").on(table.username),
		index("user_profiles_institution_idx").on(table.institutionId),
	],
);

export const posts = pgTable(
	"posts",
	{
		id: id(),
		authorId: text("author_id")
			.notNull()
			.references(() => userProfiles.id, { onDelete: "cascade" }),
		institutionId: text("institution_id")
			.notNull()
			.references(() => institutions.id, { onDelete: "cascade" }),
		type: postTypeEnum("type").default("NORMAL").notNull(),
		scope: postScopeEnum("scope").default("CAMPUS").notNull(),
		title: text("title"),
		body: text("body").notNull(),
		isAnonymous: boolean("is_anonymous").default(false).notNull(),
		status: contentStatusEnum("status").default("PUBLISHED").notNull(),
		riskScore: integer("risk_score").default(0).notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [
		index("posts_institution_status_created_idx").on(table.institutionId, table.status, table.createdAt),
		index("posts_scope_status_created_idx").on(table.scope, table.status, table.createdAt),
		index("posts_author_idx").on(table.authorId),
	],
);

export const comments = pgTable(
	"comments",
	{
		id: id(),
		postId: text("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		authorId: text("author_id")
			.notNull()
			.references(() => userProfiles.id, { onDelete: "cascade" }),
		body: text("body").notNull(),
		isAnonymous: boolean("is_anonymous").default(false).notNull(),
		status: contentStatusEnum("status").default("PUBLISHED").notNull(),
		createdAt,
		updatedAt,
	},
	(table) => [index("comments_post_created_idx").on(table.postId, table.createdAt)],
);

export const pollOptions = pgTable(
	"poll_options",
	{
		id: id(),
		postId: text("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		text: text("text").notNull(),
		createdAt,
	},
	(table) => [index("poll_options_post_idx").on(table.postId)],
);

export const pollVotes = pgTable(
	"poll_votes",
	{
		id: id(),
		postId: text("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		optionId: text("option_id")
			.notNull()
			.references(() => pollOptions.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => userProfiles.id, { onDelete: "cascade" }),
		createdAt,
	},
	(table) => [
		uniqueIndex("poll_votes_user_post_idx").on(table.userId, table.postId),
		index("poll_votes_option_idx").on(table.optionId),
	],
);

export const votes = pgTable(
	"votes",
	{
		id: id(),
		postId: text("post_id")
			.notNull()
			.references(() => posts.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => userProfiles.id, { onDelete: "cascade" }),
		value: integer("value").notNull(),
		createdAt,
	},
	(table) => [uniqueIndex("votes_user_post_idx").on(table.userId, table.postId)],
);

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

export const institutionRequests = pgTable(
	"institution_requests",
	{
		id: id(),
		userId: text("user_id").notNull(),
		emailDomain: text("email_domain"),
		suggestedInstitutionName: text("suggested_institution_name").notNull(),
		state: text("state"),
		district: text("district"),
		status: institutionRequestStatusEnum("status").default("PENDING").notNull(),
		createdAt,
	},
	(table) => [index("institution_requests_status_created_idx").on(table.status, table.createdAt)],
);

export const institutionsRelations = relations(institutions, ({ many }) => ({
	domains: many(institutionDomains),
	profiles: many(userProfiles),
	posts: many(posts),
}));

export const institutionDomainsRelations = relations(institutionDomains, ({ one }) => ({
	institution: one(institutions, {
		fields: [institutionDomains.institutionId],
		references: [institutions.id],
	}),
}));

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
	institution: one(institutions, {
		fields: [userProfiles.institutionId],
		references: [institutions.id],
	}),
	posts: many(posts),
	comments: many(comments),
	votes: many(votes),
	pollVotes: many(pollVotes),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(userProfiles, {
		fields: [posts.authorId],
		references: [userProfiles.id],
	}),
	institution: one(institutions, {
		fields: [posts.institutionId],
		references: [institutions.id],
	}),
	comments: many(comments),
	pollOptions: many(pollOptions),
	votes: many(votes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
	author: one(userProfiles, {
		fields: [comments.authorId],
		references: [userProfiles.id],
	}),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
	post: one(posts, {
		fields: [pollOptions.postId],
		references: [posts.id],
	}),
	votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
	post: one(posts, {
		fields: [pollVotes.postId],
		references: [posts.id],
	}),
	option: one(pollOptions, {
		fields: [pollVotes.optionId],
		references: [pollOptions.id],
	}),
	user: one(userProfiles, {
		fields: [pollVotes.userId],
		references: [userProfiles.id],
	}),
}));

export const votesRelations = relations(votes, ({ one }) => ({
	post: one(posts, {
		fields: [votes.postId],
		references: [posts.id],
	}),
	user: one(userProfiles, {
		fields: [votes.userId],
		references: [userProfiles.id],
	}),
}));

export const conversations = pgTable(
	"conversations",
	{
		id: id(),
		createdAt,
		updatedAt,
	}
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
		createdAt,
	},
	(table) => [
		uniqueIndex("conversation_participants_user_conv_idx").on(table.userId, table.conversationId),
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
		createdAt,
		updatedAt,
	},
	(table) => [
		index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
	]
);

export const conversationsRelations = relations(conversations, ({ many }) => ({
	participants: many(conversationParticipants),
	messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
	conversation: one(conversations, {
		fields: [conversationParticipants.conversationId],
		references: [conversations.id],
	}),
	user: one(userProfiles, {
		fields: [conversationParticipants.userId],
		references: [userProfiles.id],
	}),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id],
	}),
	sender: one(userProfiles, {
		fields: [messages.senderId],
		references: [userProfiles.id],
	}),
}));

export type Institution = typeof institutions.$inferSelect;
export type NewInstitution = typeof institutions.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type NewConversationParticipant = typeof conversationParticipants.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

