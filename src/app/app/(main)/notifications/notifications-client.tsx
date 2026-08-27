"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import {
NotificationItem,
NotificationTab,
useNotifications,
} from "@/hooks/use-notifications";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,formatTimeAgo,getAvatarUrl } from "@/lib/utils";
import {
AtSign,
Bell,
CheckCheck,
Compass,
Heart,
Lock,
MessageCircle,
Repeat2,
ShieldCheck,
Sparkles,
Trophy,
Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    markAsRead,
  } = useNotifications(activeTab);

  const displayList =
    notifications.length > 0
      ? notifications
      : activeTab === "all"
      ? initialNotifications
      : [];

  const effectiveUnread = unreadCount ?? initialUnreadCount;

  // Notification Icon, Action Text & Badges
  function getNotificationMeta(n: NotificationItem) {
    switch (n.type) {
      case "LIKE":
        return {
          icon: <Heart className="size-3.5 text-rose-500 fill-rose-500" />,
          badgeBg: "bg-rose-500/15 border-rose-500/30 text-rose-500",
          actionText: "liked your post",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "View post",
        };
      case "STORY_LIKE":
        return {
          icon: <Heart className="size-3.5 text-pink-500 fill-pink-500" />,
          badgeBg: "bg-pink-500/15 border-pink-500/30 text-pink-500",
          actionText: "liked your campus story vibe",
          href: n.referenceId ? `/app/story/${n.referenceId}` : "/app",
          actionLabel: "View vibe",
        };
      case "COMMENT":
        return {
          icon: <MessageCircle className="size-3.5 text-[#1d9bf0] fill-[#1d9bf0]" />,
          badgeBg: "bg-[#1d9bf0]/15 border-[#1d9bf0]/30 text-[#1d9bf0]",
          actionText: "replied to your discussion",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "Reply",
        };
      case "REPLY":
      case "STORY_REPLY":
        return {
          icon: <MessageCircle className="size-3.5 text-[#1d9bf0] fill-[#1d9bf0]" />,
          badgeBg: "bg-[#1d9bf0]/15 border-[#1d9bf0]/30 text-[#1d9bf0]",
          actionText: "replied to your comment",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "Reply",
        };
      case "MENTION":
        return {
          icon: <AtSign className="size-3.5 text-violet-500 stroke-[2.5]" />,
          badgeBg: "bg-violet-500/15 border-violet-500/30 text-violet-500",
          actionText: "mentioned you in a campus post",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "View thread",
        };
      case "REPOST":
        return {
          icon: <Repeat2 className="size-3.5 text-emerald-500 stroke-[2.5]" />,
          badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
          actionText: "reposted your post to the campus feed",
          href: n.referenceId ? `/app/post/${n.referenceId}` : "/app",
          actionLabel: "View",
        };
      case "MATCH":
        return {
          icon: <Zap className="size-3.5 text-amber-500 fill-amber-500" />,
          badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-500",
          actionText: "matched with you on Campus Dating! 💫",
          href: n.referenceId ? `/app/chat/${n.referenceId}` : "/app/chat",
          actionLabel: "Send message",
        };
      case "CRUSH_ALERT":
        return {
          icon: <Lock className="size-3.5 text-purple-500" />,
          badgeBg: "bg-purple-500/15 border-purple-500/30 text-purple-500",
          actionText: "secretly added you to their Campus Crush vault 🔒",
          href: "/app/crush",
          actionLabel: "View vault",
        };
      case "MILESTONE":
        return {
          icon: <Trophy className="size-3.5 text-amber-500" />,
          badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-500",
          actionText: "unlocked a new Loop Points Clout Milestone! 🏆",
          href: "/app/profile",
          actionLabel: "View clout",
        };
      default:
        return {
          icon: <Sparkles className="size-3.5 text-primary" />,
          badgeBg: "bg-primary/15 border-primary/30 text-primary",
          actionText: "interacted with you",
          href: "/app",
          actionLabel: "View",
        };
    }
  }

  function handleItemClick(n: NotificationItem, href: string) {
    sounds.tap();
    haptics.light();
    if (!n.isRead) {
      markAsRead(n.id);
    }
    router.push(href);
  }

  function handleMarkAllAsRead() {
    sounds.ting();
    haptics.success();
    markAllAsRead();
  }

  const tabs: { id: NotificationTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "mentions", label: "Mentions" },
    { id: "replies", label: "Replies" },
    { id: "reactions", label: "Reactions" },
    { id: "crushes", label: "Crushes & Matches" },
    { id: "verified", label: "Verified" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-28 select-none border-x border-border/20">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-black tracking-tight text-foreground">
              Notifications
            </h1>
            {effectiveUnread > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-primary text-primary-foreground shadow-xs">
                {effectiveUnread}
              </span>
            )}
          </div>

          {effectiveUnread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Mark all notifications as read"
            >
              <CheckCheck className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Mark all as read</span>
            </button>
          )}
        </div>

        {/* ─── Filter Pills Bar (Twitter/Linear Style) ─── */}
        <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setActiveTab(tab.id);
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0",
                  isActive
                    ? "bg-foreground text-background font-black shadow-xs"
                    : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/40"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Notification Items Feed ─── */}
      <div className="divide-y divide-border/20">
        {displayList.map((n) => {
          const meta = getNotificationMeta(n);
          const isVerified = Boolean(
            (n.actor?.points || 0) >= 150 || n.actor?.role === "ADMIN"
          );
          const actorAvatar = getAvatarUrl(
            n.actor?.avatarUrl,
            n.actor?.username || "student"
          );
          const campusName = n.actor?.institution?.name?.split(",")[0] || null;

          return (
            <div
              key={n.id}
              onClick={() => handleItemClick(n, meta.href)}
              className={cn(
                "group flex items-start gap-3.5 px-4 py-3.5 hover:bg-muted/[0.22] transition-colors relative cursor-pointer",
                !n.isRead && "bg-primary/[0.035]"
              )}
            >
              {/* Unread Indicator Pill on Left Edge */}
              {!n.isRead && (
                <span className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
              )}

              {/* Left Column: Avatar with Action Badge */}
              <div className="relative shrink-0 pt-0.5">
                <Link
                  href={`/@${n.actor?.username || "student"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="size-10 rounded-full border border-border/50 hover:opacity-90 transition-opacity">
                    <AvatarImage src={actorAvatar || ""} />
                    <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                      {n.actor?.displayName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* Sub-badge over corner */}
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 size-5 rounded-full border border-card flex items-center justify-center shadow-xs",
                    meta.badgeBg
                  )}
                >
                  {meta.icon}
                </div>
              </div>

              {/* Center Column: Text & Content Preview */}
              <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                <div className="flex items-center gap-1.5 text-xs flex-wrap leading-tight">
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

                  <span className="text-muted-foreground font-medium">
                    @{n.actor?.username || "student"}
                  </span>

                  {campusName && (
                    <>
                      <span className="text-muted-foreground/40 text-[10px]">·</span>
                      <span className="text-[10px] font-semibold text-muted-foreground/80 truncate max-w-[120px]">
                        {campusName}
                      </span>
                    </>
                  )}

                  <span className="text-muted-foreground/40 text-[10px]">·</span>

                  <span className="text-[11px] text-muted-foreground/70 shrink-0 font-medium">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>

                {/* Action Descriptor */}
                <p className="text-[13px] text-foreground/90 font-medium leading-snug">
                  {meta.actionText}
                </p>

                {/* Quoted Snippet Box */}
                {n.previewText && (
                  <div className="rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/35 p-3 text-xs text-foreground/80 leading-relaxed transition-colors break-words font-normal">
                    <span className="text-muted-foreground font-semibold">"</span>
                    {n.previewText}
                    <span className="text-muted-foreground font-semibold">"</span>
                  </div>
                )}
              </div>

              {/* Right Column: Actions (Mark Read & Navigate) */}
              <div className="flex flex-col items-end justify-between shrink-0 pl-1 pt-0.5 self-stretch">
                {!n.isRead ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.pop();
                      haptics.medium();
                      markAsRead(n.id);
                    }}
                    className="size-6 rounded-full hover:bg-muted flex items-center justify-center text-primary hover:text-foreground transition-colors cursor-pointer"
                    title="Mark as read"
                  >
                    <span className="size-2 rounded-full bg-primary inline-block" />
                  </button>
                ) : (
                  <div className="size-6" />
                )}

                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-0.5 mt-auto">
                  {meta.actionLabel} &rarr;
                </span>
              </div>
            </div>
          );
        })}

        {/* ─── Empty State ─── */}
        {!isLoading && displayList.length === 0 && (
          <div className="py-24 px-6 text-center max-w-sm mx-auto space-y-4">
            <div className="size-16 rounded-3xl bg-muted/50 border border-border/40 flex items-center justify-center mx-auto text-muted-foreground">
              {activeTab === "mentions" ? (
                <AtSign className="size-8 text-violet-500" />
              ) : activeTab === "replies" ? (
                <MessageCircle className="size-8 text-blue-500" />
              ) : activeTab === "reactions" ? (
                <Heart className="size-8 text-rose-500" />
              ) : activeTab === "crushes" ? (
                <Lock className="size-8 text-purple-500" />
              ) : (
                <Bell className="size-8 text-primary" />
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-black text-foreground">
                {activeTab === "all"
                  ? "All caught up!"
                  : activeTab === "mentions"
                  ? "No mentions yet"
                  : activeTab === "replies"
                  ? "No replies yet"
                  : activeTab === "reactions"
                  ? "No reactions yet"
                  : activeTab === "crushes"
                  ? "No crushes or matches yet"
                  : "No verified notifications"}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeTab === "all"
                  ? "When students like your posts, tag you in discussions, or match with you on campus, you will see it here."
                  : activeTab === "mentions"
                  ? "When fellow campus classmates tag your @handle in threads or confessions, you will find them here."
                  : activeTab === "replies"
                  ? "Replies to your campus questions and discussion threads will show up here."
                  : activeTab === "reactions"
                  ? "Upvotes, hearts, reposts, and story reactions will be recorded here."
                  : activeTab === "crushes"
                  ? "Crush alerts and match connections from Campus Match will be securely delivered here."
                  : "Notifications from verified students and college leaders with 150+ LP will appear here."}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Compass className="size-3.5" />
                <span>Explore Campus Feed</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
