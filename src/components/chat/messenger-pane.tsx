"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, UserProfile } from "@/db/schema";
import {
  Send,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Smile,
  CheckCheck,
  Check,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  Info,
  Heart,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";
import { cn } from "@/lib/utils";

type MessageWithSender = Message & {
  sender?: UserProfile;
  optimistic?: boolean;
};

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json() as Promise<T>;
  });

interface MessengerPaneProps {
  conversationId: string | null;
  otherParticipant: UserProfile | null;
  currentUserId: string;
  onBack?: () => void;
}

export function MessengerPane({
  conversationId,
  otherParticipant,
  currentUserId,
  onBack,
}: MessengerPaneProps) {
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

  // Auto scroll to bottom smoothly on message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(bodyText: string) {
    if (!bodyText.trim() || !conversationId || isSending) return;

    setIsSending(true);

    // Optimistic Message insertion
    const optimisticMessage: MessageWithSender = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      body: bodyText,
      createdAt: new Date(),
      updatedAt: new Date(),
      optimistic: true,
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!msgText.trim()) return;
      const text = msgText;
      setMsgText("");
      sendMessage(text);
    }
  }

  function handleSendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim()) return;
    const text = msgText;
    setMsgText("");
    sendMessage(text);
  }

  function formatTime(dateVal: string | Date) {
    try {
      const d = new Date(dateVal);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function formatDateSeparator(dateVal: string | Date) {
    try {
      const d = new Date(dateVal);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return "Today";
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  }

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-6 text-center select-none">
        <div className="size-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-sm animate-in zoom-in-95">
          <Sparkles className="size-9 text-primary" />
        </div>
        <h2 className="text-base font-extrabold text-foreground">Your Direct Campus Messages</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
          Select a chat from your inbox or search for fellow verified students to start a secure conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background select-none overflow-hidden">
      {/* ─── Messenger Header (With Safe Area Top Padding) ─── */}
      <header className="flex items-center justify-between border-b border-border/40 bg-card/90 backdrop-blur-md px-3 sm:px-5 py-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden flex size-8 items-center justify-center rounded-full bg-muted/60 text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}

          <Link href={`/@${otherParticipant.username || "student"}`} className="flex items-center gap-2.5 min-w-0 group">
            <div className="relative shrink-0">
              <Avatar className="size-9 sm:size-10 border border-border/60 shadow-2xs group-hover:opacity-90 transition-opacity">
                <AvatarImage src={otherParticipant.avatarUrl || ""} />
                <AvatarFallback className="font-black text-xs bg-primary/10 text-primary">
                  {(otherParticipant.displayName?.[0] || "S").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                  {otherParticipant.displayName || "Student"}
                </span>
                <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
              </div>
              <p className="text-[10px] text-muted-foreground truncate font-medium">
                @{otherParticipant.username} {otherParticipant.branch ? `• ${otherParticipant.branch}` : "• Verified Student"}
              </p>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/@${otherParticipant.username || "student"}`}
            className="flex items-center gap-1 text-[11px] font-bold text-foreground hover:text-primary px-3 py-1.5 rounded-full bg-muted/40 hover:bg-muted transition-all cursor-pointer shadow-2xs"
          >
            <Info className="size-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>
      </header>

      {/* ─── Messages Thread Viewport ─── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3.5">
        {messages?.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId;
          const isDirectMedia =
            /^https?:\/\/.+\.(gif|jpeg|jpg|png|webp)(\?.*)?$/i.test(msg.body.trim()) ||
            msg.body.trim().startsWith("https://media.giphy.com/") ||
            msg.body.trim().startsWith("https://i.giphy.com/");

          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const showDateSeparator =
            !prevMsg ||
            new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

          return (
            <div key={msg.id} className="space-y-2">
              {/* Date Separator Pill */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-3">
                  <span className="text-[10px] font-bold px-3 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/30">
                    {formatDateSeparator(msg.createdAt)}
                  </span>
                </div>
              )}

              <div className={cn("flex items-end gap-1.5", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <Avatar className="size-6 shrink-0 mb-1 border border-border/40">
                    <AvatarImage src={otherParticipant.avatarUrl || ""} />
                    <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                      {(otherParticipant.displayName?.[0] || "S").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn("max-w-[82%] sm:max-w-[70%] space-y-0.5", isMe ? "items-end text-right" : "items-start text-left")}>
                  <div
                    className={cn(
                      "text-xs leading-relaxed transition-all",
                      isDirectMedia
                        ? "p-0 bg-transparent border-0"
                        : isMe
                        ? "bg-gradient-to-tr from-primary to-primary/95 text-primary-foreground font-medium px-3.5 py-2.5 rounded-2xl rounded-br-xs shadow-xs"
                        : "bg-muted/80 dark:bg-muted/50 text-foreground font-medium px-3.5 py-2.5 rounded-2xl rounded-bl-xs shadow-2xs border border-border/30"
                    )}
                  >
                    {isDirectMedia ? (
                      <img
                        src={msg.body.trim()}
                        alt="Shared Media"
                        className="max-h-60 max-w-full rounded-2xl object-contain shadow-xs border border-border/30"
                        loading="lazy"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    )}
                  </div>

                  {/* Micro Timestamp & Delivery Receipt */}
                  <div className={cn("flex items-center gap-1 text-[9px] text-muted-foreground font-medium px-1", isMe ? "justify-end" : "justify-start")}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      msg.optimistic ? (
                        <Loader2 className="size-2.5 animate-spin text-muted-foreground/60" />
                      ) : (
                        <CheckCheck className="size-3 text-primary" />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Messenger Bottom Input Bar (Clean with Safe Area) ─── */}
      <form
        onSubmit={handleSendSubmit}
        className="border-t border-border/40 bg-card px-3 sm:px-4 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center gap-2 shrink-0 z-20"
      >
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowStickerPicker(true)}
            className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
            title="Send Sticker"
          >
            <Smile className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowGifPicker(true)}
            className="flex h-9 px-2 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            title="Send GIF"
          >
            GIF
          </button>
        </div>

        <input
          type="text"
          placeholder="Type a campus message..."
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex h-10 flex-1 rounded-full bg-muted/40 px-4 py-2 text-xs font-semibold placeholder:text-muted-foreground/60 focus:bg-background border border-border/40 outline-none focus:border-primary transition-all"
        />

        <button
          type="submit"
          disabled={isSending || !msgText.trim()}
          aria-label="Send message"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/95 shadow-xs transition-transform active:scale-90 disabled:opacity-40 cursor-pointer"
        >
          <Send className="size-4" />
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
