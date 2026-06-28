import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { desc, ilike, sql } from "drizzle-orm";
import { PostsTable } from "./posts-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Posts | CampusLoop",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const db = getDb();
  
  const q = params.q || "";
  const page = Number(params.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Search filtering clause
  const whereClause = q 
    ? ilike(posts.body, `%${q}%`)
    : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(whereClause);

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Fetch posts
  const list = await db.query.posts.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      institution: true,
    }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Post Moderation</h2>
        <p className="text-muted-foreground text-sm">Review, verify, and delete posts across all campuses.</p>
      </div>

      <PostsTable 
        initialPosts={list} 
        page={page} 
        totalPages={totalPages} 
      />
    </div>
  );
}
