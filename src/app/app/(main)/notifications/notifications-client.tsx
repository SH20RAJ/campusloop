"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { NotificationItem,useNotifications } from "@/hooks/use-notifications";
import { cn,formatTimeAgo,getAvatarUrl } from "@/lib/utils";
import {
AtSign,
Bell,
CheckCheck,
Heart,
Lock,
MessageCircle,
Repeat2,
ShieldCheck,
Sparkles,
Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "verified" | "mentions">("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    markAsRead,
  } = useNotifications(activeTab);

  const displayList = notifications.length > 0 ? notifications : initialNotifications;

  // Notification Icon & Accent Helper
  function getNotificationMeta(n: NotificationItem) {
    switch (n.type) {
      case "LIKE":
        return {
          icon: <Heart className="size-4.5 text-rose-500 fill-rose-500" />,
          actionText: "liked your post",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "View",
        };
      case "COMMENT":
        return {
          icon: <MessageCircle className="size-4.5 text-[#1d9bf0] fill-[#1d9bf0]" />,
          actionText: "replied to your post",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "Reply",
        };
      case "REPLY":
        return {
          icon: <MessageCircle className="size-4.5 text-[#1d9bf0] fill-[#1d9bf0]" />,
          actionText: "replied to your comment",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "Reply",
        };
      case "MENTION":
        return {
          icon: <AtSign className="size-4.5 text-purple-500 stroke-[2.5]" />,
          actionText: "mentioned you in a campus post",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "View",
        };
      case "REPOST":
        return {
          icon: <Repeat2 className="size-4.5 text-emerald-500 stroke-[2.5]" />,
          actionText: "reposted your discussion",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "View",
        };
      case "MATCH":
        return {
          icon: <Zap className="size-4.5 text-amber-500 fill-amber-500" />,
          actionText: "matched with you on Campus Match! 🎉",
          href: n.referenceId ? `/app/chat/${n.referenceId}` : "/app/chat",
          actionLabel: "Chat",
        };
      case "CRUSH_ALERT":
        return {
          icon: <Lock className="size-4.5 text-purple-500" />,
          actionText: "added you to their Secret Crush vault 🔒",
          href: "/app/crush",
          actionLabel: "Crush",
        };
      default:
        return {
          icon: <Sparkles className="size-4.5 text-primary" />,
          actionText: "interacted with you",
          href: "/app",
          actionLabel: "View",
        };
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-28 select-none border-x border-border/20">
      {/* ─── Twitter / X Sticky Top Header ─── */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="size-2 rounded-full bg-[#1d9bf0] inline-block animate-pulse" />
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="size-3.5" />
              <span className="hidden sm:inline">Mark all as read</span>
            </button>
          )}
        </div>

        {/* ─── Twitter 3 Core Tabs (All, Verified, Mentions) ─── */}
        <div className="grid grid-cols-3 border-t border-border/20 text-center font-bold text-sm">
          {[
            { id: "all", label: "All" },
            { id: "verified", label: "Verified" },
            { id: "mentions", label: "Mentions" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "relative py-3.5 transition-colors hover:bg-muted/30 cursor-pointer flex items-center justify-center",
                  isActive ? "text-foreground font-black" : "text-muted-foreground"
                )}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 h-1 w-12 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Notification Items Feed ─── */}
      <div className="divide-y divide-border/25">
        {displayList.map((n) => {
          const meta = getNotificationMeta(n);
          const isVerified = Boolean((n.actor?.points || 0) >= 150);
          const actorAvatar = getAvatarUrl(n.actor?.avatarUrl, n.actor?.username || "student");

          return (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) markAsRead(n.id);
              }}
              className={cn(
                "flex gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors relative cursor-pointer",
                !n.isRead && "bg-primary/[0.03]"
              )}
            >
              {/* Left: Category Icon */}
              <div className="shrink-0 pt-1 w-7 flex justify-end">
                {meta.icon}
              </div>

              {/* Center: Content & Preview */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/@${n.actor?.username || "student"}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  >
                    <Avatar className="size-8 rounded-full border border-border/40 hover:opacity-90 transition-opacity">
                      <AvatarImage src={actorAvatar || ""} />
                      <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                        {n.actor?.displayName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="min-w-0 flex-1 flex items-center gap-1 text-[13px] flex-wrap leading-tight">
                    <Link
                      href={`/@${n.actor?.username || "student"}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-foreground hover:underline truncate"
                    >
                      {n.actor?.displayName || "A Student"}
                    </Link>

                    {isVerified && (
                      <ShieldCheck className="size-3.5 text-[#1d9bf0] shrink-0" />
                    )}

                    <span className="text-muted-foreground font-normal">
                      {meta.actionText}
                    </span>

                    <span className="text-muted-foreground/50">·</span>

                    <span className="text-[11px] text-muted-foreground/60 shrink-0">
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Quoted Snippet Box */}
                {n.previewText && (
                  <Link
                    href={meta.href}
                    className="block rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 p-3 text-xs text-foreground/80 leading-relaxed transition-colors break-words font-normal"
                  >
                    {n.previewText}
                  </Link>
                )}
              </div>

              {/* Right: Unread Indicator Dot & Action Button */}
              <div className="flex flex-col items-end justify-between shrink-0 pl-1">
                {!n.isRead ? (
                  <span className="size-2 rounded-full bg-[#1d9bf0]" />
                ) : (
                  <span className="size-2" />
                )}

                <Link
                  href={meta.href}
                  className="mt-2 px-3 py-1 rounded-full bg-foreground text-background text-[11px] font-black hover:opacity-90 transition-all shadow-2xs active:scale-95"
                >
                  {meta.actionLabel}
                </Link>
              </div>
            </div>
          );
        })}

        {/* ─── Twitter Empty State ─── */}
        {!isLoading && displayList.length === 0 && (
          <div className="py-24 px-6 text-center max-w-sm mx-auto space-y-3">
            <div className="size-14 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground/60">
              <Bell className="size-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground">
                {activeTab === "all"
                  ? "Nothing to see here — yet"
                  : activeTab === "verified"
                  ? "No verified notifications"
                  : "No mentions yet"}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeTab === "all"
                  ? "From likes and reposts to replies and mentions, this is where all the campus interactions on your posts and account happen."
                  : activeTab === "verified"
                  ? "Interactions from verified students and batchmates with 150+ LP will appear here."
                  : "When classmates tag you with @username in posts, confessions, or comments, you will find them here."}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
