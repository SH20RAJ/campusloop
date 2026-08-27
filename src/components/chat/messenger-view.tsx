"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { PresenceDot } from "@/components/ui/presence-dot";
import { UserProfile } from "@/db/schema";
import {
CachedConversation,
getCachedConversations,
setCachedConversations,
} from "@/lib/chat-cache";
import { cn } from "@/lib/utils";
import {
CheckCheck,
Loader2,
MessageSquare,
Plus,
Search,
ShieldCheck,
Users2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback,useEffect,useMemo,useState } from "react";
import useSWR from "swr";
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

type InboxFilter = "ALL" | "UNREAD" | "CAMPUS";

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

  // Keep state in sync if URL route changes to another /app/chat/[id]
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  // Fast Hard Cache: Initial fallback from in-memory / local storage cache for 0ms instant display
  const initialCache = getCachedConversations();

  // SWR for conversations list (polls every 2.5s for real-time WhatsApp inbox sync)
  const { data: conversations, mutate: mutateConvs } = useSWR<CachedConversation[]>(
    "/api/chat",
    fetcher,
    {
      fallbackData: initialCache || undefined,
      refreshInterval: 2500,
      revalidateOnFocus: true,
      onSuccess: (data) => {
        if (data) setCachedConversations(data);
      },
    }
  );

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

  // Auto-start or select conversation if targetUserId was provided via URL query
  useEffect(() => {
    if (!initialTargetUserId || !conversations) return;

    const existing = conversations.find((c) => c.otherParticipant?.id === initialTargetUserId);
    if (existing) {
      handleSelectConversation(existing.id);
    } else {
      startConversation(initialTargetUserId);
    }
  }, [initialTargetUserId, conversations]);

  const handleSelectConversation = useCallback(
    (convId: string) => {
      setActiveConversationId(convId);
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", `/app/chat/${convId}`);
      }
    },
    []
  );

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

    if (activeFilter === "UNREAD") {
      list = list.filter((c) => (c.unreadCount || 0) > 0);
    } else if (activeFilter === "CAMPUS") {
      list = list.filter((c) => Boolean(c.otherParticipant?.institutionId));
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
            <div className="flex items-center gap-2">
              <Link
                href="/app"
                className="size-8 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Back to Campus Feed"
              >
                <img src="/logo.png" alt="CampusLoop" className="size-5 object-contain" />
              </Link>
              <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
                <MessageSquare className="size-4.5" />
              </div>
              <h1 className="text-base font-black tracking-tight text-foreground">Chats</h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/app"
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted transition-all"
              >
                Feed
              </Link>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {conversations?.length || 0}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students to message..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-9 pl-9 pr-4 rounded-full border border-border/50 bg-muted/30 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all"
            />
          </div>

          {/* WhatsApp-Style Filter Pills */}
          <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
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
                "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                activeFilter === "UNREAD"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Unread</span>
              {conversations && conversations.filter((c) => (c.unreadCount || 0) > 0).length > 0 && (
                <span className="size-1.5 rounded-full bg-amber-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("CAMPUS")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeFilter === "CAMPUS"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Campus
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
            {filteredConversations.map((conv) => {
              const other = conv.otherParticipant;
              if (!other) return null;

              const isSelected = conv.id === activeConversationId;
              const unread = conv.unreadCount || 0;
              const isLastMe = conv.lastMessage?.senderId === currentUserId;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group border-l-3",
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
                      <p
                        className={cn(
                          "text-xs truncate flex items-center gap-1",
                          isSelected ? "font-black text-foreground" : "font-bold text-foreground"
                        )}
                      >
                        <span>{other.displayName}</span>
                        <ShieldCheck className="size-3 text-blue-500 shrink-0" />
                      </p>
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
                      <div className="flex items-center gap-1 min-w-0">
                        {/* WhatsApp Seen Tick Indicator on last message */}
                        {isLastMe && conv.lastMessage && (
                          conv.lastMessage.readAt ? (
                            <CheckCheck className="size-3.5 text-sky-400 shrink-0" />
                          ) : (
                            <CheckCheck className="size-3.5 text-muted-foreground shrink-0" />
                          )
                        )}
                        <p
                          className={cn(
                            "text-[11px] truncate leading-tight",
                            unread > 0 ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                          )}
                        >
                          {conv.lastMessage?.body || "Start a campus chat..."}
                        </p>
                      </div>

                      {/* CampusLoop Primary Unread Badge */}
                      {unread > 0 && (
                        <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs animate-in zoom-in-75">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

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
    </div>
  );
}
