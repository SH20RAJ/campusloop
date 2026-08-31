"use client";

import {
  ArrowLeft,
  CheckCheck,
  CornerDownRight,
  Heart,
  Info,
  Loader2,
  Mic,
  Paperclip,
  Phone,
  Play,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Trash2,
  User,
  Users2,
  Video,
  Volume2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { ActiveCallOverlay } from "@/components/calls/active-call-overlay";
import { IncomingCallModal } from "@/components/calls/incoming-call-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GifPickerModal } from "@/components/ui/gif-picker-modal";
import { PresenceDot } from "@/components/ui/presence-dot";
import { StickerPickerModal } from "@/components/ui/sticker-picker-modal";
import type { UserProfile } from "@/db/schema";
import { triggerBrowserNotification } from "@/hooks/use-push-notifications";
import {
  type CachedMessage,
  getCachedMessages,
  setCachedMessages,
  updateCachedConversationLastMessage,
} from "@/lib/chat-cache";
import { extractYouTubeId } from "@/lib/embeds";
import { haptics } from "@/lib/haptics";
import { isOnline, presenceLabel } from "@/lib/presence";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { ChatUserInfoDrawer } from "./chat-user-info-drawer";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<T>;
};

interface MessengerPaneProps {
  conversationId: string | null;
  otherParticipant:
    | (UserProfile & {
        isGroup?: boolean;
        isCommunity?: boolean;
        membersCount?: number;
        category?: string;
        participants?: UserProfile[];
      })
    | null;
  currentUserId: string;
  onBack?: () => void;
}

const QUICK_REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥"];

/**
 * Chat reuses the shared feed parser so a link that embeds in a post embeds in
 * a DM too (Shorts, live streams and `m.`/`music.` links included).
 */
function getYouTubeVideoId(text: string) {
  return extractYouTubeId(text);
}

