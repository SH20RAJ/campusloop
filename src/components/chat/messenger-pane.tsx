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
  Search,
  X,
  Heart,
  Loader2,
  Phone,
  Video,
  CornerDownRight,
} from "lucide-react";
import Link from "next/link";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";
import { uploadImageToImgBB } from "@/lib/upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ReactionItem = { emoji: string; userId: string; userDisplayName?: string };

type MessageWithSender = Message & {
  sender?: UserProfile;
  optimistic?: boolean;
  readAt?: string | Date | null;
  reactions?: ReactionItem[] | null;
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
  const [replyingTo, setReplyingTo] = useState<MessageWithSender | null>(null);
  const [searchInChat, setSearchInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Poll for messages every 2 seconds
  const { data: messages, mutate } = useSWR<MessageWithSender[]>(
    conversationId ? `/api/chat/${conversationId}/messages` : null,
    fetcher,
    { refreshInterval: 2000 }
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

    const optimisticMessage: MessageWithSender = {
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
    mutate((prev) => [...(prev || []), optimisticMessage], false);

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
      toast.success("Photo sent! 📸", { id: "chat-img" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo", { id: "chat-img" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function toggleReaction(msgId: string, emoji: string) {
    if (!conversationId) return;

    // Optimistic reaction toggle
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
      if (d.toDateString() === today.toDateString()) return "Today";
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    } catch {
      return "";
    }
  }

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-6 text-center select-none bg-muted/10">
        <div className="size-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-sm animate-in zoom-in-95">
          <Sparkles className="size-9 text-primary" />
        </div>
        <h2 className="text-base font-black text-foreground">CampusLoop Messenger</h2>
        <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed font-medium">
          Select a verified student chat from the list or search above to start an end-to-end private conversation.
        </p>
      </div>
    );
  }

  // Filter messages if search is active
  const filteredMessages = chatSearchQuery.trim()
    ? messages?.filter((m) => m.body.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex h-full w-full flex-col bg-[#f0f2f5]/40 dark:bg-[#0b141a]/40 select-none overflow-hidden relative">
      {/* Hidden file upload for media */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* ─── WhatsApp Header (With Safe Area Top Padding) ─── */}
      <header className="flex items-center justify-between border-b border-border/40 bg-card/95 backdrop-blur-md px-3 sm:px-4 py-2 pt-[max(0.6rem,env(safe-area-inset-top))] shrink-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
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
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                  Online
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  • @{otherParticipant.username}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1 shrink-0">
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
            className="text-[11px] font-bold text-foreground hover:text-primary px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-all cursor-pointer shadow-2xs"
          >
            Profile
          </Link>
        </div>
      </header>

      {/* In-Chat Search Bar Dropdown */}
      {searchInChat && (
        <div className="border-b border-border/40 bg-card px-4 py-2 flex items-center gap-2 shrink-0 z-20 animate-in slide-in-from-top-2">
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
      )}

      {/* ─── Messages Thread Viewport (WhatsApp Canvas Style) ─── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3">
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
                <div className="flex items-center justify-center my-3">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-card/90 text-muted-foreground border border-border/40 shadow-2xs uppercase tracking-wider">
                    {formatDateSeparator(msg.createdAt)}
                  </span>
                </div>
              )}

              <div className={cn("flex items-end gap-1.5 relative", isMe ? "justify-end" : "justify-start")}>
                {/* Peer Avatar */}
                {!isMe && (
                  <Avatar className="size-6 shrink-0 mb-1 border border-border/40">
                    <AvatarImage src={otherParticipant.avatarUrl || ""} />
                    <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                      {(otherParticipant.displayName?.[0] || "S").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Floating Quick Reaction Hover Toolbar (WhatsApp Style) */}
                {isHovered && (
                  <div
                    className={cn(
                      "absolute -top-7 z-20 flex items-center gap-1 bg-card/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-border/60 shadow-md animate-in fade-in zoom-in-95",
                      isMe ? "right-2" : "left-8"
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

                <div className={cn("max-w-[84%] sm:max-w-[72%] space-y-0.5", isMe ? "items-end text-right" : "items-start text-left")}>
                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "relative text-xs leading-relaxed transition-all shadow-xs",
                      isDirectMedia
                        ? "p-0 bg-transparent border-0"
                        : isMe
                        ? "bg-emerald-600 dark:bg-emerald-700/90 text-white rounded-2xl rounded-tr-xs px-3.5 py-2"
                        : "bg-card dark:bg-[#202c33] text-foreground rounded-2xl rounded-tl-xs px-3.5 py-2 border border-border/40"
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
                            msg.readAt ? (
                              <CheckCheck className="size-3 text-sky-400" />
                            ) : (
                              <CheckCheck className="size-3 text-white/80" />
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="whitespace-pre-wrap break-words pr-12">{msg.body}</p>

                        {/* WhatsApp-Style Bottom Right Timestamp & Seen Double Blue Ticks */}
                        <div
                          className={cn(
                            "flex items-center justify-end gap-1 text-[9px] font-medium select-none -mt-1 float-right ml-2 pt-1",
                            isMe ? "text-white/85" : "text-muted-foreground"
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

      {/* ─── Reply Preview Bar ─── */}
      {replyingTo && (
        <div className="bg-card border-t border-border/40 px-4 py-2 flex items-center justify-between gap-2 shrink-0 z-20 animate-in slide-in-from-bottom-2">
          <div className="border-l-3 border-emerald-500 pl-2.5 min-w-0">
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
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
      )}

      {/* ─── Messenger Bottom Input Bar (Clean WhatsApp Style) ─── */}
      <form
        onSubmit={handleSendSubmit}
        className="border-t border-border/40 bg-card px-2.5 sm:px-4 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center gap-1.5 sm:gap-2 shrink-0 z-20"
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

          <button
            type="button"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="flex size-9 items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Attach Photo"
          >
            {isUploadingImage ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
          </button>
        </div>

        <input
          type="text"
          placeholder="Type a message..."
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex h-10 flex-1 rounded-full bg-muted/40 dark:bg-[#202c33] px-4 py-2 text-xs font-semibold placeholder:text-muted-foreground/60 focus:bg-background border border-border/40 outline-none focus:border-emerald-500 transition-all"
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
