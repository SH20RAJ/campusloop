import { desc, eq, isNotNull } from "drizzle-orm";
import type { Metadata } from "next";
import { institutions, posts } from "@/db/schema";
import { resolveAdminSession } from "../_lib/guard";
import { BroadcastsClient } from "./broadcasts-client";

export const metadata: Metadata = {
  title: "Campus Broadcasts & Announcements",
};

export const dynamic = "force-dynamic";

export default async function AdminBroadcastsPage() {
  const { db } = await resolveAdminSession();

  const [institutionsList, rawBroadcasts] = await Promise.all([
    db.query.institutions.findMany({
      columns: { id: true, name: true },
      limit: 60,
    }),
    db
      .select({
        id: posts.id,
        title: posts.title,
        body: posts.body,
        scope: posts.scope,
        createdAt: posts.createdAt,
        institutionName: institutions.name,
      })
      .from(posts)
      .leftJoin(institutions, eq(posts.institutionId, institutions.id))
      .where(isNotNull(posts.title))
      .orderBy(desc(posts.createdAt))
      .limit(6)
      .catch(() => []),
  ]);

  const recentBroadcasts = rawBroadcasts.map((b) => ({
    ...b,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Campus Broadcasts &amp; Announcements
          </h2>
          <p className="text-muted-foreground text-sm">
            Dispatch urgent notices, official university announcements, and timeline banners to students.
          </p>
        </div>
      </header>

      <BroadcastsClient
        institutions={institutionsList}
        recentBroadcasts={recentBroadcasts}
      />
    </div>
  );
}
