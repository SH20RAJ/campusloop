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
      {/* Header (Exact match to Reference 2 Notifications Top Bar) */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 py-3.5 backdrop-blur-xl border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex items-center justify-center size-8 rounded-full bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="text-sm font-black">‹</span>
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-tight text-foreground">Notifications</h1>
            {profile.avatarUrl && (
              <Avatar className="size-6 border border-border/60">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-[9px] font-bold">
                  {profile.displayName[0]}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {list.length > 0 && (
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {list.length} New
            </span>
          )}
        </div>
      </header>

      {/* List (Matching Reference 2 Notification Row Items) */}
      <div className="px-3 sm:px-4 py-3 space-y-1">
        {list.map((n) => {
          let icon = <Bell className="size-3 text-muted-foreground" />;
          let bgClass = "bg-muted";
          let message = "interacted with your campus profile.";
          let href = "#";
          let actionLabel = "View";

          if (n.type === "LIKE") {
            icon = <Heart className="size-3 text-rose-500 fill-rose-500" />;
            bgClass = "bg-rose-500/10 text-rose-500";
            message = "liked your post";
            href = `/app/post/${n.referenceId}`;
            actionLabel = "View";
          } else if (n.type === "COMMENT") {
            icon = <MessageSquare className="size-3 text-blue-500 fill-blue-500" />;
            bgClass = "bg-blue-500/10 text-blue-500";
            message = "replied to your post";
            href = `/app/post/${n.referenceId}`;
            actionLabel = "Reply";
          } else if (n.type === "MATCH") {
            icon = <Sparkles className="size-3 text-primary" />;
            bgClass = "bg-primary/10 text-primary";
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
                "flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-all",
                !n.isRead ? "bg-primary/5" : "bg-transparent"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="size-10 rounded-full border border-border/40">
                    <AvatarImage src={actorAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-full">
                      {actorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 size-4.5 rounded-full border-2 border-background flex items-center justify-center shadow-xs", bgClass)}>
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
                  <span className="text-[10px] text-muted-foreground/60 block mt-0.5 font-medium">
                    {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })} · {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {href !== "#" && (
                <Link
                  href={href}
                  className="px-4 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-foreground text-xs font-bold transition-all shrink-0 active:scale-95 shadow-2xs"
                >
                  {actionLabel}
                </Link>
              )}
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
              <Bell className="size-6" />
            </div>
            <p className="text-sm font-bold text-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              When peers upvote your posts, drop comments, or match with you, they will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                <Compass className="size-3.5" /> Explore Feed
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
