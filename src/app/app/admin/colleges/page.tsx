import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CollegesTable } from "./colleges-table";

export default async function CollegesAdminPage() {
  const db = getDb();
  const colleges = await db.query.institutions.findMany({
    orderBy: [desc(institutions.createdAt)],
    with: {
      domains: true,
    }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Colleges</h2>
          <p className="text-muted-foreground">Add, edit, or remove participating institutions and their allowed email domains.</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
        <CollegesTable initialColleges={colleges} />
      </div>
    </div>
  );
}
