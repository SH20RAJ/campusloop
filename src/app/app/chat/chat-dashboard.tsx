"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatPane } from "./chat-pane";
import { UserProfile } from "@/db/schema";
import { SearchIcon, MessageSquareIcon, UserPlusIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ConversationWithDetail = {
  id: string;
  createdAt: string;
  updatedAt: string;
  otherParticipant: UserProfile;
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
  } | null;
};

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

export function ChatDashboard({
  currentUserId,
  targetUserId,
}: {
  currentUserId: string;
  targetUserId?: string;
}) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // SWR for conversations list (polls every 2.5s for new incoming DMs)
  const { data: conversations, mutate: mutateConvs } = useSWR<ConversationWithDetail[]>(
    "/api/chat",
    fetcher,
    { refreshInterval: 2500, revalidateOnFocus: true }
  );

  const activeConv = conversations?.find((c) => c.id === activeConversationId);
  const activeParticipant = activeConv ? activeConv.otherParticipant : null;

  // Auto-start or select conversation with targetUserId on mount
  useEffect(() => {
    if (!targetUserId || !conversations) return;

    const existing = conversations.find((c) => c.otherParticipant.id === targetUserId);
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      startConversation(targetUserId);
    }
  }, [targetUserId, conversations]);

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* ─── Inbox / Conversation List ─── */}
      <div
        className={cn(
          "w-full md:w-80 flex flex-col bg-card border-r border-border h-full shrink-0",
          activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <MessageSquareIcon className="size-5 text-primary" /> Direct Messages
            </h2>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full border border-border">
              {conversations?.length || 0} Chats
            </span>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search campus students..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-muted/50 rounded-xl border border-border/60 focus:border-primary focus:bg-background outline-none transition-all"
            />
          </div>
        </div>

        {/* Conversation List / Search Results */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40 pb-20 md:pb-4">
          {searchQuery ? (
            <div className="p-2 space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground px-2 block mb-2">
                Matching Students
              </span>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => startConversation(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-left transition-colors cursor-pointer"
                >
                  <Avatar className="size-9 border border-border shrink-0">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="font-bold">{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{user.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
                  </div>
                  <UserPlusIcon className="size-4 text-primary shrink-0" />
                </button>
              ))}
              {searchResults.length === 0 && !isSearching && (
                <p className="text-xs text-muted-foreground text-center py-6">No students found matching "{searchQuery}"</p>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations?.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveConversationId(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all cursor-pointer",
                      isActive
                        ? "bg-primary/10 border border-primary/30 text-primary shadow-xs"
                        : "hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Avatar className="size-10 border border-border shrink-0">
                      <AvatarImage src={conv.otherParticipant.avatarUrl || ""} />
                      <AvatarFallback className="font-bold">{conv.otherParticipant.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={cn("text-xs font-bold truncate", isActive ? "text-primary" : "text-foreground")}>
                          {conv.otherParticipant.displayName}
                        </p>
                      </div>
                      <p className="text-[11px] truncate leading-normal text-muted-foreground">
                        {conv.lastMessage ? conv.lastMessage.body : "Start conversation..."}
                      </p>
                    </div>
                  </button>
                );
              })}

              {conversations?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3 px-4">
                  <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                    <Sparkles className="size-6 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-foreground">No active chats yet</p>
                  <p className="text-[11px] text-muted-foreground max-w-[200px]">
                    Search for classmates or match on Campus Dating to start messaging!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Chat Window Pane ─── */}
      <div
        className={cn(
          "flex-1 h-full flex flex-col",
          !activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        <ChatPane
          conversationId={activeConversationId}
          otherParticipant={activeParticipant}
          currentUserId={currentUserId}
          onBack={() => setActiveConversationId(null)}
        />
      </div>
    </div>
  );
}
