import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { desc, and, eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const list = await db.query.posts.findMany({
      where: and(eq(posts.isAnonymous, false), eq(posts.status, "PUBLISHED")),
      orderBy: [desc(posts.createdAt)],
      limit: 10000,
    });

    let urls = "";
    for (const item of list) {
      urls += `
  <url>
    <loc>https://campusloop.space/app/post/${item.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }

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
    return new NextResponse("<urlset></urlset>", {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
