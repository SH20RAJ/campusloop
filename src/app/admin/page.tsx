import { getDb } from "@/db";
import { userProfiles, posts, institutions } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function AdminDashboard() {
  const db = getDb();
  
  // Basic stats
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(userProfiles);
  const [postsCount] = await db.select({ count: sql<number>`count(*)` }).from(posts);
  const [collegesCount] = await db.select({ count: sql<number>`count(*)` }).from(institutions);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to the CampusLoop admin panel.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <div className="mt-2 text-3xl font-bold">{usersCount.count}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Posts</h3>
          <div className="mt-2 text-3xl font-bold">{postsCount.count}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Colleges Enrolled</h3>
          <div className="mt-2 text-3xl font-bold">{collegesCount.count}</div>
        </div>
      </div>
    </div>
  );
}
