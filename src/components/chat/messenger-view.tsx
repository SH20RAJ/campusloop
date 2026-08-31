"use client";

import {
  Archive,
  BellOff,
  CheckCheck,
  Loader2,
  MessageSquare,
  MoreVertical,
  Pin,
  Plus,
  Search,
  ShieldCheck,
  Users2,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PresenceDot } from "@/components/ui/presence-dot";
import type { UserProfile } from "@/db/schema";
import { type CachedConversation, getCachedConversations, setCachedConversations } from "@/lib/chat-cache";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { ConversationActionModal } from "./conversation-action-modal";
import { CreateGroupModal } from "./create-group-modal";
import { MessengerPane } from "./messenger-pane";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<T>;
};

interface MessengerViewProps {
  currentUserId: string;
  initialTargetUserId?: string;
  initialConversationId?: string;
}

type InboxFilter = "ALL" | "UNREAD" | "GROUPS" | "CAMPUS" | "ARCHIVED";

export function MessengerView({
  currentUserId,
  initialTargetUserId,
  initialConversationId,
}: MessengerViewProps) {
  const router = useRouter();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<InboxFilter>("ALL");
  const [actionConv, setActionConv] = useState<CachedConversation | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handleTouchStart = (conv: CachedConversation) => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(40);
      }
      setActionConv(conv);
      setShowActionModal(true);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Keep state in sync if URL route changes to another /app/chat/[id]
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  // Fast Hard Cache: Initial fallback from in-memory / local storage cache for 0ms instant display
  const initialCache = getCachedConversations();

  // SWR for conversations list (polls every 2.5s for real-time WhatsApp inbox sync)
  const {
    data: conversations,
    isLoading: isLoadingConvs,
    mutate: mutateConvs,
  } = useSWR<CachedConversation[]>("/api/chat", fetcher, {
    fallbackData: initialCache || undefined,
    refreshInterval: 2500,
    revalidateOnFocus: true,
    onSuccess: (data) => {
      if (data) setCachedConversations(data);
    },
  });

  // Auto-select first conversation on desktop if visiting /app/chat root
  useEffect(() => {
    if (
      !initialConversationId &&
      !activeConversationId &&
      conversations &&
      conversations.length > 0 &&
      typeof window !== "undefined" &&
      window.innerWidth >= 768
    ) {
      const firstId = conversations[0].id;
      setActiveConversationId(firstId);
      window.history.replaceState(null, "", `/app/chat/${firstId}`);
    }
  }, [conversations, activeConversationId, initialConversationId]);

  // Sync state when browser back / forward buttons are pressed
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/\/app\/chat\/([^/]+)/);
      setActiveConversationId(match ? match[1] : null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectConversation = useCallback((convId: string) => {
    sounds.tap();
    haptics.light();
    setActiveConversationId(convId);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/app/chat/${convId}`);
    }
  }, []);

  // Auto-start or select conversation if targetUserId was provided via URL query
  useEffect(() => {
    if (!initialTargetUserId || !conversations) return;

    const existing = conversations.find((c) => c.otherParticipant?.id === initialTargetUserId);
    if (existing) {
      handleSelectConversation(existing.id);
    } else {
      startConversation(initialTargetUserId);
    }
  }, [initialTargetUserId, conversations, startConversation, handleSelectConversation]);

  const handleBackToInbox = useCallback(() => {
    setActiveConversationId(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/app/chat");
    }
  }, []);

  async function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/chat/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = (await res.json()) as UserProfile[];
        setSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }

  async function startConversation(participantId: string) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });

      if (!res.ok) throw new Error("Failed to create conversation");

      const data = (await res.json()) as { id: string };

      setSearchQuery("");
      setSearchResults([]);
      handleSelectConversation(data.id);
      mutateConvs();
    } catch (err) {
      console.error(err);
    }
  }

  function formatRelativeTime(dateVal: string) {
    try {
      const d = new Date(dateVal);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m`;
      const hours = Math.floor(mins / 60);
      if (hours < 24 && d.getDate() === now.getDate()) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      const days = Math.floor(hours / 24);
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days}d`;
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  }

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    let list = [...conversations];

    if (activeFilter === "ARCHIVED") {
      return list.filter((c) => Boolean(c.isArchived));
    }

    // By default, exclude archived conversations from main tabs
    list = list.filter((c) => !c.isArchived);

    if (activeFilter === "UNREAD") {
      list = list.filter((c) => (c.unreadCount || 0) > 0);
    } else if (activeFilter === "GROUPS") {
      list = list.filter((c) => Boolean(c.isGroup || c.type === "GROUP" || c.isCommunity));
    } else if (activeFilter === "CAMPUS") {
      list = list.filter((c) => Boolean(c.otherParticipant?.institutionId && !c.isGroup));
    }

    return list;
  }, [conversations, activeFilter]);

  const activeConv = conversations?.find((c) => c.id === activeConversationId);
  const activeParticipant = activeConv ? activeConv.otherParticipant : null;

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-background select-none">
      {/* ─── Inbox / Conversation List (Left Column) ─── */}
      <aside
        className={cn(
          "w-full md:w-80 lg:w-96 flex flex-col bg-card border-r border-border/30 h-full shrink-0 overflow-hidden",
          activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-border/30 space-y-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link
                href="/app"
                className="size-8 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Back to Campus Feed"
              >
                <img src="/logo.png" alt="CampusLoop" className="size-5 object-contain" />
              </Link>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground">Chats</h1>
              {conversations && conversations.length > 0 && (
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/app/random"
                onClick={() => {
                  sounds.pop();
                  haptics.medium();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Meet someone unexpected in Random Loop"
              >
                <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                <span>Random</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setShowCreateGroupModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Create campus group or study pod"
              >
                <Users2 className="size-3.5" />
                <span>+ Group</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students or groups..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-border/50 bg-muted/40 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* WhatsApp-Style Filter Pills */}
          <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("UNREAD")}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                activeFilter === "UNREAD"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Unread</span>
              {conversations &&
                conversations.filter((c) => (c.unreadCount || 0) > 0 && !c.isArchived).length > 0 && (
                  <span className="size-1.5 rounded-full bg-amber-400" />
                )}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("GROUPS")}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                activeFilter === "GROUPS"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Users2 className="size-3" />
              <span>Groups</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("CAMPUS")}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeFilter === "CAMPUS"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Campus
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("ARCHIVED")}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                activeFilter === "ARCHIVED"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Archive className="size-3" />
              <span>Archived</span>
              {conversations && conversations.filter((c) => Boolean(c.isArchived)).length > 0 && (
                <span className="text-[10px] opacity-80">
                  ({conversations.filter((c) => Boolean(c.isArchived)).length})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Results Dropdown / Replacement List */}
        {searchQuery.trim() ? (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Search Results
            </p>
            {isSearching ? (
              <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Searching peers...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <Avatar className="size-10 border border-border/40 shrink-0">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                      {user.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-black text-foreground truncate flex items-center gap-1">
                      <span>{user.displayName}</span>
                      <ShieldCheck className="size-3 text-blue-500 shrink-0" />
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      @{user.username} {user.branch ? `• ${user.branch}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No students found for &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        ) : (
          /* Conversation Inbox List */
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {!conversations && isLoadingConvs ? (
              <div className="space-y-1.5 p-1">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-border/10 bg-muted/10 animate-pulse"
                  >
                    <div className="size-11 rounded-full bg-muted/60 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-3.5 w-24 bg-muted/60 rounded-full" />
                        <div className="h-2.5 w-8 bg-muted/40 rounded-full" />
                      </div>
                      <div className="h-2.5 w-3/4 bg-muted/40 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = conv.otherParticipant;
                if (!other) return null;

                const isSelected = conv.id === activeConversationId;
                const unread = conv.unreadCount || 0;
                const isLastMe = conv.lastMessage?.senderId === currentUserId;

                return (
                  <div
                    key={conv.id}
                    onTouchStart={() => handleTouchStart(conv)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActionConv(conv);
                      setShowActionModal(true);
                    }}
                    onClick={() => {
                      if (isLongPressRef.current) {
                        isLongPressRef.current = false;
                        return;
                      }
                      handleSelectConversation(conv.id);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group border-l-3 relative",
                      isSelected
                        ? "bg-muted/90 dark:bg-muted/50 border-primary shadow-2xs"
                        : "border-transparent hover:bg-muted/40"
                    )}
                  >
                    {/* Avatar with Online presence indicator */}
                    <div className="relative shrink-0">
                      <Avatar className="size-11 border border-border/40 shadow-2xs">
                        <AvatarImage src={other.avatarUrl || ""} />
                        <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                          {(other.displayName?.[0] || "S").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <PresenceDot lastSeenAt={other.lastSeenAt} />
                    </div>

                    {/* Body & Snippet */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <div
                          className={cn(
                            "text-xs truncate flex items-center gap-1 min-w-0",
                            isSelected ? "font-black text-foreground" : "font-bold text-foreground"
                          )}
                        >
                          <span className="truncate">{other.displayName}</span>
                          {other.points && other.points >= 150 && (
                            <ShieldCheck className="size-3 text-[#1d9bf0] shrink-0" />
                          )}
                          {conv.isPinned && (
                            <span title="Pinned chat">
                              <Pin className="size-2.5 text-amber-500 shrink-0 fill-amber-500" />
                            </span>
                          )}
                          {conv.isMuted && (
                            <span title="Muted chat">
                              <BellOff className="size-2.5 text-muted-foreground shrink-0" />
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <span
                            className={cn(
                              "text-[10px] font-semibold shrink-0",
                              unread > 0 ? "text-primary font-bold" : "text-muted-foreground"
                            )}
                          >
                            {formatRelativeTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          {/* WhatsApp Seen Tick Indicator on last message */}
                          {isLastMe &&
                            conv.lastMessage &&
                            (conv.lastMessage.readAt ? (
                              <CheckCheck className="size-3.5 text-sky-400 shrink-0" />
                            ) : (
                              <CheckCheck className="size-3.5 text-muted-foreground shrink-0" />
                            ))}
                          <p
                            className={cn(
                              "text-[11px] truncate leading-tight",
                              unread > 0 ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                            )}
                          >
                            {conv.lastMessage?.body || "Start a campus chat..."}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* CampusLoop Primary Unread Badge */}
                          {unread > 0 && (
                            <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs animate-in zoom-in-75">
                              {unread}
                            </span>
                          )}

                          {/* 3-Dots Action Button for PC/Desktop */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionConv(conv);
                              setShowActionModal(true);
                            }}
                            className="size-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Chat options"
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {filteredConversations.length === 0 && (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <Users2 className="size-6" />
                </div>
                <p className="text-xs font-bold text-foreground">
                  {activeFilter === "UNREAD" ? "No unread messages" : "No conversations yet"}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Search above to message classmates, study buddies, or campus matches.
                </p>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ─── Active Chat Window (Right Column / Fullscreen on Mobile) ─── */}
      <main
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden bg-background",
          !activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        <MessengerPane
          conversationId={activeConversationId}
          otherParticipant={activeParticipant}
          currentUserId={currentUserId}
          onBack={handleBackToInbox}
        />
      </main>

      {/* Conversation Action Modal (Mobile Long Press & Desktop 3 Dots) */}
      <ConversationActionModal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setActionConv(null);
        }}
        conversation={actionConv}
        currentUserId={currentUserId}
        onActionComplete={() => mutateConvs()}
        onDeleteConversation={(convId) => {
          if (activeConversationId === convId) {
            handleBackToInbox();
          }
        }}
      />

      {/* Create Campus Group / Study Pod Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        currentUserId={currentUserId}
        onGroupCreated={(newConvId: string, createdConv?: any) => {
          if (createdConv) {
            mutateConvs((prev) => {
              if (!prev) return [createdConv];
              const filtered = prev.filter((c) => c.id !== newConvId);
              return [createdConv, ...filtered];
            }, false);
          } else {
            mutateConvs();
          }
          handleSelectConversation(newConvId);
        }}
      />
    </div>
  );
}
