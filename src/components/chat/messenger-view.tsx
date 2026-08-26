"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/db/schema";
import {
  Search,
  MessageSquare,
  ShieldCheck,
  Plus,
  Loader2,
  Users2,
  CheckCheck,
} from "lucide-react";
import { MessengerPane } from "./messenger-pane";
import { cn } from "@/lib/utils";
import {
  CachedConversation,
  getCachedConversations,
  setCachedConversations,
} from "@/lib/chat-cache";

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

export function MessengerView({
  currentUserId,
  initialTargetUserId,
  initialConversationId,
}: MessengerViewProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // If initialConversationId is provided or active conversation is unset, pick the first or match
  const activeConv = conversations?.find((c) => c.id === activeConversationId);
  const activeParticipant = activeConv ? activeConv.otherParticipant : null;

  // Auto-start or select conversation if targetUserId was provided via URL query
  useEffect(() => {
    if (!initialTargetUserId || !conversations) return;

    const existing = conversations.find((c) => c.otherParticipant.id === initialTargetUserId);
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      startConversation(initialTargetUserId);
    }
  }, [initialTargetUserId, conversations]);

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
      setActiveConversationId(data.id);
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
              <div className="size-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <MessageSquare className="size-4.5" />
              </div>
              <h1 className="text-base font-black tracking-tight text-foreground">Chats</h1>
            </div>

            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              {conversations?.length || 0} Chats
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students to message..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-9 pl-9 pr-4 rounded-full border border-border/50 bg-muted/30 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 transition-all"
            />
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
                    className="size-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all shrink-0"
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
            {conversations?.map((conv) => {
              const other = conv.otherParticipant;
              const isSelected = conv.id === activeConversationId;
              const unread = conv.unreadCount || 0;
              const isLastMe = conv.lastMessage?.senderId === currentUserId;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group border-l-3",
                    isSelected
                      ? "bg-muted/90 dark:bg-muted/50 border-emerald-500 shadow-2xs"
                      : "border-transparent hover:bg-muted/40"
                  )}
                >
                  {/* Avatar with Online indicator */}
                  <div className="relative shrink-0">
                    <Avatar className="size-11 border border-border/40 shadow-2xs">
                      <AvatarImage src={other.avatarUrl || ""} />
                      <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                        {(other.displayName?.[0] || "S").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  </div>

                  {/* Body & Snippet */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className={cn("text-xs truncate flex items-center gap-1", isSelected ? "font-black text-foreground" : "font-bold text-foreground")}>
                        <span>{other.displayName}</span>
                        <ShieldCheck className="size-3 text-blue-500 shrink-0" />
                      </p>
                      {conv.lastMessage && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold shrink-0",
                            unread > 0 ? "text-emerald-500 font-bold" : "text-muted-foreground"
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

                      {/* WhatsApp Green Unread Badge */}
                      {unread > 0 && (
                        <span className="size-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs animate-in zoom-in-75">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {conversations && conversations.length === 0 && (
              <div className="py-16 text-center space-y-3 px-4">
                <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                  <Users2 className="size-6" />
                </div>
                <p className="text-xs font-bold text-foreground">No conversations yet</p>
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
          onBack={() => setActiveConversationId(null)}
        />
      </main>
    </div>
  );
}
