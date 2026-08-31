import { relations } from "drizzle-orm";
import { academicResources } from "./academic-resources";
import { articleComments, articleCommentVotes, articles, articleVotes } from "./articles";
import { conversationParticipants, conversations, messages } from "./chat";
import {
  barberAppointments,
  barberServices,
  bikeAvailabilityBlocks,
  bikeBookingDocuments,
  bikeBookingStatusHistory,
  bikeBookings,
  bikeInspections,
  bikes,
  laundryOrders,
  laundryServices,
  marketplaceOffers,
  marketplaceOrderItems,
  marketplaceOrders,
  marketplaceReviews,
  merchantBusinessHours,
  merchants,
  merchantUsers,
  products,
  savedMarketplaceItems,
  waterOrders,
  waterProducts,
  waterSubscriptions,
} from "./commercial-marketplace";
import { communities, communityMembers } from "./communities";
import { secretCrushes, swipes } from "./dating";
import { eventRegistrations, events } from "./events";
import { gamingLobbies } from "./gaming";
import { housingListings } from "./housing";
import { institutionDomains, institutions } from "./institutions";
import { lostAndFoundItems } from "./lost-and-found";
import { marketplaceItems } from "./marketplace";
import { notifications } from "./notifications";
import { comments, pollOptions, pollVotes, posts, votes } from "./posts";
import { randomMessages, randomQueue, randomReports, randomSessions } from "./random-loop";
import { ridesharePools } from "./rideshare";
import { savedPosts } from "./saved-posts";
import { stories, storyHighlights, storyLikes } from "./stories";
import { capsuleEntries, timeCapsules } from "./time-capsule";
import { follows, userProfiles } from "./users";

