"use client";

import { useState } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatPane } from "./chat-pane";
import { UserProfile } from "@/db/schema";
import { SearchIcon, MessageSquareIcon, UserPlusIcon } from "lucide-react";

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

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<any>;
});

export function ChatDashboard({ currentUserId }: { currentUserId: string }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // SWR for conversations list
  const { data: conversations, mutate: mutateConvs } = useSWR<ConversationWithDetail[]>(
    "/api/chat",
    fetcher
  );

  const activeConv = conversations?.find(c => c.id === activeConversationId);
  const activeParticipant = activeConv ? activeConv.otherParticipant : null;

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
        const data = await res.json() as UserProfile[];
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

      const data = await res.json() as { id: string };
      
      setSearchQuery("");
      setSearchResults([]);
      
      // Select the conversation
      setActiveConversationId(data.id);
      
      // Reload conversations list
      mutateConvs();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex h-full w-full overflow-hidden divide-x divide-border">
      {/* Left Pane - Inbox List */}
      <div className="w-80 flex flex-col bg-card shrink-0 h-full">
        {/* Search Header */}
        <div className="p-4 border-b border-border space-y-3">
          <h2 className="text-lg font-bold text-foreground">Messages</h2>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted rounded-md border-0 focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
        </div>

        {/* Conversation List / Search Results */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery ? (
            <div className="p-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 block mb-2">Search Results</span>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left transition-colors cursor-pointer"
                >
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
                  </div>
                  <UserPlusIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                </button>
              ))}
              {searchResults.length === 0 && !isSearching && (
                <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations?.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isActive ? "bg-muted text-foreground" : "hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <Avatar className="h-9 w-9 border shrink-0">
                      <AvatarImage src={conv.otherParticipant.avatarUrl || ""} />
                      <AvatarFallback>{conv.otherParticipant.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={`text-xs font-semibold truncate ${isActive ? "text-foreground" : "text-foreground/90"}`}>
                          {conv.otherParticipant.displayName}
                        </p>
                      </div>
                      <p className="text-[11px] truncate leading-normal">
                        {conv.lastMessage ? conv.lastMessage.body : "No messages yet"}
                      </p>
                    </div>
                  </button>
                ))}
              {conversations?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
                  <MessageSquareIcon className="h-8 w-8 opacity-40" />
                  <p className="text-xs">No active chats. Start one by searching above!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      <div className="flex-1 h-full">
        <ChatPane
          conversationId={activeConversationId}
          otherParticipant={activeParticipant}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
