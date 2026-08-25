import { getDb } from "@/db";
import { notifications, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Bell, Heart, MessageSquare, Sparkles, ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications | CampusLoop",
  description: "Your campus notifications, likes, comments, and matches.",
};

export default async function NotificationsPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  // Fetch notifications
  const list = await db.query.notifications.findMany({
    where: eq(notifications.userId, profile.id),
    orderBy: [desc(notifications.createdAt)],
    with: {
      actor: true,
    },
    limit: 50,
  });

  // Mark unread notifications as read
  if (list.some((n) => !n.isRead)) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, profile.id));
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-24 select-none">
      {/* Header (Matching Reference 1 Notifications Top Bar) */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 py-3.5 backdrop-blur-xl border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Bell className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-foreground">Notifications</h1>
            <p className="text-[10px] text-muted-foreground font-semibold">Likes, replies, and student matches</p>
          </div>
        </div>
        {list.length > 0 && (
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {list.length} New
          </span>
        )}
      </header>

      {/* List (Matching Reference 1 Notification Row Items) */}
      <div className="px-3 sm:px-4 py-4 space-y-2">
        {list.map((n) => {
          let icon = <Bell className="h-3 w-3 text-muted-foreground" />;
          let bgClass = "bg-muted";
          let message = "interacted with your campus profile.";
          let href = "#";
          let actionLabel = "View";

          if (n.type === "LIKE") {
            icon = <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />;
            bgClass = "bg-rose-500/10 border-rose-500/25";
            message = "upvoted your post.";
            href = `/app/post/${n.referenceId}`;
            actionLabel = "View Post";
          } else if (n.type === "COMMENT") {
            icon = <MessageSquare className="h-3 w-3 text-blue-500 fill-blue-500" />;
            bgClass = "bg-blue-500/10 border-blue-500/25";
            message = "commented on your post.";
            href = `/app/post/${n.referenceId}`;
            actionLabel = "Reply";
          } else if (n.type === "MATCH") {
            icon = <Sparkles className="h-3 w-3 text-primary" />;
            bgClass = "bg-primary/10 border-primary/25";
            message = "matched with you on Campus Dating!";
            href = `/app/chat`;
            actionLabel = "Chat";
          }

          const actorName = n.actor?.displayName || "A Student";
          const actorUsername = n.actor?.username || "student";
          const actorAvatar = n.actor?.avatarUrl || "";

          return (
            <div 
              key={n.id} 
              className={cn(
                "flex items-center justify-between gap-3 p-3.5 rounded-2xl border bg-card hover:bg-muted/30 transition-all",
                !n.isRead ? "border-primary/30 bg-primary/5 shadow-2xs" : "border-border/60 shadow-2xs"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="size-10 rounded-2xl border border-border/80 shadow-2xs">
                    <AvatarImage src={actorAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-2xl">
                      {actorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("absolute -bottom-1 -right-1 size-4.5 rounded-full border-2 border-card flex items-center justify-center", bgClass)}>
                    {icon}
                  </div>
                </div>

                <div className="text-xs min-w-0">
                  <p className="text-foreground leading-snug">
                    <Link href={`/@${actorUsername}`} className="font-bold hover:text-primary hover:underline">
                      {actorName}
                    </Link>{" "}
                    <span className="text-muted-foreground font-medium">{message}</span>
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 block mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })} · {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {href !== "#" && (
                <Link
                  href={href}
                  className="px-3 py-1.5 rounded-xl border border-border/70 bg-muted/30 hover:bg-muted text-foreground text-[11px] font-bold transition-all shrink-0 active:scale-95"
                >
                  {actionLabel}
                </Link>
              )}
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed rounded-3xl border-border bg-card/50 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">You&apos;re all caught up!</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                When classmates upvote your posts, comment, or match with you, they&apos;ll show up here in real time.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/app"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Compass className="h-3.5 w-3.5" /> Explore Feed
              </Link>
              <Link
                href="/app/dating"
                className="px-4 py-2 rounded-xl border border-border bg-muted/50 text-foreground text-xs font-bold hover:bg-muted transition-all flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Campus Dating
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
