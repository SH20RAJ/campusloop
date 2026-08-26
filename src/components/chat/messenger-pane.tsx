"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/db/schema";
import {
  Send,
  ArrowLeft,
  ShieldCheck,
  Smile,
  CheckCheck,
  Check,
  Image as ImageIcon,
  Search,
  X,
  Loader2,
  CornerDownRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";
import { uploadImageToImgBB } from "@/lib/upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CachedMessage,
  getCachedMessages,
  setCachedMessages,
} from "@/lib/chat-cache";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<T>;
};

interface MessengerPaneProps {
  conversationId: string | null;
  otherParticipant: UserProfile | null;
  currentUserId: string;
  onBack?: () => void;
}

const QUICK_REACTION_EMOJIS = ["❤️", "👍", "😂", "🔥", "😮", "😢", "🙏"];

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<CachedMessage | null>(null);
  const [searchInChat, setSearchInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fast Hard Cache: Initial fallback from in-memory / local storage cache for 0ms instant display
  const initialCache = conversationId ? getCachedMessages(conversationId) : null;

  const { data: messages, mutate } = useSWR<CachedMessage[]>(
    conversationId ? `/api/chat/${conversationId}/messages` : null,
    fetcher,
    {
      fallbackData: initialCache || undefined,
      refreshInterval: 2000,
      revalidateOnFocus: true,
      onSuccess: (data) => {
        if (conversationId && data) {
          setCachedMessages(conversationId, data);
        }
      },
    }
  );

  // Auto scroll to bottom smoothly on message updates (unless user is searching)
  useEffect(() => {
    if (!chatSearchQuery.trim()) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatSearchQuery]);

  async function sendMessage(bodyText: string) {
    if (!bodyText.trim() || !conversationId || isSending) return;

    setIsSending(true);

    const fullBody = replyingTo
      ? `> ${replyingTo.body.split("\n")[0].slice(0, 60)}...\n\n${bodyText}`
      : bodyText;

    const optimisticMessage: CachedMessage = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      body: fullBody,
      readAt: null,
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      optimistic: true,
    };

    setReplyingTo(null);
    mutate((prev) => {
      const updated = [...(prev || []), optimisticMessage];
      setCachedMessages(conversationId, updated);
      return updated;
    }, false);

    try {
      const res = await fetch(`/api/chat/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: fullBody }),
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    setIsUploadingImage(true);
    try {
      toast.loading("Sending photo...", { id: "chat-img" });
      const res = await uploadImageToImgBB(file);
      const url = res.displayUrl || res.url;
      await sendMessage(url);
      toast.success("Photo sent", { id: "chat-img" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo", { id: "chat-img" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function toggleReaction(msgId: string, emoji: string) {
    if (!conversationId) return;

    mutate(
      (prev) =>
        prev?.map((m) => {
          if (m.id !== msgId) return m;
          const current = m.reactions || [];
          const exists = current.some((r) => r.userId === currentUserId && r.emoji === emoji);
          const updated = exists
            ? current.filter((r) => !(r.userId === currentUserId && r.emoji === emoji))
            : [...current.filter((r) => r.userId !== currentUserId), { emoji, userId: currentUserId }];
          return { ...m, reactions: updated };
        }),
      false
    );

    try {
      await fetch(`/api/chat/${conversationId}/messages/${msgId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      mutate();
    } catch (err) {
      console.error(err);
      mutate();
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
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  }

  function formatDateSeparator(dateVal: string | Date) {
    try {
      const d = new Date(dateVal);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) return "TODAY";
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return "YESTERDAY";
      return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
    } catch {
      return "";
    }
  }

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-6 text-center select-none bg-background">
        <div className="size-16 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center mb-3.5 shadow-xs">
          <User className="size-7 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-black text-foreground">Direct Campus Messages</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
          Select a verified student from your inbox or search above to chat.
        </p>
      </div>
    );
  }

  // Filter messages if search is active
  const filteredMessages = chatSearchQuery.trim()
    ? messages?.filter((m) => m.body.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex h-full w-full flex-col bg-[#0b141a]/60 select-none overflow-hidden relative">
      {/* Hidden file upload for media */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* ─── WhatsApp Header ─── */}
      <header className="border-b border-border/40 bg-card/95 backdrop-blur-md px-3 sm:px-5 py-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] shrink-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="md:hidden flex size-8 items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
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
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                    {otherParticipant.displayName || "Student"}
                  </span>
                  <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-emerald-500 font-bold">Online</span>
                  <span className="text-muted-foreground truncate">
                    • @{otherParticipant.username}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchInChat((prev) => !prev)}
              className={cn(
                "size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                searchInChat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Search in chat"
            >
              <Search className="size-4" />
            </button>

            <Link
              href={`/@${otherParticipant.username || "student"}`}
              className="text-[11px] font-bold text-foreground hover:text-primary px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted transition-all cursor-pointer shadow-2xs"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* In-Chat Search Bar Dropdown */}
      {searchInChat && (
        <div className="border-b border-border/40 bg-card px-4 py-2 flex items-center gap-2 shrink-0 z-20 animate-in slide-in-from-top-2">
          <div className="max-w-4xl mx-auto w-full flex items-center gap-2">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages in this chat..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-muted-foreground/60"
              autoFocus
            />
            {chatSearchQuery && (
              <button
                type="button"
                onClick={() => setChatSearchQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Messages Feed Viewport ─── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-2.5">
        <div className="max-w-3xl mx-auto w-full space-y-2.5">
          {filteredMessages?.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const isDirectMedia =
              /^https?:\/\/.+\.(gif|jpeg|jpg|png|webp)(\?.*)?$/i.test(msg.body.trim()) ||
              msg.body.trim().startsWith("https://media.giphy.com/") ||
              msg.body.trim().startsWith("https://i.giphy.com/");

            const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
            const showDateSeparator =
              !prevMsg ||
              new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

            const isHovered = hoveredMsgId === msg.id;
            const reactions = msg.reactions || [];

            return (
              <div
                key={msg.id}
                className="space-y-1 relative group"
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
              >
                {/* Date Header Pill */}
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-3.5">
                    <span className="text-[10px] font-bold px-3 py-0.5 rounded-full bg-card/90 text-muted-foreground border border-border/40 shadow-2xs tracking-wider">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={cn("flex items-end relative", isMe ? "justify-end" : "justify-start")}>
                  {/* Floating Quick Reaction Bar (WhatsApp Style) */}
                  {isHovered && (
                    <div
                      className={cn(
                        "absolute -top-7 z-20 flex items-center gap-1 bg-card/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-border/60 shadow-md animate-in fade-in zoom-in-95",
                        isMe ? "right-1" : "left-1"
                      )}
                    >
                      {QUICK_REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className="text-xs hover:scale-125 transition-transform active:scale-95 p-0.5 cursor-pointer"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setReplyingTo(msg)}
                        className="text-muted-foreground hover:text-foreground pl-1 ml-0.5 border-l border-border/50 text-[10px] flex items-center gap-0.5 cursor-pointer"
                        title="Reply"
                      >
                        <CornerDownRight className="size-3" />
                      </button>
                    </div>
                  )}

                  <div className={cn("max-w-[85%] sm:max-w-[70%] space-y-0.5", isMe ? "items-end text-right" : "items-start text-left")}>
                    {/* Message Bubble (WhatsApp Tail & Style) */}
                    <div
                      className={cn(
                        "relative text-xs leading-relaxed transition-all shadow-2xs",
                        isDirectMedia
                          ? "p-0 bg-transparent border-0"
                          : isMe
                          ? "bg-[#005c4b] dark:bg-[#005c4b] text-white rounded-2xl rounded-tr-xs px-3.5 py-2"
                          : "bg-card dark:bg-[#202c33] text-foreground rounded-2xl rounded-tl-xs px-3.5 py-2 border border-border/30"
                      )}
                    >
                      {isDirectMedia ? (
                        <div className="relative overflow-hidden rounded-2xl border border-border/40 shadow-xs">
                          <img
                            src={msg.body.trim()}
                            alt="Shared Media"
                            className="max-h-72 max-w-full rounded-2xl object-cover"
                            loading="lazy"
                          />
                          {/* Timestamp overlay on media */}
                          <div className="absolute bottom-1.5 right-2 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMe && (
                              <span title={msg.readAt ? "Seen" : "Delivered"}>
                                <CheckCheck className={cn("size-3", msg.readAt ? "text-sky-300" : "text-white/80")} />
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="whitespace-pre-wrap break-words pr-12 text-[13px]">{msg.body}</p>

                          {/* WhatsApp-Style Bottom Right Timestamp & Seen Double Blue Ticks */}
                          <div
                            className={cn(
                              "flex items-center justify-end gap-1 text-[9px] font-medium select-none -mt-1 float-right ml-2 pt-0.5",
                              isMe ? "text-white/80" : "text-muted-foreground"
                            )}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMe && (
                              msg.optimistic ? (
                                <Loader2 className="size-2.5 animate-spin text-white/70" />
                              ) : msg.readAt ? (
                                <span title="Seen">
                                  <CheckCheck className="size-3.5 text-sky-300 font-bold" />
                                </span>
                              ) : (
                                <span title="Delivered">
                                  <CheckCheck className="size-3.5 text-white/70" />
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Reaction Badges Pill (Corner) */}
                      {reactions.length > 0 && (
                        <div
                          className={cn(
                            "absolute -bottom-2 flex items-center gap-0.5 bg-card dark:bg-[#1f2c34] border border-border/60 rounded-full px-1.5 py-0.5 shadow-xs text-[10px] cursor-pointer hover:scale-105 transition-transform",
                            isMe ? "right-2" : "left-2"
                          )}
                          onClick={() => toggleReaction(msg.id, reactions[0].emoji)}
                        >
                          {Array.from(new Set(reactions.map((r) => r.emoji))).map((e) => (
                            <span key={e}>{e}</span>
                          ))}
                          {reactions.length > 1 && (
                            <span className="text-[9px] font-black text-muted-foreground ml-0.5">
                              {reactions.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ─── Reply Preview Bar ─── */}
      {replyingTo && (
        <div className="bg-card border-t border-border/40 px-4 py-2 flex items-center justify-between gap-2 shrink-0 z-20 animate-in slide-in-from-bottom-2">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="border-l-3 border-emerald-500 pl-2.5 min-w-0">
              <p className="text-[10px] font-black text-emerald-500">
                Replying to {replyingTo.senderId === currentUserId ? "yourself" : otherParticipant.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{replyingTo.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="size-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Messenger Bottom Input Bar ─── */}
      <footer className="border-t border-border/40 bg-card px-3 sm:px-4 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shrink-0 z-20">
        <form
          onSubmit={handleSendSubmit}
          className="max-w-3xl mx-auto w-full flex items-center gap-2"
        >
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowStickerPicker(true)}
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Send Sticker"
            >
              <Smile className="size-4.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowGifPicker(true)}
              className="flex h-9 px-2 items-center justify-center rounded-xl text-xs font-black text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Send GIF"
            >
              GIF
            </button>

            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Attach Photo"
            >
              {isUploadingImage ? <Loader2 className="size-4.5 animate-spin" /> : <ImageIcon className="size-4.5" />}
            </button>
          </div>

          <input
            type="text"
            placeholder="Type a message..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex h-10 flex-1 rounded-full bg-muted/40 dark:bg-[#202c33] px-4 py-2 text-xs sm:text-sm font-semibold placeholder:text-muted-foreground/60 focus:bg-background border border-border/40 outline-none focus:border-emerald-500 transition-all"
          />

          <button
            type="submit"
            disabled={isSending || !msgText.trim()}
            aria-label="Send message"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 dark:bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-transform active:scale-90 disabled:opacity-40 cursor-pointer"
          >
            <Send className="size-4" />
          </button>
        </form>
      </footer>

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
