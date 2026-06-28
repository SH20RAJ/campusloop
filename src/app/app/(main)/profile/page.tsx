import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { FeedCard } from "@/components/ui/feed-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, School, Shield, User } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | CampusLoop",
};

export default async function ProfilePage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
    with: {
      institution: true,
    }
  });

  if (!profile) {
    redirect("/app/onboarding");
  }

  // Fetch posts written by this user
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, profile.id),
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: true,
    }
  });

  // Format posts to match FeedPost type required by FeedCard
  const formattedPosts = userPosts.map(post => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;
    const userVote = post.votes.find(v => v.userId === profile.id)?.value || 0;

    return {
      ...post,
      votesCount,
      commentsCount,
      userVote,
      votes: undefined,
      comments: undefined,
    };
  });

  return (
    <main className="space-y-6">
      {/* Profile Card Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={profile.avatarUrl || ""} />
              <AvatarFallback className="text-xl">{profile.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center justify-center sm:justify-start gap-1">
                {profile.displayName}
                {profile.role === "ADMIN" && (
                  <Shield className="h-4.5 w-4.5 text-red-500 fill-red-500/10" title="Admin User" />
                )}
              </h2>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
          
          <a
            href="/handler/sign-out"
            className="flex items-center gap-2 rounded-lg border border-input h-9 px-4 text-sm font-semibold hover:bg-muted text-destructive hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </a>
        </div>

        {profile.bio && (
          <p className="text-sm text-foreground/90 border-t border-border pt-4 italic">
            "{profile.bio}"
          </p>
        )}

        <div className="grid gap-3 pt-2 text-xs text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-1.5">
            <School className="h-4 w-4 shrink-0 text-muted-foreground/60" /> {profile.institution?.name}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4 shrink-0 text-muted-foreground/60" /> {profile.role === "ADMIN" ? "Administrator" : "Student Member"}
          </span>
        </div>
      </div>

      {/* User's Posts Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Your Posts</h3>
        
        <div className="space-y-6">
          {formattedPosts.map((post) => (
            <FeedCard key={post.id} post={post as any} />
          ))}
          {formattedPosts.length === 0 && (
            <div className="text-center py-12 border border-dashed rounded-xl border-border bg-card text-muted-foreground text-sm">
              You haven't posted anything yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