export const institutionsRelations = relations(institutions, ({ many }) => ({
  domains: many(institutionDomains),
  profiles: many(userProfiles),
  posts: many(posts),
  articles: many(articles),
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
  storyHighlights: many(storyHighlights),
  savedPosts: many(savedPosts),
  articles: many(articles),
  followers: many(follows, { relationName: "profile_followers" }),
  following: many(follows, { relationName: "profile_following" }),
}));

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [savedPosts.profileId],
    references: [userProfiles.id],
  }),
  post: one(posts, {
    fields: [savedPosts.postId],
    references: [posts.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(userProfiles, {
    fields: [follows.followerId],
    references: [userProfiles.id],
    relationName: "profile_following",
  }),
  following: one(userProfiles, {
    fields: [follows.followingId],
    references: [userProfiles.id],
    relationName: "profile_followers",
  }),
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
  savedBy: many(savedPosts),
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

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
  community: one(communities, {
    fields: [conversations.communityId],
    references: [communities.id],
  }),
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

export const storiesRelations = relations(stories, ({ one, many }) => ({
  user: one(userProfiles, {
    fields: [stories.userId],
    references: [userProfiles.id],
  }),
  likes: many(storyLikes),
}));

export const storyLikesRelations = relations(storyLikes, ({ one }) => ({
  story: one(stories, {
    fields: [storyLikes.storyId],
    references: [stories.id],
  }),
  user: one(userProfiles, {
    fields: [storyLikes.userId],
    references: [userProfiles.id],
  }),
}));

export const storyHighlightsRelations = relations(storyHighlights, ({ one }) => ({
  user: one(userProfiles, {
    fields: [storyHighlights.userId],
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

export const lostAndFoundItemsRelations = relations(lostAndFoundItems, ({ one }) => ({
  author: one(userProfiles, {
    fields: [lostAndFoundItems.authorId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [lostAndFoundItems.institutionId],
    references: [institutions.id],
  }),
}));

export const marketplaceItemsRelations = relations(marketplaceItems, ({ one }) => ({
  seller: one(userProfiles, {
    fields: [marketplaceItems.sellerId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [marketplaceItems.institutionId],
    references: [institutions.id],
  }),
}));

export const gamingLobbiesRelations = relations(gamingLobbies, ({ one }) => ({
  host: one(userProfiles, {
    fields: [gamingLobbies.hostId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [gamingLobbies.institutionId],
    references: [institutions.id],
  }),
}));

export const ridesharePoolsRelations = relations(ridesharePools, ({ one }) => ({
  creator: one(userProfiles, {
    fields: [ridesharePools.creatorId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [ridesharePools.institutionId],
    references: [institutions.id],
  }),
}));

export const housingListingsRelations = relations(housingListings, ({ one }) => ({
  author: one(userProfiles, {
    fields: [housingListings.authorId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [housingListings.institutionId],
    references: [institutions.id],
  }),
}));

export const academicResourcesRelations = relations(academicResources, ({ one }) => ({
  uploader: one(userProfiles, {
    fields: [academicResources.uploaderId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [academicResources.institutionId],
    references: [institutions.id],
  }),
}));

export const timeCapsulesRelations = relations(timeCapsules, ({ one, many }) => ({
  creator: one(userProfiles, {
    fields: [timeCapsules.creatorId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [timeCapsules.institutionId],
    references: [institutions.id],
  }),
  entries: many(capsuleEntries),
}));

export const capsuleEntriesRelations = relations(capsuleEntries, ({ one }) => ({
  capsule: one(timeCapsules, {
    fields: [capsuleEntries.capsuleId],
    references: [timeCapsules.id],
  }),
  author: one(userProfiles, {
    fields: [capsuleEntries.authorId],
    references: [userProfiles.id],
  }),
}));

// ─── Commercial Marketplace Relations ───

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [merchants.institutionId],
    references: [institutions.id],
  }),
  products: many(products),
  orders: many(marketplaceOrders),
  users: many(merchantUsers),
  businessHours: many(merchantBusinessHours),
  offers: many(marketplaceOffers),
  reviews: many(marketplaceReviews),
}));

export const merchantUsersRelations = relations(merchantUsers, ({ one }) => ({
  merchant: one(merchants, {
    fields: [merchantUsers.merchantId],
    references: [merchants.id],
  }),
  user: one(userProfiles, {
    fields: [merchantUsers.userId],
    references: [userProfiles.id],
  }),
}));

export const merchantBusinessHoursRelations = relations(merchantBusinessHours, ({ one }) => ({
  merchant: one(merchants, {
    fields: [merchantBusinessHours.merchantId],
    references: [merchants.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  merchant: one(merchants, {
    fields: [products.merchantId],
    references: [merchants.id],
  }),
}));

export const marketplaceOrdersRelations = relations(marketplaceOrders, ({ one, many }) => ({
  student: one(userProfiles, {
    fields: [marketplaceOrders.studentId],
    references: [userProfiles.id],
  }),
  merchant: one(merchants, {
    fields: [marketplaceOrders.merchantId],
    references: [merchants.id],
  }),
  institution: one(institutions, {
    fields: [marketplaceOrders.institutionId],
    references: [institutions.id],
  }),
  items: many(marketplaceOrderItems),
}));

export const marketplaceOrderItemsRelations = relations(marketplaceOrderItems, ({ one }) => ({
  order: one(marketplaceOrders, {
    fields: [marketplaceOrderItems.orderId],
    references: [marketplaceOrders.id],
  }),
  product: one(products, {
    fields: [marketplaceOrderItems.productId],
    references: [products.id],
  }),
}));

export const marketplaceOffersRelations = relations(marketplaceOffers, ({ one }) => ({
  merchant: one(merchants, {
    fields: [marketplaceOffers.merchantId],
    references: [merchants.id],
  }),
}));

export const marketplaceReviewsRelations = relations(marketplaceReviews, ({ one }) => ({
  merchant: one(merchants, {
    fields: [marketplaceReviews.merchantId],
    references: [merchants.id],
  }),
  student: one(userProfiles, {
    fields: [marketplaceReviews.studentId],
    references: [userProfiles.id],
  }),
}));

export const savedMarketplaceItemsRelations = relations(savedMarketplaceItems, ({ one }) => ({
  student: one(userProfiles, {
    fields: [savedMarketplaceItems.studentId],
    references: [userProfiles.id],
  }),
}));

export const bikesRelations = relations(bikes, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [bikes.merchantId],
    references: [merchants.id],
  }),
  bookings: many(bikeBookings),
  availabilityBlocks: many(bikeAvailabilityBlocks),
  inspections: many(bikeInspections),
}));

export const bikeBookingsRelations = relations(bikeBookings, ({ one, many }) => ({
  bike: one(bikes, {
    fields: [bikeBookings.bikeId],
    references: [bikes.id],
  }),
  student: one(userProfiles, {
    fields: [bikeBookings.studentId],
    references: [userProfiles.id],
  }),
  merchant: one(merchants, {
    fields: [bikeBookings.merchantId],
    references: [merchants.id],
  }),
  institution: one(institutions, {
    fields: [bikeBookings.institutionId],
    references: [institutions.id],
  }),
  inspections: many(bikeInspections),
  documents: one(bikeBookingDocuments, {
    fields: [bikeBookings.id],
    references: [bikeBookingDocuments.bookingId],
  }),
  statusHistory: many(bikeBookingStatusHistory),
}));

export const bikeAvailabilityBlocksRelations = relations(bikeAvailabilityBlocks, ({ one }) => ({
  bike: one(bikes, {
    fields: [bikeAvailabilityBlocks.bikeId],
    references: [bikes.id],
  }),
  merchant: one(merchants, {
    fields: [bikeAvailabilityBlocks.merchantId],
    references: [merchants.id],
  }),
}));

export const bikeInspectionsRelations = relations(bikeInspections, ({ one }) => ({
  booking: one(bikeBookings, {
    fields: [bikeInspections.bookingId],
    references: [bikeBookings.id],
  }),
  bike: one(bikes, {
    fields: [bikeInspections.bikeId],
    references: [bikes.id],
  }),
}));

export const bikeBookingDocumentsRelations = relations(bikeBookingDocuments, ({ one }) => ({
  booking: one(bikeBookings, {
    fields: [bikeBookingDocuments.bookingId],
    references: [bikeBookings.id],
  }),
  student: one(userProfiles, {
    fields: [bikeBookingDocuments.studentId],
    references: [userProfiles.id],
  }),
}));

export const bikeBookingStatusHistoryRelations = relations(bikeBookingStatusHistory, ({ one }) => ({
  booking: one(bikeBookings, {
    fields: [bikeBookingStatusHistory.bookingId],
    references: [bikeBookings.id],
  }),
}));

export const barberServicesRelations = relations(barberServices, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [barberServices.merchantId],
    references: [merchants.id],
  }),
  appointments: many(barberAppointments),
}));

export const barberAppointmentsRelations = relations(barberAppointments, ({ one }) => ({
  merchant: one(merchants, {
    fields: [barberAppointments.merchantId],
    references: [merchants.id],
  }),
  student: one(userProfiles, {
    fields: [barberAppointments.studentId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [barberAppointments.institutionId],
    references: [institutions.id],
  }),
  service: one(barberServices, {
    fields: [barberAppointments.serviceId],
    references: [barberServices.id],
  }),
}));

export const laundryServicesRelations = relations(laundryServices, ({ one }) => ({
  merchant: one(merchants, {
    fields: [laundryServices.merchantId],
    references: [merchants.id],
  }),
}));

export const laundryOrdersRelations = relations(laundryOrders, ({ one }) => ({
  merchant: one(merchants, {
    fields: [laundryOrders.merchantId],
    references: [merchants.id],
  }),
  student: one(userProfiles, {
    fields: [laundryOrders.studentId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [laundryOrders.institutionId],
    references: [institutions.id],
  }),
}));

export const waterProductsRelations = relations(waterProducts, ({ one }) => ({
  merchant: one(merchants, {
    fields: [waterProducts.merchantId],
    references: [merchants.id],
  }),
}));

export const waterSubscriptionsRelations = relations(waterSubscriptions, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [waterSubscriptions.merchantId],
    references: [merchants.id],
  }),
  student: one(userProfiles, {
    fields: [waterSubscriptions.studentId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [waterSubscriptions.institutionId],
    references: [institutions.id],
  }),
  orders: many(waterOrders),
}));

export const waterOrdersRelations = relations(waterOrders, ({ one }) => ({
  merchant: one(merchants, {
    fields: [waterOrders.merchantId],
    references: [merchants.id],
  }),
  student: one(userProfiles, {
    fields: [waterOrders.studentId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [waterOrders.institutionId],
    references: [institutions.id],
  }),
  subscription: one(waterSubscriptions, {
    fields: [waterOrders.subscriptionId],
    references: [waterSubscriptions.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(userProfiles, {
    fields: [events.organizerProfileId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [events.institutionId],
    references: [institutions.id],
  }),
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  profile: one(userProfiles, {
    fields: [eventRegistrations.profileId],
    references: [userProfiles.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(userProfiles, {
    fields: [articles.authorId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [articles.institutionId],
    references: [institutions.id],
  }),
  votes: many(articleVotes),
  comments: many(articleComments),
}));

export const articleVotesRelations = relations(articleVotes, ({ one }) => ({
  article: one(articles, {
    fields: [articleVotes.articleId],
    references: [articles.id],
  }),
  profile: one(userProfiles, {
    fields: [articleVotes.profileId],
    references: [userProfiles.id],
  }),
}));

export const articleCommentsRelations = relations(articleComments, ({ one, many }) => ({
  article: one(articles, {
    fields: [articleComments.articleId],
    references: [articles.id],
  }),
  author: one(userProfiles, {
    fields: [articleComments.authorId],
    references: [userProfiles.id],
  }),
  parent: one(articleComments, {
    fields: [articleComments.parentId],
    references: [articleComments.id],
    relationName: "parent_reply",
  }),
  replies: many(articleComments, {
    relationName: "parent_reply",
  }),
  votes: many(articleCommentVotes),
}));

export const articleCommentVotesRelations = relations(articleCommentVotes, ({ one }) => ({
  comment: one(articleComments, {
    fields: [articleCommentVotes.commentId],
    references: [articleComments.id],
  }),
  profile: one(userProfiles, {
    fields: [articleCommentVotes.profileId],
    references: [userProfiles.id],
  }),
}));

export const randomQueueRelations = relations(randomQueue, ({ one }) => ({
  user: one(userProfiles, {
    fields: [randomQueue.userId],
    references: [userProfiles.id],
  }),
  institution: one(institutions, {
    fields: [randomQueue.institutionId],
    references: [institutions.id],
  }),
}));

export const randomSessionsRelations = relations(randomSessions, ({ one, many }) => ({
  userA: one(userProfiles, {
    fields: [randomSessions.userAId],
    references: [userProfiles.id],
    relationName: "random_session_user_a",
  }),
  userB: one(userProfiles, {
    fields: [randomSessions.userBId],
    references: [userProfiles.id],
    relationName: "random_session_user_b",
  }),
  institution: one(institutions, {
    fields: [randomSessions.institutionId],
    references: [institutions.id],
  }),
  messages: many(randomMessages),
  reports: many(randomReports),
}));

export const randomMessagesRelations = relations(randomMessages, ({ one }) => ({
  session: one(randomSessions, {
    fields: [randomMessages.sessionId],
    references: [randomSessions.id],
  }),
  sender: one(userProfiles, {
    fields: [randomMessages.senderId],
    references: [userProfiles.id],
  }),
}));

export const randomReportsRelations = relations(randomReports, ({ one }) => ({
  session: one(randomSessions, {
    fields: [randomReports.sessionId],
    references: [randomSessions.id],
  }),
  reporter: one(userProfiles, {
    fields: [randomReports.reporterId],
    references: [userProfiles.id],
  }),
  reportedUser: one(userProfiles, {
    fields: [randomReports.reportedUserId],
    references: [userProfiles.id],
  }),
}));
