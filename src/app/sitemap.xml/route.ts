import { NextResponse } from "next/server";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://campusloop.space/sitemaps/static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://campusloop.space/sitemaps/colleges.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://campusloop.space/sitemaps/posts.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=18000",
    },
  });
}
