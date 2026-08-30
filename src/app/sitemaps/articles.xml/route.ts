import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { articles } from "@/db/schema";

export const dynamic = "force-dynamic";

/** Escapes the five XML entities so a title with `&` cannot break the feed. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const db = getDb();
    const list = await db.query.articles.findMany({
      columns: { slug: true, updatedAt: true, coverImageUrl: true, title: true },
      where: eq(articles.status, "PUBLISHED"),
      orderBy: [desc(articles.publishedAt)],
      limit: 2000,
    });

    const urls = list
      .map((item) => {
        const lastmod = (item.updatedAt ?? new Date()).toISOString();
        // Both the canonical reader URL and the shareable short link are listed,
        // since QR cards and chat shares circulate the /a/ form.
        const image = item.coverImageUrl
          ? `
    <image:image>
      <image:loc>${escapeXml(item.coverImageUrl)}</image:loc>
      <image:title>${escapeXml(item.title)}</image:title>
    </image:image>`
          : "";

        // Only the public `/a/` form is listed: `/app/articles/...` sits behind
        // the auth gate and would serve Googlebot a sign-in redirect.
        return `
  <url>
    <loc>https://campusloop.space/a/${item.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${image}
  </url>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Articles sitemap error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }
}
