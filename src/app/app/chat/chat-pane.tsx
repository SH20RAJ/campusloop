"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, UserProfile } from "@/db/schema";
import { SendIcon } from "lucide-react";

type MessageWithSender = Message & {
  sender: UserProfile;
};

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

interface ChatPaneProps {
  conversationId: string | null;
  otherParticipant: UserProfile | null;
  currentUserId: string;
}

export function ChatPane({ conversationId, otherParticipant, currentUserId }: ChatPaneProps) {
  const [msgText, setMsgText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Poll for messages every 2 seconds
  const { data: messages, mutate } = useSWR<MessageWithSender[]>(
    conversationId ? `/api/chat/${conversationId}/messages` : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim() || !conversationId || isSending) return;

    setIsSending(true);
    const bodyText = msgText;
    setMsgText("");

    // Optimistic Update
    const optimisticMessage: MessageWithSender = {
      id: Math.random().toString(),
      conversationId,
      senderId: currentUserId,
      body: bodyText,
      createdAt: new Date(),
      updatedAt: new Date(),
      sender: {
        id: currentUserId,
        displayName: "Me",
        officialName: "Me",
        username: "me",
        avatarUrl: "",
        userId: "",
        institutionId: "",
        course: null,
        branch: null,
        year: null,
        bio: null,
        interests: [],
        onboardingCompleted: true,
        role: "STUDENT",
        status: "ACTIVE",
        gender: "ALL",
        referralCount: 0,
        referredById: null,
        points: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };

    mutate(prev => [...(prev || []), optimisticMessage], false);

    try {
      const res = await fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: bodyText }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      mutate();
    } catch (err) {
      console.error(err);
      mutate(); // Revert on failure
    } finally {
      setIsSending(false);
    }
  }

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-6">
        <p className="text-sm font-medium">Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4">
        <Avatar className="h-9 w-9 border">
          <AvatarImage src={otherParticipant.avatarUrl || ""} />
          <AvatarFallback>{otherParticipant.displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">{otherParticipant.displayName}</span>
          <span className="text-xs text-muted-foreground">@{otherParticipant.username}</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages?.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[70%] items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {!isMe && (
                  <Avatar className="h-6 w-6 border shrink-0">
                    <AvatarImage src={otherParticipant.avatarUrl || ""} />
                    <AvatarFallback className="text-[8px]">{otherParticipant.displayName[0]}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-br-none" 
                    : "bg-muted text-foreground rounded-bl-none border border-border"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="border-t border-border bg-card px-6 py-4 flex gap-3 items-center">
        <input
          type="text"
          placeholder="Type your message..."
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          required
          className="flex h-10 flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={isSending || !msgText.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-50"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
