import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const list = await db.query.userProfiles.findMany({
      orderBy: [desc(userProfiles.createdAt)],
      limit: 10000,
    });

    let urls = "";
    for (const item of list) {
      if (item.username) {
        urls += `
  <url>
    <loc>https://campusloop.space/@${item.username}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
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
    console.error("Profiles sitemap error:", error);
    return new NextResponse("<urlset></urlset>", {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
