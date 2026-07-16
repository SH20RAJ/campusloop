import { getDb } from "@/db";
import { notifications, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Bell, Heart, MessageSquare, Sparkles, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | CampusLoop",
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

  // Mark all notifications as read (optional, we can do it inline or on load)
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, profile.id));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 px-4 py-4 backdrop-blur-xl border-b border-border">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Notifications
        </h1>
        <p className="text-xs text-muted-foreground">Catch up on what you've missed.</p>
      </header>

      {/* List */}
      <div className="px-4 py-6 space-y-4">
        {list.map((n) => {
          let icon = <Bell className="h-4 w-4 text-muted-foreground" />;
          let bgClass = "bg-muted";
          let message = "";
          let href = "#";

          if (n.type === "LIKE") {
            icon = <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />;
            bgClass = "bg-rose-500/10 border-rose-500/25";
            message = "upvoted your post.";
            href = `/app/post/${n.referenceId}`;
          } else if (n.type === "COMMENT") {
            icon = <MessageSquare className="h-4 w-4 text-blue-500 fill-blue-500" />;
            bgClass = "bg-blue-500/10 border-blue-500/25";
            message = "commented on your post.";
            href = `/app/post/${n.referenceId}`;
          } else if (n.type === "MATCH") {
            icon = <Sparkles className="h-4 w-4 text-primary" />;
            bgClass = "bg-primary/10 border-primary/25";
            message = "matched with you! Send them a direct message.";
            href = `/app/chat`;
          }

          return (
            <div 
              key={n.id} 
              className={`flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors ${!n.isRead ? 'border-primary/20 shadow-sm' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${bgClass}`}>
                  {icon}
                </div>
                <div className="text-xs">
                  <p className="text-foreground leading-normal">
                    <span className="font-bold">@{n.actor?.username || "someone"}</span>{" "}
                    {message}
                  </p>
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {href !== "#" && (
                <Link
                  href={href}
                  className="h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="text-center py-16 border border-dashed rounded-xl border-border bg-card text-muted-foreground text-sm">
            You're all caught up! No new notifications.
          </div>
        )}
      </div>
    </main>
  );
}
