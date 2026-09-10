import { NextResponse } from "next/server";
import { getDocsSlugs } from "@/lib/docs-features";

export async function GET() {
  const pages = [
    { url: "https://campusloop.space/", priority: "1.0", changefreq: "daily" },
    { url: "https://campusloop.space/docs", priority: "0.9", changefreq: "weekly" },
    ...getDocsSlugs().map((slug) => ({
      url: `https://campusloop.space/docs/${slug}`,
      priority: "0.8",
      changefreq: "monthly",
    })),
    { url: "https://campusloop.space/app/academics", priority: "1.0", changefreq: "daily" },
    { url: "https://campusloop.space/app/academics/sources", priority: "0.9", changefreq: "daily" },
    { url: "https://campusloop.space/colleges", priority: "0.9", changefreq: "daily" },
    { url: "https://campusloop.space/app/articles", priority: "0.8", changefreq: "daily" },
    { url: "https://campusloop.space/app/events", priority: "0.8", changefreq: "daily" },
    { url: "https://campusloop.space/app/communities", priority: "0.8", changefreq: "daily" },
    { url: "https://campusloop.space/overview", priority: "0.9", changefreq: "weekly" },
    { url: "https://campusloop.space/products", priority: "0.9", changefreq: "weekly" },
    { url: "https://campusloop.space/pitch", priority: "0.9", changefreq: "weekly" },
    { url: "https://campusloop.space/about", priority: "0.8", changefreq: "monthly" },
    { url: "https://campusloop.space/demo", priority: "0.7", changefreq: "monthly" },
    { url: "https://campusloop.space/safety", priority: "0.7", changefreq: "monthly" },
    { url: "https://campusloop.space/privacy", priority: "0.7", changefreq: "monthly" },
    { url: "https://campusloop.space/terms", priority: "0.7", changefreq: "monthly" },
    { url: "https://campusloop.space/contact", priority: "0.7", changefreq: "monthly" },
  ];

  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
