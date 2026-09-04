import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { linkClicks, shortLinks } from "@/db/schema";
import { resolveAdminSession } from "@/app/admin/_lib/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await resolveAdminSession();
    const db = getDb();

    const [links, recentClicks, deviceStats, topReferrers] = await Promise.all([
      db.query.shortLinks.findMany({
        orderBy: [desc(shortLinks.createdAt)],
      }),
      db.query.linkClicks.findMany({
        orderBy: [desc(linkClicks.createdAt)],
        limit: 50,
      }),
      db
        .select({
          device: linkClicks.device,
          count: sql<number>`count(*)::int`,
        })
        .from(linkClicks)
        .groupBy(linkClicks.device),
      db
        .select({
          referer: linkClicks.referer,
          count: sql<number>`count(*)::int`,
        })
        .from(linkClicks)
        .groupBy(linkClicks.referer)
        .orderBy(sql`count(*) desc`)
        .limit(10),
    ]);

    const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

    return NextResponse.json({
      links,
      recentClicks,
      deviceStats,
      topReferrers,
      totalClicks,
      totalLinks: links.length,
    });
  } catch (err) {
    console.error("Failed to fetch admin short links:", err);
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await resolveAdminSession();
    const body = (await req.json()) as any;
    let slug = (body.slug || "").trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    let targetUrl = (body.targetUrl || "").trim();
    const title = (body.title || "").trim() || slug;

    if (!slug || !targetUrl) {
      return NextResponse.json({ error: "Slug and target URL are required." }, { status: 400 });
    }

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://") && !targetUrl.startsWith("/")) {
      targetUrl = `https://${targetUrl}`;
    }

    const db = getDb();

    // Check collision
    const existing = await db.query.shortLinks.findFirst({
      where: eq(shortLinks.slug, slug),
    });

    if (existing) {
      return NextResponse.json({ error: `Short link /s/${slug} already exists.` }, { status: 409 });
    }

    const [newLink] = await db
      .insert(shortLinks)
      .values({
        slug,
        targetUrl,
        title,
        createdBy: admin.profile?.id || null,
      })
      .returning();

    return NextResponse.json({ success: true, link: newLink });
  } catch (err) {
    console.error("Failed to create short link:", err);
    return NextResponse.json({ error: "Failed to create short link" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await resolveAdminSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing link ID" }, { status: 400 });
    }

    const db = getDb();
    await db.delete(shortLinks).where(eq(shortLinks.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete short link:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
