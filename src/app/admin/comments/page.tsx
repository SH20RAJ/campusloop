import { getDb } from "@/db";
import { comments } from "@/db/schema";
import { desc, ilike, sql } from "drizzle-orm";
import { CommentsTable } from "./comments-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Comments | CampusLoop",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const db = getDb();
  
  const q = params.q || "";
  const page = Number(params.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Search filtering clause
  const whereClause = q 
    ? ilike(comments.body, `%${q}%`)
    : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(whereClause);

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Fetch comments
  const list = await db.query.comments.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: [desc(comments.createdAt)],
    with: {
      author: true,
      post: true,
    }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Comment Moderation</h2>
        <p className="text-muted-foreground text-sm">Review and delete comments across all campuses.</p>
      </div>

      <CommentsTable 
        initialComments={list} 
        page={page} 
        totalPages={totalPages} 
      />
    </div>
  );
}
