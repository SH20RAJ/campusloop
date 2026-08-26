import { relations } from "drizzle-orm";
import { conversationParticipants,conversations,messages } from "./chat";
import { communities,communityMembers } from "./communities";
import { secretCrushes,swipes } from "./dating";
import { institutionDomains,institutions } from "./institutions";
import { notifications } from "./notifications";
import { comments,pollOptions,pollVotes,posts,votes } from "./posts";
import { stories } from "./stories";
import { userProfiles } from "./users";


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
  stories: many(stories),
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
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
  repostOf: one(posts, {
    fields: [posts.repostOfId],
    references: [posts.id],
    relationName: "post_reposts",
  }),
  reposts: many(posts, {
    relationName: "post_reposts",
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(userProfiles, {
    fields: [comments.authorId],
    references: [userProfiles.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, {
    relationName: "comment_replies",
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

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(userProfiles, {
    fields: [swipes.swiperId],
    references: [userProfiles.id],
  }),
  target: one(userProfiles, {
    fields: [swipes.targetId],
    references: [userProfiles.id],
  }),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  creator: one(userProfiles, {
    fields: [communities.creatorId],
    references: [userProfiles.id],
  }),
  members: many(communityMembers),
  posts: many(posts),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
  user: one(userProfiles, {
    fields: [communityMembers.userId],
    references: [userProfiles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(userProfiles, {
    fields: [notifications.userId],
    references: [userProfiles.id],
  }),
  actor: one(userProfiles, {
    fields: [notifications.actorId],
    references: [userProfiles.id],
  }),
}));

export const storiesRelations = relations(stories, ({ one }) => ({
  user: one(userProfiles, {
    fields: [stories.userId],
    references: [userProfiles.id],
  }),
}));

export const secretCrushesRelations = relations(secretCrushes, ({ one }) => ({
  sender: one(userProfiles, {
    fields: [secretCrushes.senderId],
    references: [userProfiles.id],
    relationName: "crush_sender",
  }),
  target: one(userProfiles, {
    fields: [secretCrushes.targetId],
    references: [userProfiles.id],
    relationName: "crush_target",
  }),
}));

