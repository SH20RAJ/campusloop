"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, UserProfile } from "@/db/schema";
import { SendIcon, ArrowLeft, ShieldCheck, Sparkles, Smile } from "lucide-react";
import Link from "next/link";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";

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
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
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

  async function sendMessage(bodyText: string) {
    if (!bodyText.trim() || !conversationId || isSending) return;

    setIsSending(true);

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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim()) return;
    const text = msgText;
    setMsgText("");
    await sendMessage(text);
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
          const isDirectMedia =
            /^https?:\/\/.+\.(gif|jpeg|jpg|png|webp)(\?.*)?$/i.test(msg.body.trim()) ||
            msg.body.trim().startsWith("https://media.giphy.com/") ||
            msg.body.trim().startsWith("https://i.giphy.com/");

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 max-w-[80%] md:max-w-[70%] items-end ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {!isMe && (
                  <Avatar className="size-6 shrink-0">
                    <AvatarImage src={otherParticipant.avatarUrl || ""} />
                    <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">{(otherParticipant.displayName?.[0] || "S").toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`rounded-2xl text-xs overflow-hidden ${
                    isDirectMedia
                      ? "p-1 bg-transparent border-0"
                      : isMe
                      ? "bg-primary text-primary-foreground rounded-br-xs font-medium px-3.5 py-2"
                      : "bg-muted/70 text-foreground rounded-bl-xs font-medium px-3.5 py-2"
                  }`}
                >
                  {isDirectMedia ? (
                    <img
                      src={msg.body.trim()}
                      alt="Shared Media / Sticker"
                      className="max-h-56 max-w-full rounded-2xl object-contain shadow-xs"
                      loading="lazy"
                    />
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                  )}
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
        className="border-t border-border/20 bg-card p-3 md:p-4 flex gap-2 items-center shrink-0 mb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:mb-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:pb-4 touch-manipulation"
      >
        <button
          type="button"
          onClick={() => setShowStickerPicker(true)}
          className="flex h-11 md:h-10 px-3 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer gap-1"
          title="Send Sticker"
        >
          <Smile className="size-3.5" />
          <span className="hidden sm:inline text-[11px]">Sticker</span>
        </button>

        <button
          type="button"
          onClick={() => setShowGifPicker(true)}
          className="flex h-11 md:h-10 px-2.5 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          title="Send GIF"
        >
          GIF
        </button>

        <input
          type="text"
          placeholder="Type a campus message..."
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          className="flex h-11 md:h-10 flex-1 rounded-xl bg-muted/40 px-4 py-2 text-sm md:text-xs font-semibold placeholder:text-muted-foreground focus:bg-background outline-none transition-all"
        />
        <button
          type="submit"
          disabled={isSending || !msgText.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <SendIcon className="size-4" />
        </button>
      </form>

      {/* GIF Picker Modal */}
      <GifPickerModal
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={(url) => sendMessage(url)}
      />

      {/* Sticker Picker Modal */}
      <StickerPickerModal
        isOpen={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelectSticker={(sticker) => sendMessage(sticker.url)}
      />
    </div>
  );
}
