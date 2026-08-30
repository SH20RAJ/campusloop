"use client";

import {
  Bell,
  BellOff,
  Calendar,
  Eraser,
  ExternalLink,
  GraduationCap,
  Image as ImageIcon,
  Link2,
  School,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SecretCrushButton } from "@/components/dating/secret-crush-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/db/schema";
import type { CachedMessage } from "@/lib/chat-cache";
import { isOnline, presenceLabel } from "@/lib/presence";
import { cn } from "@/lib/utils";

interface ChatUserInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  otherParticipant: UserProfile | null;
  conversationId: string | null;
  messages: CachedMessage[];
  currentUserId: string;
  onSearchClick?: () => void;
  onClearChat?: () => void;
  onDeleteChat?: () => void;
}

export function ChatUserInfoDrawer({
  isOpen,
  onClose,
  otherParticipant,
  conversationId,
  messages,
  currentUserId,
  onSearchClick,
  onClearChat,
  onDeleteChat,
}: ChatUserInfoDrawerProps) {
  const [activeTab, setActiveTab] = useState<"media" | "links">("media");
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Extract shared images/media from messages
  const sharedMedia = useMemo(() => {
    const media: { id: string; url: string; createdAt: string | Date }[] = [];
    const imageRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s]*)?)/gi;
    const hostedImageRegex = /(https?:\/\/(?:images\.unsplash\.com|i\.ibb\.co|res\.cloudinary\.com)[^\s]+)/gi;

    messages.forEach((m) => {
      if (!m.body) return;
      const matches = m.body.match(imageRegex) || m.body.match(hostedImageRegex);
      if (matches) {
        matches.forEach((url) => {
          media.push({ id: m.id + url, url, createdAt: m.createdAt });
        });
      }
    });

    return media.reverse();
  }, [messages]);

  // Extract shared URLs / links from messages
  const sharedLinks = useMemo(() => {
    const links: { id: string; url: string; domain: string; createdAt: string | Date }[] = [];
    const urlRegex = /(https?:\/\/[^\s]+)/gi;

    messages.forEach((m) => {
      if (!m.body) return;
      const matches = m.body.match(urlRegex);
      if (matches) {
        matches.forEach((url) => {
          // Skip if it's already in pure media list
          if (/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(url)) return;
          try {
            const parsed = new URL(url);
            links.push({
              id: m.id + url,
              url,
              domain: parsed.hostname.replace(/^www\./, ""),
              createdAt: m.createdAt,
            });
          } catch {
            links.push({ id: m.id + url, url, domain: "link", createdAt: m.createdAt });
          }
        });
      }
    });

    return links.reverse();
  }, [messages]);

  if (!isOpen || !otherParticipant) return null;

  const online = isOnline(otherParticipant.lastSeenAt);
  const presenceText = presenceLabel(otherParticipant.lastSeenAt);
  const institutionName = otherParticipant.institutionId ? "Verified Campus Hub" : null;

  async function handleToggleMute() {
    if (!conversationId) return;
    const nextState = !isMuted;
    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextState ? "mute" : "unmute" }),
      });
      if (res.ok) {
        setIsMuted(nextState);
        toast.success(nextState ? "Chat muted 🔕" : "Notifications unmuted 🔔");
      }
    } catch {
      toast.error("Failed to update notification settings");
    }
  }

  async function handleClearHistory() {
    if (!conversationId) return;
    setIsClearing(true);
    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      if (res.ok) {
        toast.success("Chat history cleared");
        setShowClearConfirm(false);
        if (onClearChat) onClearChat();
      }
    } catch {
      toast.error("Failed to clear chat");
    } finally {
      setIsClearing(false);
    }
  }

  async function handleDelete() {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Conversation deleted");
        setShowDeleteConfirm(false);
        onClose();
        if (onDeleteChat) onDeleteChat();
      }
    } catch {
      toast.error("Failed to delete conversation");
    }
  }

  return (
    <>
      {/* Lightbox Modal for Shared Photos */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 size-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Shared Media"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Main Drawer Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden" onClick={onClose} />

      {/* Slide-over Panel (Instagram / WhatsApp Style) */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-88 md:w-96 bg-card border-l border-border/30 shadow-2xl flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-250 select-none">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/30 bg-card/90 px-4 backdrop-blur-md shrink-0">
          <h2 className="text-sm font-black text-foreground">Contact Info</h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Profile Card Block */}
        <div className="p-5 flex flex-col items-center text-center border-b border-border/30 space-y-3 bg-muted/10">
          {/* Avatar with Presence */}
          <div className="relative">
            <Avatar className="size-20 sm:size-24 rounded-full border-4 border-card shadow-lg bg-background">
              <AvatarImage src={otherParticipant.avatarUrl || ""} className="object-cover" />
              <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                {(otherParticipant.displayName?.[0] || "S").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-1 right-1 size-4 rounded-full border-2 border-card",
                online ? "bg-emerald-500" : "bg-muted-foreground/50"
              )}
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-foreground flex items-center justify-center gap-1.5">
              <span>{otherParticipant.displayName}</span>
              {(otherParticipant.points || 0) >= 150 && (
                <ShieldCheck className="size-4 text-[#1d9bf0] shrink-0" />
              )}
            </h3>
            <p className="text-xs text-muted-foreground">@{otherParticipant.username}</p>
            <p className="text-[11px] font-semibold text-emerald-500">
              {online ? "Active Now" : presenceText || "Offline"}
            </p>
          </div>

          {/* Bio */}
          {otherParticipant.bio && (
            <p className="text-xs text-foreground/90 leading-relaxed font-normal pt-1 max-w-xs break-words">
              &ldquo;{otherParticipant.bio}&rdquo;
            </p>
          )}

          {/* Academic Meta */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
            {otherParticipant.institutionId && (
              <Link
                href={`/app/college/${otherParticipant.institutionId}`}
                className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
              >
                <School className="size-3.5" />
                <span>Campus Hub</span>
              </Link>
            )}
            {otherParticipant.branch && (
              <span className="inline-flex items-center gap-1 text-foreground/80 font-medium">
                <GraduationCap className="size-3.5 text-primary/70" />
                <span>
                  {otherParticipant.course ? `${otherParticipant.course} · ` : ""}
                  {otherParticipant.branch}
                </span>
              </span>
            )}
            {otherParticipant.year && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" /> Year {otherParticipant.year}
              </span>
            )}
          </div>

          {/* LP Clout Badge */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500">
              🔥 {otherParticipant.points || 0} LP Clout
            </span>
          </div>
        </div>

        {/* Quick Action Grid (WhatsApp Style) */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b border-border/30 text-center bg-card">
          <Link
            href={`/@${otherParticipant.username}`}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-muted/60 transition-colors group cursor-pointer"
          >
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
              <User className="size-4.5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
              Profile
            </span>
          </Link>

          <div className="flex flex-col items-center gap-1.5 p-2">
            <SecretCrushButton targetId={otherParticipant.id} targetName={otherParticipant.displayName} />
            <span className="text-[10px] font-bold text-muted-foreground">Crush</span>
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-muted/60 transition-colors group cursor-pointer"
          >
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:text-rose-500 transition-colors">
              {isMuted ? <Bell className="size-4.5" /> : <BellOff className="size-4.5" />}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSearchClick) onSearchClick();
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-muted/60 transition-colors group cursor-pointer"
          >
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
              <Search className="size-4.5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
              Search
            </span>
          </button>
        </div>

        {/* Media, Links Tabs (Instagram / WhatsApp Style) */}
        <div className="border-b border-border/30">
          <div className="flex border-b border-border/30 bg-background text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={cn(
                "flex-1 py-2.5 text-center relative transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5",
                activeTab === "media" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ImageIcon className="size-3.5" />
              <span>Media ({sharedMedia.length})</span>
              {activeTab === "media" && (
                <span className="absolute bottom-0 inset-x-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={cn(
                "flex-1 py-2.5 text-center relative transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5",
                activeTab === "links" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link2 className="size-3.5" />
              <span>Links ({sharedLinks.length})</span>
              {activeTab === "links" && (
                <span className="absolute bottom-0 inset-x-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>

          <div className="p-3 max-h-56 overflow-y-auto">
            {activeTab === "media" ? (
              sharedMedia.length > 0 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {sharedMedia.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setLightboxUrl(item.url)}
                      className="aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity border border-border/40"
                    >
                      <img
                        src={item.url}
                        alt="Shared"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                  <ImageIcon className="size-6 mx-auto text-muted-foreground/50" />
                  <p>No photos or media shared yet.</p>
                </div>
              )
            ) : sharedLinks.length > 0 ? (
              <div className="space-y-1.5">
                {sharedLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 hover:bg-muted/70 transition-colors text-xs font-semibold text-foreground group"
                  >
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ExternalLink className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-primary group-hover:underline">{item.domain}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                <Link2 className="size-6 mx-auto text-muted-foreground/50" />
                <p>No links shared in this conversation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Settings & Safety Options */}
        <div className="p-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2">
            Chat Settings & Privacy
          </p>

          <button
            type="button"
            onClick={handleToggleMute}
            className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {isMuted ? (
                <BellOff className="size-4 text-rose-500" />
              ) : (
                <Bell className="size-4 text-muted-foreground" />
              )}
              <span>Mute Notifications</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-bold">{isMuted ? "Muted" : "On"}</span>
          </button>

          {showClearConfirm ? (
            <div className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-2 text-center">
              <p className="text-xs font-bold text-foreground">Clear all messages?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-1.5 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isClearing}
                  onClick={handleClearHistory}
                  className="flex-1 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            >
              <Eraser className="size-4 text-muted-foreground" />
              <span>Clear message history</span>
            </button>
          )}

          {showDeleteConfirm ? (
            <div className="p-3 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-2 text-center">
              <p className="text-xs font-bold text-destructive">Delete this entire chat?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-1.5 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-1.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-destructive/10 text-xs font-bold text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="size-4 text-destructive" />
              <span>Delete Conversation</span>
            </button>
          )}

          <hr className="border-border/30 my-2" />

          <Link
            href="/app/settings"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ShieldAlert className="size-4" />
            <span>Report or Block student</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
