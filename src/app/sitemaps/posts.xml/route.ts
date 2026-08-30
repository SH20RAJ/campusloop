import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const list = await db.query.posts.findMany({
      columns: {
        id: true,
      },
      // Anonymous posts (confessions) are never submitted for indexing: they
      // are already hidden from public profiles, and handing them to Google
      // would undo that.
      where: and(eq(posts.status, "PUBLISHED"), eq(posts.isAnonymous, false)),
      orderBy: [desc(posts.createdAt)],
      limit: 2000,
    });

    const urls = list
      .map(
        (item) => `
  <url>
    <loc>https://campusloop.space/app/post/${item.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Posts sitemap error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }
}