function renderMessageWithMentions(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@") && part.length > 1) {
      const username = part.slice(1);
      return (
        <Link
          key={i}
          href={`/@${username}`}
          className="font-bold text-primary hover:underline inline-block px-1 py-0.5 rounded-md bg-primary/10 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<CachedMessage | null>(null);
  const [searchInChat, setSearchInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [deleteModalMsg, setDeleteModalMsg] = useState<CachedMessage | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<UserProfile[]>([]);
  const [isSearchingMentions, setIsSearchingMentions] = useState(false);

  // Calling States
  const [activeCall, setActiveCall] = useState<{
    callId: string;
    isCaller: boolean;
    type: "audio" | "video";
    remotePeerId?: string;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);

  // Swipe gesture tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const activeSwipingMsgIdRef = useRef<string | null>(null);
  const [swipedOffset, setSwipedOffset] = useState<Record<string, number>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Detect @mention trigger in textarea
  useEffect(() => {
    const cursor = textareaRef.current?.selectionStart || msgText.length;
    const textBeforeCursor = msgText.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      const q = match[1];
      setMentionQuery(q);
      fetch(`/api/chat/search?q=${encodeURIComponent(q)}`)
        .then(async (res) => {
          if (res.ok) {
            const users = (await res.json()) as UserProfile[];
            setMentionSuggestions(users.slice(0, 5));
          } else {
            setMentionSuggestions([]);
          }
        })
        .catch(() => setMentionSuggestions([]))
        .finally(() => setIsSearchingMentions(false));
    } else {
      setMentionQuery(null);
      setMentionSuggestions([]);
    }
  }, [msgText]);

  function handleSelectMention(username: string) {
    if (!textareaRef.current) return;
    const cursor = textareaRef.current.selectionStart || msgText.length;
    const textBeforeCursor = msgText.slice(0, cursor);
    const textAfterCursor = msgText.slice(cursor);
    const replacedBefore = textBeforeCursor.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `);
    setMsgText(replacedBefore + textAfterCursor);
    setMentionQuery(null);
    setMentionSuggestions([]);
    textareaRef.current.focus();
  }

  function handleTouchStart(e: React.TouchEvent, msgId: string) {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    activeSwipingMsgIdRef.current = msgId;
  }

  function handleTouchMove(e: React.TouchEvent, msg: CachedMessage) {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    // Only swipe horizontally if dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      const clamped = Math.min(Math.max(diffX, -80), 80);
      setSwipedOffset({ [msg.id]: clamped });
    }
  }

  function handleTouchEnd(msg: CachedMessage) {
    const currentOffset = swipedOffset[msg.id] || 0;
    if (Math.abs(currentOffset) >= 45) {
      sounds.tap();
      haptics.light();
      setReplyingTo(msg);
      toast.info(
        `Replying to ${msg.senderId === currentUserId ? "yourself" : otherParticipant?.displayName || "message"}`
      );
    }
    setSwipedOffset({});
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    activeSwipingMsgIdRef.current = null;
  }

  async function handleDeleteMessage(msgId: string, deleteFor: "everyone" | "me") {
    if (!conversationId) return;
    sounds.pop();
    haptics.heavy();
    setDeleteModalMsg(null);

    // Optimistic update
    mutate((prev) => {
      if (!prev) return prev;
      return prev.map((m) => {
        if (m.id !== msgId) return m;
        return {
          ...m,
          body: deleteFor === "everyone" ? "🚫 This message was deleted" : "🚫 You deleted this message",
          reactions: [],
        };
      });
    }, false);

    try {
      const res = await fetch(`/api/chat/${conversationId}/messages/${msgId}?deleteFor=${deleteFor}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");
      toast.success(deleteFor === "everyone" ? "Message deleted for everyone" : "Message deleted for you");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message");
      mutate();
    }
  }

  // Poll for incoming calls
  useEffect(() => {
    if (!currentUserId || activeCall) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/calls");
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data?.incomingCall && data.incomingCall.status === "CALLING") {
            setIncomingCall(data.incomingCall);
          } else {
            setIncomingCall(null);
          }
        }
      } catch {}
    }, 2800);

    return () => clearInterval(interval);
  }, [currentUserId, activeCall]);

  async function handleStartCall(type: "audio" | "video") {
    if (!conversationId || !otherParticipant || otherParticipant.isGroup) return;

    sounds.tap();
    haptics.medium();

    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherParticipant.id,
          conversationId,
          type,
          context: "chat",
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.call) {
        toast.error(data.error || "Failed to start call");
        return;
      }

      setActiveCall({
        callId: data.call.id,
        isCaller: true,
        type,
      });
    } catch (err: any) {
      toast.error(`Call failed: ${err.message}`);
    }
  }

  // Auto-resize textarea to fit content (from 1 line up to 5 lines)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(Math.max(el.scrollHeight, 40), 140);
    el.style.height = `${newHeight}px`;
  }, []);

  // Fast Hard Cache: Initial fallback from in-memory / local storage cache for 0ms instant display
  const initialCache = conversationId ? getCachedMessages(conversationId) : null;

  // Pagination state for loading older messages (WhatsApp/Instagram style)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isInitialScrollDoneRef = useRef(false);

  const {
    data: messages,
    isLoading,
    mutate,
  } = useSWR<CachedMessage[]>(
    conversationId ? `/api/chat/${conversationId}/messages?limit=35` : null,
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

  // Load older messages when user scrolls to top
  const handleLoadOlder = useCallback(async () => {
    if (!conversationId || isLoadingOlder || !hasMoreOlder || !messages || messages.length === 0) return;
    setIsLoadingOlder(true);

    const oldestMessage = messages[0];
    const oldestTimestamp = oldestMessage?.createdAt;
    const container = scrollContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    try {
      const res = await fetch(
        `/api/chat/${conversationId}/messages?limit=35&before=${encodeURIComponent(new Date(oldestTimestamp).toISOString())}`
      );
      if (res.ok) {
        const olderSlice = (await res.json()) as CachedMessage[];
        if (olderSlice.length < 35) {
          setHasMoreOlder(false);
        }
        if (olderSlice.length > 0) {
          // Prepend older messages while avoiding duplicates
          const olderIds = new Set(olderSlice.map((m) => m.id));
          const filteredCurrent = messages.filter((m) => !olderIds.has(m.id));
          const combined = [...olderSlice, ...filteredCurrent];

          mutate(combined, false);

          // Preserve exact scroll view position after prepend
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - prevScrollHeight;
            }
          });
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingOlder(false);
    }
  }, [conversationId, isLoadingOlder, hasMoreOlder, messages, mutate]);

  // Handle scroll to detect when user reaches top of conversation
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollTop < 60 && !isLoadingOlder && hasMoreOlder && messages && messages.length >= 35) {
      void handleLoadOlder();
    }
  }, [handleLoadOlder, isLoadingOlder, hasMoreOlder, messages]);

  // Auto scroll to bottom smoothly on message updates (unless user is searching or viewing older history)
  useEffect(() => {
    if (!chatSearchQuery.trim()) {
      if (!isInitialScrollDoneRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        isInitialScrollDoneRef.current = true;
      } else {
        const container = scrollContainerRef.current;
        const isNearBottom = container
          ? container.scrollHeight - container.scrollTop - container.clientHeight < 180
          : true;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages, chatSearchQuery]);

  // Alert with native browser notification when new message arrives in background
  const lastKnownMsgIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (
      lastKnownMsgIdRef.current &&
      lastKnownMsgIdRef.current !== last.id &&
      last.senderId !== currentUserId
    ) {
      sounds.pop();
      haptics.light();
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        triggerBrowserNotification(`CampusLoop: ${otherParticipant?.displayName || "New Message"}`, {
          body: last.body,
          url: `/app/chat/${conversationId}`,
        });
      }
    }
    lastKnownMsgIdRef.current = last.id;
  }, [messages, currentUserId, otherParticipant, conversationId]);

  // Click outside to dismiss active locked reaction bar
  useEffect(() => {
    function handleClickOutside() {
      if (activeReactionMsgId) {
        setActiveReactionMsgId(null);
      }
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeReactionMsgId]);

  function handleMsgMouseEnter(msgId: string) {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredMsgId(msgId);
  }

  function handleMsgMouseLeave() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMsgId(null);
    }, 350); // 350ms grace period so moving mouse to reaction pill never dismisses it!
  }

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
    sounds.send();
    haptics.success();
    mutate((prev) => {
      const updated = [...(prev || []), optimisticMessage];
      setCachedMessages(conversationId, updated);
      return updated;
    }, false);

    updateCachedConversationLastMessage(conversationId, {
      id: optimisticMessage.id,
      body: fullBody,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
    });

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

  async function sendImageFile(file: File) {
    if (!file || !conversationId) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload or paste an image file");
      return;
    }

    setIsUploadingImage(true);
    try {
      toast.loading("Sending image sticker...", { id: "chat-img" });
      const res = await uploadImageToImgBB(file);
      const url = res.displayUrl || res.url;
      await sendMessage(url);
      toast.success("Image sent!", { id: "chat-img" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image", {
        id: "chat-img",
      });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      sendImageFile(file);
    }
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // 1. Check direct file attachments (Files array, e.g. Gboard / iOS keyboard sticker / copied photo)
    const files = Array.from(clipboardData.files || []);
    const imageFile = files.find((f) => f.type.startsWith("image/"));
    if (imageFile) {
      e.preventDefault();
      toast.info("Sending pasted sticker / image... 🎨");
      sendImageFile(imageFile);
      return;
    }

    // 2. Check clipboard items (e.g. data transfer items)
    const items = Array.from(clipboardData.items || []);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          toast.info("Sending pasted sticker / image... 🎨");
          sendImageFile(file);
          return;
        }
      }
    }

    // 3. Check HTML content for embedded <img> (e.g. copied web sticker / emoji GIF)
    const html = clipboardData.getData("text/html");
    if (html) {
      const match = html.match(/<img[^>]+src="([^">]+)"/i);
      if (match && match[1] && /^https?:\/\//i.test(match[1])) {
        const imgSrc = match[1];
        if (
          /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(imgSrc) ||
          imgSrc.includes("giphy.com") ||
          imgSrc.includes("tenor.com")
        ) {
          e.preventDefault();
          toast.info("Sending sticker / GIF... 🎨");
          sendMessage(imgSrc);
          return;
        }
      }
    }

    // 4. Check plain text if it's a standalone image / gif URL
    const text = clipboardData.getData("text/plain").trim();
    if (
      /^https?:\/\/[^\s]+?\.(png|jpe?g|gif|webp)(\?[^\s]*)?$/i.test(text) ||
      /^https?:\/\/(?:media|i)\.giphy\.com\/[^\s]+/i.test(text) ||
      /^https?:\/\/media\.tenor\.com\/[^\s]+/i.test(text)
    ) {
      e.preventDefault();
      sendMessage(text);
      return;
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith("image/")) {
      sendImageFile(files[0]);
    }
  }

  async function toggleReaction(msgId: string, emoji: string) {
    if (!conversationId) return;

    // Dismiss reaction menu
    setActiveReactionMsgId(null);
    setHoveredMsgId(null);
    sounds.pop();
    haptics.medium();

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

  function handleSendVoiceMemo() {
    sendMessage("🎙️ [Voice Memo • 0:14]");
    toast.success("Voice memo sent! 🎙️");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (!isMobile) {
        e.preventDefault();
        if (!msgText.trim()) return;
        const text = msgText;
        setMsgText("");
        sendMessage(text);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  }

  function handleSendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim()) return;
    const text = msgText;
    setMsgText("");
    sendMessage(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
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

  // Presence is derived from the peer's heartbeat, not assumed
  const presenceText = presenceLabel(otherParticipant?.lastSeenAt);
  const viewerIsOnline = isOnline(otherParticipant?.lastSeenAt);

  if (!conversationId || !otherParticipant) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground p-6 text-center select-none bg-background">
        <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3.5 shadow-xs text-primary">
          <User className="size-7" />
        </div>
        <h2 className="text-sm font-black text-foreground">CampusLoop Messenger</h2>
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
    <div className="flex h-full w-full flex-col bg-muted/15 dark:bg-[#0c1317] select-none overflow-hidden relative">
      {/* Hidden file upload for media */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* ─── WhatsApp-Style Header ─── */}
      <header className="border-b border-border/40 bg-card/95 backdrop-blur-md px-3 sm:px-4 py-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] shrink-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back Button (visible on mobile to return to chat inbox) */}
            <button
              type="button"
              onClick={onBack}
              className="md:hidden size-8 rounded-full hover:bg-muted flex items-center justify-center text-foreground transition-colors cursor-pointer shrink-0"
              title="Back to inbox"
            >
              <ArrowLeft className="size-4" />
            </button>

            {/* Avatar & Online status / Group Info (Clickable to open User/Group Info Drawer) */}
            <div
              onClick={() => setShowInfoDrawer(true)}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group hover:opacity-90 transition-opacity"
              title="View student or group info and shared media"
            >
              <div className="relative shrink-0">
                <Avatar className="size-10 border border-border/40 shadow-xs transition-transform group-hover:scale-105">
                  <AvatarImage src={otherParticipant.avatarUrl || ""} />
                  <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                    {(otherParticipant.displayName?.[0] || "S").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!otherParticipant.isGroup && <PresenceDot lastSeenAt={otherParticipant.lastSeenAt} />}
              </div>

              {/* Name & Branch / Presence status / Group Member Count */}
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-1.5 leading-tight">
                  <span>{otherParticipant.displayName}</span>
                  {otherParticipant.isGroup ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-primary/15 text-primary border border-primary/20 shrink-0">
                      GROUP
                    </span>
                  ) : (
                    <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5 font-medium">
                  {otherParticipant.isGroup ? (
                    <>
                      <span className="font-bold text-primary flex items-center gap-1 shrink-0">
                        <Users2 className="size-3" />
                        <span>
                          {otherParticipant.membersCount || otherParticipant.participants?.length || 2}{" "}
                          members
                        </span>
                      </span>
                      {otherParticipant.category && (
                        <>
                          <span>•</span>
                          <span className="capitalize">
                            {otherParticipant.category.toLowerCase().replace(/_/g, " ")}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span
                        className={cn(
                          "font-bold flex items-center gap-1 shrink-0",
                          viewerIsOnline ? "text-emerald-500" : "text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            viewerIsOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
                          )}
                        />
                        {viewerIsOnline ? "Online" : presenceText || "Offline"}
                      </span>
                      <span>•</span>
                      <span>@{otherParticipant.username}</span>
                      {otherParticipant.branch && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{otherParticipant.branch}</span>
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Audio & Video Calling Buttons (1-to-1 DMs only) */}
            {!otherParticipant.isGroup && (
              <>
                <button
                  type="button"
                  onClick={() => handleStartCall("audio")}
                  className="size-8 sm:size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Start audio call"
                  aria-label="Start audio call"
                >
                  <Phone className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStartCall("video")}
                  className="size-8 sm:size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Start video call"
                  aria-label="Start video call"
                >
                  <Video className="size-4.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setSearchInChat(!searchInChat)}
              className={cn(
                "size-8 sm:size-9 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                searchInChat
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Search in conversation"
            >
              <Search className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowInfoDrawer(true)}
              className={cn(
                "size-8 sm:size-9 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                showInfoDrawer
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Contact Info & Media"
            >
              <Info className="size-4.5" />
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
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Messages Feed Viewport ─── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3"
      >
        <div className="max-w-3xl mx-auto w-full space-y-3">
          {isLoadingOlder && (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full animate-pulse">
                <Loader2 className="size-3 animate-spin" />
                <span>Loading older messages...</span>
              </div>
            </div>
          )}

          {!messages || (messages.length === 0 && isLoading) ? (
            /* Animated Message Bubbles Skeleton */
            <div className="space-y-4 py-2">
              <div className="flex justify-start items-end gap-2">
                <div className="size-6 rounded-full bg-muted/60 shrink-0 mb-1" />
                <div className="space-y-1">
                  <div className="h-12 w-56 sm:w-72 rounded-2xl rounded-tl-xs bg-muted/60 animate-pulse" />
                  <div className="h-2 w-12 rounded-full bg-muted/40 ml-1" />
                </div>
              </div>
              <div className="flex justify-end items-end gap-2">
                <div className="space-y-1 flex flex-col items-end">
                  <div className="h-10 w-44 sm:w-60 rounded-2xl rounded-tr-xs bg-primary/25 animate-pulse" />
                  <div className="h-2 w-10 rounded-full bg-muted/40 mr-1" />
                </div>
              </div>
              <div className="flex justify-start items-end gap-2">
                <div className="size-6 rounded-full bg-muted/60 shrink-0 mb-1" />
                <div className="space-y-1">
                  <div className="h-28 sm:h-36 w-52 sm:w-64 rounded-2xl rounded-tl-xs bg-muted/60 animate-pulse" />
                  <div className="h-2 w-14 rounded-full bg-muted/40 ml-1" />
                </div>
              </div>
              <div className="flex justify-end items-end gap-2">
                <div className="space-y-1 flex flex-col items-end">
                  <div className="h-14 w-52 sm:w-72 rounded-2xl rounded-tr-xs bg-primary/25 animate-pulse" />
                  <div className="h-2 w-12 rounded-full bg-muted/40 mr-1" />
                </div>
              </div>
              <div className="flex justify-start items-end gap-2">
                <div className="size-6 rounded-full bg-muted/60 shrink-0 mb-1" />
                <div className="space-y-1">
                  <div className="h-9 w-36 sm:w-48 rounded-2xl rounded-tl-xs bg-muted/60 animate-pulse" />
                  <div className="h-2 w-10 rounded-full bg-muted/40 ml-1" />
                </div>
              </div>
            </div>
          ) : filteredMessages && filteredMessages.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-2xs">
                <Smile className="size-6" />
              </div>
              <p className="font-bold text-foreground">Say hello to {otherParticipant.displayName}!</p>
              <p className="text-[11px] text-muted-foreground">
                Type a message, paste keyboard stickers, or share campus memories.
              </p>
            </div>
          ) : (
            filteredMessages?.map((msg, idx) => {
              const isMe = msg.senderId === currentUserId;
              const isDirectMedia =
                /^https?:\/\/.+\.(gif|jpeg|jpg|png|webp)(\?.*)?$/i.test(msg.body.trim()) ||
                msg.body.trim().startsWith("https://media.giphy.com/") ||
                msg.body.trim().startsWith("https://i.giphy.com/");

              const isVoiceMemo = msg.body.includes("🎙️ [Voice Memo");

              const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
              const showDateSeparator =
                !prevMsg ||
                new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

              const isHovered = hoveredMsgId === msg.id;
              const isReactionMenuOpen = isHovered || activeReactionMsgId === msg.id;
              const reactions = msg.reactions || [];

              // Check if Secret Crush Match greeting
              const isSecretCrushMatch =
                msg.body.includes("Secret Crush Match") ||
                msg.body.includes("We both secretly liked each other");

              // Check if message is a quoted reply
              const isQuoted = msg.body.startsWith("> ");
              let quotedText = "";
              let messageBody = msg.body;
              if (isQuoted) {
                const lines = msg.body.split("\n\n");
                quotedText = lines[0].replace(/^> /, "");
                messageBody = lines.slice(1).join("\n\n") || lines[0];
              }

              // Detect YouTube Video URL
              const ytVideoId = getYouTubeVideoId(messageBody);

              // If Secret Crush Match System card: render centered in chat
              if (isSecretCrushMatch) {
                return (
                  <div key={msg.id} className="space-y-1 my-4">
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-3">
                        <span className="text-[10px] font-bold px-3 py-0.5 rounded-full bg-card/90 text-muted-foreground border border-border/40 shadow-2xs tracking-wider">
                          {formatDateSeparator(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className="w-full max-w-md mx-auto p-4 sm:p-5 rounded-3xl bg-linear-to-tr from-rose-500/15 via-pink-500/10 to-purple-500/15 border border-rose-500/30 text-center space-y-3 shadow-lg backdrop-blur-md animate-in zoom-in-95">
                      <div className="size-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/30 animate-pulse">
                        <Heart className="size-6 fill-white stroke-white" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-black text-rose-500 tracking-tight">
                          💕 It&apos;s a Secret Crush Match!
                        </h4>
                        <p className="text-xs font-bold text-foreground">
                          We both secretly liked each other.
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Your identities have been revealed to each other. Break the ice and say hello!
                        </p>
                      </div>
                      <div className="text-[10px] font-bold text-rose-500/70 pt-1">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              }

              const currentSwipe = swipedOffset[msg.id] || 0;

              return (
                <div key={msg.id} className="space-y-1 relative">
                  {/* Date Header Pill */}
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-3.5">
                      <span className="text-[10px] font-bold px-3 py-0.5 rounded-full bg-card/90 text-muted-foreground border border-border/40 shadow-2xs tracking-wider">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Message Row Wrapper with Hover, Swipe, & Safe Bridge */}
                  <div
                    className={cn(
                      "flex items-end gap-1.5 relative group/row transition-transform duration-75",
                      isMe ? "justify-end flex-row" : "justify-start flex-row"
                    )}
                    style={{
                      transform: currentSwipe ? `translateX(${currentSwipe}px)` : undefined,
                    }}
                    onTouchStart={(e) => handleTouchStart(e, msg.id)}
                    onTouchMove={(e) => handleTouchMove(e, msg)}
                    onTouchEnd={() => handleTouchEnd(msg)}
                    onMouseEnter={() => handleMsgMouseEnter(msg.id)}
                    onMouseLeave={handleMsgMouseLeave}
                    onDoubleClick={() => toggleReaction(msg.id, "❤️")}
                  >
                    {/* Action trigger buttons (visible on hover or tap) */}
                    <div
                      className={cn(
                        "flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity shrink-0 mb-1 z-10",
                        isReactionMenuOpen && "opacity-100",
                        isMe ? "order-first" : "order-last"
                      )}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReactionMsgId((prev) => (prev === msg.id ? null : msg.id));
                        }}
                        className="size-6 rounded-full bg-card border border-border/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
                        title="React to message"
                      >
                        <Smile className="size-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setReplyingTo(msg)}
                        className="size-6 rounded-full bg-card border border-border/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
                        title="Reply"
                      >
                        <CornerDownRight className="size-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteModalMsg(msg)}
                        className="size-6 rounded-full bg-card border border-border/50 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-muted-foreground transition-all cursor-pointer shadow-2xs"
                        title="Delete message"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>

                    {/* ─── Floating WhatsApp-Style Reaction Bar (With Safe Hover Bridge) ─── */}
                    {isReactionMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={() => {
                          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        }}
                        className={cn(
                          "absolute -top-9 z-30 flex items-center gap-1 bg-card/95 dark:bg-[#1f2c34]/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/60 shadow-lg animate-in fade-in zoom-in-95 duration-150 before:absolute before:-bottom-3 before:inset-x-0 before:h-3 before:content-['']",
                          isMe ? "right-2" : "left-2"
                        )}
                      >
                        {QUICK_REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => toggleReaction(msg.id, emoji)}
                            className="text-sm hover:scale-125 transition-transform active:scale-95 p-1 cursor-pointer"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ─── Message Bubble ─── */}
                    <div
                      className={cn(
                        "max-w-[85%] sm:max-w-[70%] space-y-1 relative",
                        isMe ? "items-end text-right" : "items-start text-left"
                      )}
                    >
                      <div
                        className={cn(
                          "relative text-[14px] leading-relaxed transition-all shadow-xs",
                          isDirectMedia
                            ? "p-0 bg-transparent border-0"
                            : isMe
                              ? "bg-[#1d9bf0] text-white rounded-2xl rounded-br-xs px-4 py-2.5"
                              : "bg-[#202327] dark:bg-[#202327] bg-neutral-100 text-foreground rounded-2xl rounded-bl-xs px-4 py-2.5 border border-border/20"
                        )}
                      >
                        {/* Group Sender Name */}
                        {!isMe && (otherParticipant.isGroup || otherParticipant.isCommunity) && (
                          <div className="flex items-center gap-1 mb-1 leading-none">
                            <span className="text-[11px] font-black text-primary">
                              {msg.sender?.displayName || "Member"}
                            </span>
                            {msg.sender?.username && (
                              <span className="text-[10px] text-muted-foreground/70 font-normal">
                                @{msg.sender.username}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quoted Message Preview Bar */}
                        {isQuoted && (
                          <div
                            className={cn(
                              "mb-1.5 p-1.5 px-2.5 rounded-lg border-l-3 text-[11px] font-medium leading-tight truncate text-left",
                              isMe
                                ? "bg-black/15 border-white/80 text-primary-foreground/90"
                                : "bg-muted/70 border-primary text-muted-foreground"
                            )}
                          >
                            <p className="font-bold text-[10px] opacity-80">Quoted</p>
                            <p className="truncate">{quotedText}</p>
                          </div>
                        )}

                        {/* Content: Direct Image, Voice Memo, or Plain Text */}
                        {isDirectMedia ? (
                          <div className="relative overflow-hidden rounded-2xl border border-border/40 shadow-xs">
                            <img
                              src={msg.body.trim()}
                              alt="Shared Media"
                              className="max-h-72 max-w-full rounded-2xl object-cover"
                              loading="lazy"
                            />
                            <div className="absolute bottom-1.5 right-2 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMe && (
                                <span title={msg.readAt ? "Seen" : "Delivered"}>
                                  <CheckCheck
                                    className={cn("size-3", msg.readAt ? "text-sky-300" : "text-white/80")}
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        ) : isVoiceMemo ? (
                          /* WhatsApp Voice Memo Player Mockup */
                          <div className="flex items-center gap-3 py-1 pr-1 min-w-[200px]">
                            <button
                              type="button"
                              onClick={() => setPlayingVoiceId((prev) => (prev === msg.id ? null : msg.id))}
                              className={cn(
                                "size-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-transform active:scale-95",
                                isMe ? "bg-white text-primary" : "bg-primary text-primary-foreground"
                              )}
                            >
                              {playingVoiceId === msg.id ? (
                                <Volume2 className="size-4 animate-pulse" />
                              ) : (
                                <Play className="size-4 fill-current ml-0.5" />
                              )}
                            </button>

                            <div className="flex-1 space-y-1">
                              {/* Waveform graphic */}
                              <div className="flex items-center gap-0.5 h-4">
                                {[3, 8, 14, 9, 12, 16, 8, 11, 15, 7, 10, 14, 6, 12, 8, 4].map((h, i) => (
                                  <span
                                    key={i}
                                    style={{ height: `${h}px` }}
                                    className={cn(
                                      "w-1 rounded-full transition-all",
                                      playingVoiceId === msg.id && i % 3 === 0
                                        ? "bg-amber-300 animate-pulse"
                                        : isMe
                                          ? "bg-white/70"
                                          : "bg-primary/70"
                                    )}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center justify-between text-[10px] opacity-80 font-medium">
                                <span>0:14</span>
                                <span>{formatTime(msg.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="whitespace-pre-wrap break-words pr-12 text-[13px]">
                              {renderMessageWithMentions(messageBody)}
                            </p>

                            {/* YouTube Video Embed Player */}
                            {ytVideoId && (
                              <div className="mt-2 overflow-hidden rounded-xl aspect-video w-full max-w-sm border border-border/40 shadow-sm">
                                <iframe
                                  src={`https://www.youtube-nocookie.com/embed/${ytVideoId}`}
                                  title="YouTube video player"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full border-0"
                                />
                              </div>
                            )}

                            {/* WhatsApp-Style Bottom Right Timestamp & Seen Double Ticks */}
                            <div
                              className={cn(
                                "flex items-center justify-end gap-1 text-[9px] font-medium select-none -mt-1 float-right ml-2 pt-0.5",
                                isMe ? "text-primary-foreground/75" : "text-muted-foreground"
                              )}
                            >
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMe &&
                                (msg.optimistic ? (
                                  <Loader2 className="size-2.5 animate-spin text-primary-foreground/70" />
                                ) : msg.readAt ? (
                                  <span title="Seen">
                                    <CheckCheck className="size-3.5 text-sky-300 font-bold" />
                                  </span>
                                ) : (
                                  <span title="Delivered">
                                    <CheckCheck className="size-3.5 text-primary-foreground/70" />
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* ─── Reaction Badges Pill (Bottom Corner of Bubble) ─── */}
                        {reactions.length > 0 && (
                          <div
                            className={cn(
                              "absolute -bottom-2.5 flex items-center gap-0.5 bg-card dark:bg-[#1e293b] border border-border/60 rounded-full px-2 py-0.5 shadow-xs text-[11px] cursor-pointer hover:scale-105 transition-transform",
                              isMe ? "right-2" : "left-2"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReaction(msg.id, reactions[0].emoji);
                            }}
                            title="Click to toggle reaction"
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
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ─── Reply Preview Bar ─── */}
      {replyingTo && (
        <div className="bg-card border-t border-border/40 px-4 py-2 flex items-center justify-between gap-2 shrink-0 z-20 animate-in slide-in-from-bottom-2">
          <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="border-l-3 border-primary pl-2.5 min-w-0">
              <p className="text-[10px] font-black text-primary">
                Replying to{" "}
                {replyingTo.senderId === currentUserId ? "yourself" : otherParticipant.displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{replyingTo.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="size-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mention Autocomplete Popover */}
      {mentionSuggestions.length > 0 && (
        <div className="border-t border-border/40 bg-card/95 backdrop-blur-md px-3 py-2 shrink-0 z-30 animate-in slide-in-from-bottom-2">
          <div className="max-w-4xl mx-auto space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Mention Student
            </p>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {mentionSuggestions.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectMention(u.username)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Avatar className="size-5">
                    <AvatarImage src={u.avatarUrl || ""} />
                    <AvatarFallback className="text-[9px]">{u.displayName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span>@{u.username}</span>
                  <span className="text-[10px] opacity-75 font-normal">({u.displayName})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Messenger Bottom Input Bar (WhatsApp Layout) ─── */}
      <footer className="border-t border-border/40 bg-card/95 backdrop-blur-md px-2.5 sm:px-4 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0 z-20">
        {isUploadingImage && (
          <div className="max-w-4xl mx-auto mb-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold animate-pulse">
            <Loader2 className="size-3.5 animate-spin" />
            <span>Uploading and sending image / sticker...</span>
          </div>
        )}
        <form
          onSubmit={handleSendSubmit}
          className="max-w-3xl mx-auto w-full flex items-center gap-1.5 bg-muted/50 dark:bg-[#202327] rounded-3xl p-1.5 pl-2.5 border border-border/40 focus-within:border-[#1d9bf0]/60 transition-all shadow-xs"
        >
          {/* Action Attachments */}
          <div className="flex items-center gap-1 shrink-0 text-[#1d9bf0]">
            <button
              type="button"
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted/70 text-[#1d9bf0] transition-colors cursor-pointer"
              title="Attach Photo"
            >
              {isUploadingImage ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Paperclip className="size-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowGifPicker(true)}
              className="flex h-5 px-1.5 items-center justify-center rounded border border-[#1d9bf0]/50 text-[10px] font-black text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors cursor-pointer leading-none"
              title="Send GIF"
            >
              GIF
            </button>

            <button
              type="button"
              onClick={() => setShowStickerPicker(true)}
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted/70 text-[#1d9bf0] transition-colors cursor-pointer"
              title="Send Sticker / Emoji"
            >
              <Smile className="size-4" />
            </button>
          </div>

          {/* Multi-line Auto-Expanding Textarea with Keyboard Sticker & Image Paste Support */}
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Start a new message..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="flex min-h-[36px] max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-[14px] font-normal text-foreground placeholder:text-muted-foreground/60 outline-none leading-snug scrollbar-none"
          />

          {/* Voice Memo Button or Send Button */}
          {msgText.trim() ? (
            <button
              type="submit"
              disabled={isSending}
              aria-label="Send message"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1d9bf0] text-white hover:opacity-90 shadow-xs transition-transform active:scale-90 cursor-pointer mr-1"
            >
              <Send className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendVoiceMemo}
              aria-label="Record voice memo"
              className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-muted/70 text-muted-foreground hover:text-[#1d9bf0] transition-all cursor-pointer mr-1 active:scale-90"
              title="Click to send voice note"
            >
              <Mic className="size-4" />
            </button>
          )}
        </form>
      </footer>

      {/* Delete Message Confirmation Modal */}
      {deleteModalMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Trash2 className="size-4 text-rose-500" />
                Delete Message?
              </h3>
              <button
                type="button"
                onClick={() => setDeleteModalMsg(null)}
                className="size-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Are you sure you want to delete this message?</p>
            <div className="space-y-2 pt-2">
              {deleteModalMsg.senderId === currentUserId && (
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(deleteModalMsg.id, "everyone")}
                  className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Delete for Everyone
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDeleteMessage(deleteModalMsg.id, "me")}
                className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Delete for Me
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Instagram / WhatsApp Style User Info & Shared Content Drawer */}
      <ChatUserInfoDrawer
        isOpen={showInfoDrawer}
        onClose={() => setShowInfoDrawer(false)}
        otherParticipant={otherParticipant}
        conversationId={conversationId}
        messages={messages || []}
        currentUserId={currentUserId}
        onSearchClick={() => setSearchInChat(true)}
        onClearChat={() => mutate(undefined, true)}
        onDeleteChat={onBack}
      />

      {/* Incoming Call Prompt Modal */}
      {incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={() => {
            setActiveCall({
              callId: incomingCall.callId,
              isCaller: false,
              type: incomingCall.type,
              remotePeerId: incomingCall.callerPeerId,
            });
            setIncomingCall(null);
          }}
          onDecline={async () => {
            try {
              await fetch(`/api/calls/${incomingCall.callId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "DECLINE" }),
              });
            } catch {}
            setIncomingCall(null);
          }}
        />
      )}

      {/* Active Audio / Video Call Overlay */}
      {activeCall && otherParticipant && (
        <ActiveCallOverlay
          callId={activeCall.callId}
          isCaller={activeCall.isCaller}
          type={activeCall.type}
          partner={{
            id: otherParticipant.id,
            displayName: otherParticipant.displayName || "Student",
            avatarUrl: otherParticipant.avatarUrl,
            username: otherParticipant.username || undefined,
          }}
          remotePeerId={activeCall.remotePeerId}
          onCallEnded={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
