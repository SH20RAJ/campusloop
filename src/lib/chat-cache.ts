"use client";

import type { Message, UserProfile } from "@/db/schema";

export type ReactionItem = { emoji: string; userId: string; userDisplayName?: string };

export type CachedMessage = Message & {
  sender?: UserProfile;
  optimistic?: boolean;
  readAt?: string | Date | null;
  reactions?: ReactionItem[] | null;
};

export type CachedConversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  otherParticipant: UserProfile;
  unreadCount?: number;
  isArchived?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  lastClearedAt?: string | Date | null;
  lastMessage: {
    id: string;
    body: string;
    senderId?: string;
    readAt?: string | Date | null;
    createdAt: string;
  } | null;
};

// Global in-memory fast cache across page views
const memoryMessageCache = new Map<string, CachedMessage[]>();
let memoryConversationsCache: CachedConversation[] | null = null;

export function getCachedMessages(conversationId: string): CachedMessage[] | null {
  if (memoryMessageCache.has(conversationId)) {
    return memoryMessageCache.get(conversationId)!;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`cl_chat_msgs_${conversationId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as CachedMessage[];
        memoryMessageCache.set(conversationId, parsed);
        return parsed;
      }
    } catch {
      // Ignore storage errors
    }
  }
  return null;
}

export function setCachedMessages(conversationId: string, msgs: CachedMessage[]): void {
  memoryMessageCache.set(conversationId, msgs);
  if (typeof window !== "undefined") {
    try {
      // Keep at most last 100 messages in localStorage to avoid storage quota bloat
      const trimmed = msgs.slice(-100);
      localStorage.setItem(`cl_chat_msgs_${conversationId}`, JSON.stringify(trimmed));
    } catch {
      // Ignore storage errors
    }
  }
}

export function getCachedConversations(): CachedConversation[] | null {
  if (memoryConversationsCache) return memoryConversationsCache;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("cl_chat_convs");
      if (stored) {
        const parsed = JSON.parse(stored) as CachedConversation[];
        memoryConversationsCache = parsed;
        return parsed;
      }
    } catch {
      // Ignore storage errors
    }
  }
  return null;
}

export function setCachedConversations(convs: CachedConversation[]): void {
  memoryConversationsCache = convs;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("cl_chat_convs", JSON.stringify(convs));
    } catch {
      // Ignore storage errors
    }
  }
}

export function updateCachedConversationLastMessage(
  conversationId: string,
  lastMessage: {
    id: string;
    body: string;
    senderId?: string;
    createdAt: string;
  }
): void {
  const convs = getCachedConversations() || [];
  const updated = convs.map((c) => {
    if (c.id !== conversationId) return c;
    return {
      ...c,
      updatedAt: lastMessage.createdAt,
      lastMessage: {
        id: lastMessage.id,
        body: lastMessage.body,
        senderId: lastMessage.senderId,
        readAt: null,
        createdAt: lastMessage.createdAt,
      },
    };
  });
  setCachedConversations(updated);
}
