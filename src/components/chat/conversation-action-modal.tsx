"use client";

import {
  Archive,
  ArchiveRestore,
  Bell,
  BellOff,
  CheckCheck,
  Eraser,
  Pin,
  PinOff,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CachedConversation } from "@/lib/chat-cache";

interface ConversationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: CachedConversation | null;
  currentUserId: string;
  onActionComplete: () => void;
  onDeleteConversation?: (convId: string) => void;
}

export function ConversationActionModal({
  isOpen,
  onClose,
  conversation,
  currentUserId,
  onActionComplete,
  onDeleteConversation,
}: ConversationActionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !conversation) return null;

  const other = conversation.otherParticipant;
  const isPinned = Boolean(conversation.isPinned);
  const isMuted = Boolean(conversation.isMuted);
  const isArchived = Boolean(conversation.isArchived);
  const hasUnread = (conversation.unreadCount || 0) > 0;

  async function handleAction(action: string, successMsg: string) {
    if (!conversation) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/chat/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        toast.success(successMsg);
        onActionComplete();
        onClose();
      } else {
        toast.error("Failed to update conversation");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!conversation) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/chat/${conversation.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Chat deleted");
        if (onDeleteConversation) {
          onDeleteConversation(conversation.id);
        }
        onActionComplete();
        onClose();
      } else {
        toast.error("Failed to delete chat");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl border border-border/40 bg-card p-4 sm:p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Header with user preview */}
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-11 border border-border/40 shrink-0">
              <AvatarImage src={other?.avatarUrl || ""} />
              <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                {(other?.displayName?.[0] || "S").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate flex items-center gap-1">
                <span>{other?.displayName}</span>
                {other?.points && other.points >= 150 && (
                  <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                )}
              </h3>
              <p className="text-xs text-muted-foreground truncate">@{other?.username}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Delete Confirmation Sub-modal */}
        {showDeleteConfirm ? (
          <div className="py-2 space-y-3">
            <p className="text-sm font-bold text-foreground text-center">
              Delete chat with {other?.displayName}?
            </p>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              This will remove the conversation from your inbox and clear message history for you.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-full border border-border/60 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDelete}
                className="flex-1 py-2 rounded-full bg-destructive text-destructive-foreground hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Chat"}
              </button>
            </div>
          </div>
        ) : (
          /* Action Menu Items */
          <div className="space-y-1">
            {/* Pin / Unpin */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                handleAction(isPinned ? "unpin" : "pin", isPinned ? "Chat unpinned" : "Chat pinned to top 📌")
              }
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            >
              {isPinned ? (
                <PinOff className="size-4 text-muted-foreground" />
              ) : (
                <Pin className="size-4 text-amber-500" />
              )}
              <span>{isPinned ? "Unpin chat" : "Pin chat to top"}</span>
            </button>

            {/* Mute / Unmute */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                handleAction(isMuted ? "unmute" : "mute", isMuted ? "Notifications unmuted" : "Chat muted 🔕")
              }
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            >
              {isMuted ? (
                <Bell className="size-4 text-muted-foreground" />
              ) : (
                <BellOff className="size-4 text-rose-500" />
              )}
              <span>{isMuted ? "Unmute notifications" : "Mute notifications"}</span>
            </button>

            {/* Archive / Unarchive */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                handleAction(
                  isArchived ? "unarchive" : "archive",
                  isArchived ? "Chat unarchived" : "Chat archived 📦"
                )
              }
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            >
              {isArchived ? (
                <ArchiveRestore className="size-4 text-muted-foreground" />
              ) : (
                <Archive className="size-4 text-primary" />
              )}
              <span>{isArchived ? "Unarchive chat" : "Archive chat"}</span>
            </button>

            {/* Mark as Read / Unread */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                handleAction(
                  hasUnread ? "mark_read" : "mark_unread",
                  hasUnread ? "Marked as read" : "Marked as unread"
                )
              }
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            >
              <CheckCheck className="size-4 text-sky-400" />
              <span>{hasUnread ? "Mark as read" : "Mark as unread"}</span>
            </button>

            {/* View Profile */}
            {other?.username && (
              <Link
                href={`/@${other.username}`}
                onClick={onClose}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                <User className="size-4 text-muted-foreground" />
                <span>View student profile</span>
              </Link>
            )}

            {/* Clear Chat */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction("clear", "Chat history cleared")}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
            >
              <Eraser className="size-4 text-muted-foreground" />
              <span>Clear message history</span>
            </button>

            <hr className="border-border/30 my-1" />

            {/* Delete Chat */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 text-xs font-bold text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="size-4" />
              <span>Delete Chat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
