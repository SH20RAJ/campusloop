import Link from "next/link";
import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { Plus } from "lucide-react";
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
        <Link
          href="/admin/colleges/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add College
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <CollegesTable initialColleges={colleges} />
      </div>
    </div>
  );
}
