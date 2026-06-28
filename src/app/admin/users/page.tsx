import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { desc, or, ilike, sql } from "drizzle-orm";
import { UsersTable } from "./users-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Users | CampusLoop",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const db = getDb();
  
  const q = params.q || "";
  const page = Number(params.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // Search filtering clause
  const whereClause = q 
    ? or(
        ilike(userProfiles.username, `%${q}%`),
        ilike(userProfiles.displayName, `%${q}%`)
      )
    : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(userProfiles)
    .where(whereClause);

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Fetch users
  const users = await db.query.userProfiles.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: [desc(userProfiles.createdAt)],
    with: {
      institution: true,
    }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">User Accounts</h2>
        <p className="text-muted-foreground text-sm">Review, verify, and moderate student accounts.</p>
      </div>

      <UsersTable 
        initialUsers={users} 
        page={page} 
        totalPages={totalPages} 
      />
    </div>
  );
}
