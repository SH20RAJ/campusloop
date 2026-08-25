/**
 * Universal Cache Keys for SWR and LocalStorage persistence
 */

export const CACHE_KEYS = {
  // Feed & Posts
  FEED: "/api/feed",
  POST_DETAIL: (id: string) => `/api/posts/${id}`,
  POST_COMMENTS: (id: string) => `/api/posts/${id}/comments`,
  
  // Profile & User
  PROFILE_ME: "/api/profile/me",
  PROFILE_USER: (username: string) => `/api/profile/${username}`,
  SUGGESTED_PEERS: "/api/profile/suggested",
  
  // Direct Messages & Chat
  CHAT_CONVERSATIONS: "/api/chat",
  CHAT_MESSAGES: (convId: string) => `/api/chat/${convId}/messages`,
  
  // Colleges & Communities
  COLLEGES: "/api/colleges",
  COMMUNITIES: "/api/communities",
  BRANCH_DISCIPLINE: (slug: string) => `/api/academics/branch/${slug}`,
  
  // Social & Gamification
  STORIES: "/api/stories",
  BIRTHDAYS: "/api/birthdays",
  DATING_PROFILES: "/api/dating/profiles",
  DATING_LIKES: "/api/dating/likes",
  DATING_PREFERENCES: "/api/dating/preferences",
  NOTIFICATIONS: "/api/notifications",
} as const;

export const SWR_STORAGE_KEY = "campusloop_swr_cache_v2";
export const OFFLINE_QUEUE_KEY = "campusloop_offline_queue_v1";
