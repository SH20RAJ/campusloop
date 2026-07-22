import { getDb } from "@/db";
import { userProfiles, posts, institutions } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import { Users, FileText, School, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const db = getDb();
  
  // Stats
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(userProfiles);
  const [postsCount] = await db.select({ count: sql<number>`count(*)` }).from(posts);
  const [collegesCount] = await db.select({ count: sql<number>`count(*)` }).from(institutions);

  // Recent feed activity
  const recentPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    limit: 5,
    with: {
      author: true,
      institution: true,
    }
  });

  // Recent signups
  const recentUsers = await db.query.userProfiles.findMany({
    orderBy: [desc(userProfiles.createdAt)],
    limit: 5,
    with: {
      institution: true,
    }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm">Real-time telemetry and network operations.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</span>
            <div className="text-3xl font-extrabold text-foreground">{usersCount.count}</div>
          </div>
          <div className="rounded-lg bg-primary/10 p-3 text-primary border border-primary/10">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Posts</span>
            <div className="text-3xl font-extrabold text-foreground">{postsCount.count}</div>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500 border border-blue-500/10">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colleges Enrolled</span>
            <div className="text-3xl font-extrabold text-foreground">{collegesCount.count}</div>
          </div>
          <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500 border border-orange-500/10">
            <School className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Activity Panels */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Posts */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" /> Recent Posts
          </h3>
          <div className="divide-y divide-border">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-foreground">
                    {post.isAnonymous ? "Anonymous" : post.author?.displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{post.institution?.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.body}</p>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No posts found.</p>
            )}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" /> Recent Signups
          </h3>
          <div className="divide-y divide-border">
            {recentUsers.map((p) => (
              <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">{p.displayName}</p>
                  <p className="text-[10px] text-muted-foreground">@{p.username}</p>
                </div>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded border border-border font-medium text-foreground">
                  {p.institution?.name}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No signups found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
