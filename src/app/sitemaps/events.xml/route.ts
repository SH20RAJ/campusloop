import { getDb } from "@/db";
import { events } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const list = await db.query.events.findMany({
      columns: { id: true, slug: true, updatedAt: true },
      where: eq(events.status, "PUBLISHED"),
      orderBy: [desc(events.startDate)],
      limit: 2000,
    });

    const urls = list
      .map((item) => {
        const key = item.slug || item.id;
        const lastmod = (item.updatedAt ?? new Date()).toISOString();
        // Public `/e/` form only — `/app/events/...` is behind the auth gate.
        return `
  <url>
    <loc>https://campusloop.space/e/${key}</loc>
    <lastmod>${lastmod}</lastmod>
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
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Events sitemap error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }
}
