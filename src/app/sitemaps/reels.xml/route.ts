import { and, eq, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const videoCondition = sql`(${posts.body} ILIKE '%.mp4%' OR ${posts.body} ILIKE '%.webm%' OR ${posts.body} ILIKE '%.mov%' OR ${posts.body} ILIKE '%/api/files/r2/videos/%')`;

    const list = await db.query.posts.findMany({
      columns: {
        id: true,
        createdAt: true,
        updatedAt: true,
      },
      where: and(eq(posts.status, "PUBLISHED"), videoCondition),
      orderBy: [desc(posts.createdAt)],
      limit: 2000,
    });

    const rootUrl = `
  <url>
    <loc>https://campusloop.space/app/reels</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

    const urls = list
      .map((item) => {
        const lastMod = (item.updatedAt || item.createdAt || new Date()).toISOString().split("T")[0];
        return `
  <url>
    <loc>https://campusloop.space/app/reels/${item.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rootUrl}${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=18000",
      },
    });
  } catch (error) {
    console.error("Reels sitemap error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://campusloop.space/app/reels</loc><priority>0.9</priority></url></urlset>`,
      { headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
