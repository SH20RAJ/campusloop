import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const list = await db.query.institutions.findMany({
      columns: {
        id: true,
        slug: true,
      },
      orderBy: [desc(institutions.createdAt)],
      limit: 1500,
    });

    const urls = list
      .map((item) => {
        const slugOrId = item.slug || item.id;
        // The public `/college/` mirror, not `/app/college/`, which is gated.
        return `
  <url>
    <loc>https://campusloop.space/college/${slugOrId}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=43200, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Colleges sitemap error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }
}
