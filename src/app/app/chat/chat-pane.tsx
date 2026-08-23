"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, UserProfile } from "@/db/schema";
import { SendIcon, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

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
  onBack?: () => void;
}

export function ChatPane({
  conversationId,
  otherParticipant,
  currentUserId,
  onBack,
}: ChatPaneProps) {
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
        bannerUrl: null,
        headline: null,
        userId: "",
        institutionId: "",
        course: null,
        branch: null,
        year: null,
        bio: null,
        interests: [],
        photos: [],
        onboardingCompleted: true,
        role: "STUDENT",
        status: "ACTIVE",
        gender: "ALL",
        dob: null,
        isDobPrivate: false,
        datingPreferences: null,
        referralCount: 0,
        referredById: null,
        points: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mutate((prev) => [...(prev || []), optimisticMessage], false);

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
      mutate();
    } finally {
      setIsSending(false);
    }
  }

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <div className="size-16 rounded-3xl bg-muted/40 border border-border flex items-center justify-center mb-3">
          <Sparkles className="size-7 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">Select a conversation</p>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          Choose a student from your inbox or search above to start private chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background select-none">
      {/* Top Header with Back button for mobile */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 md:px-6 py-3.5 shadow-xs shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted/30 text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}

          <Link href={`/@${otherParticipant.username || "student"}`} className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-9 border border-primary/20 shrink-0">
              <AvatarImage src={otherParticipant.avatarUrl || ""} />
              <AvatarFallback className="font-bold text-xs">{(otherParticipant.displayName?.[0] || "S").toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground flex items-center gap-1 truncate">
                {otherParticipant.displayName || "Student"}
                <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
              </span>
              <span className="text-[10px] text-muted-foreground truncate block">@{otherParticipant.username || "student"}</span>
            </div>
          </Link>
        </div>

        <Link
          href={`/@${otherParticipant.username || "student"}`}
          className="text-[10px] font-bold text-primary hover:underline px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
        >
          View Profile
        </Link>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3">
        {messages?.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[80%] md:max-w-[70%] items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {!isMe && (
                  <Avatar className="size-6 border shrink-0">
                    <AvatarImage src={otherParticipant.avatarUrl || ""} />
                    <AvatarFallback className="text-[8px] font-bold">{(otherParticipant.displayName?.[0] || "S").toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-xs font-medium"
                      : "bg-muted/70 text-foreground rounded-bl-xs border border-border font-medium"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box with sticky bottom padding for mobile safe area */}
      <form
        onSubmit={handleSend}
        className="border-t border-border bg-card p-3 md:p-4 flex gap-2 items-center shrink-0 mb-16 md:mb-0"
      >
        <input
          type="text"
          placeholder="Type a campus message..."
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          required
          className="flex h-10 flex-1 rounded-xl border border-border/80 bg-muted/30 px-3.5 py-2 text-xs font-semibold shadow-xs placeholder:text-muted-foreground focus:border-primary focus:bg-background outline-none transition-all"
        />
        <button
          type="submit"
          disabled={isSending || !msgText.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <SendIcon className="size-4" />
        </button>
      </form>
    </div>
  );
}
