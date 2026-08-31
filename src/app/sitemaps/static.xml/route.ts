import { NextResponse } from "next/server";

export async function GET() {
  const pages = [
    { url: "https://campusloop.space/", priority: "1.0", changefreq: "daily" },
    { url: "https://campusloop.space/overview", priority: "0.9", changefreq: "weekly" },
    { url: "https://campusloop.space/pitch", priority: "0.9", changefreq: "weekly" },
    { url: "https://campusloop.space/colleges", priority: "0.9", changefreq: "daily" },
    { url: "https://campusloop.space/app/matching", priority: "0.8", changefreq: "daily" },
    { url: "https://campusloop.space/app/discover", priority: "0.8", changefreq: "daily" },
    { url: "https://campusloop.space/about", priority: "0.8", changefreq: "monthly" },
    { url: "https://campusloop.space/safety", priority: "0.7", changefreq: "monthly" },
    { url: "https://campusloop.space/privacy", priority: "0.7", changefreq: "monthly" },
    { url: "https://campusloop.space/terms", priority: "0.7", changefreq: "monthly" },
    { url: "https://campusloop.space/contact", priority: "0.7", changefreq: "monthly" },
    { url: "https://campusloop.space/join", priority: "0.9", changefreq: "weekly" },
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
