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
      limit: 20,
      with: {
        author: true,
        institution: true,
      },
    });

    let items = "";
    for (const item of list) {
      const title = item.title || `Post by @${item.author?.username || "student"}`;
      const description = item.body.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<": return "&lt;";
          case ">": return "&gt;";
          case "&": return "&amp;";
          case "'": return "&apos;";
          case '"': return "&quot;";
          default: return c;
        }
      });

      items += `
    <item>
      <title>${title}</title>
      <link>https://campusloop.space/app/post/${item.id}</link>
      <guid>https://campusloop.space/app/post/${item.id}</guid>
      <pubDate>${new Date(item.createdAt).toUTCString()}</pubDate>
      <description>${description}</description>
    </item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CampusLoop Public Feed</title>
    <link>https://campusloop.space</link>
    <description>Latest public discussions and campus updates from CampusLoop.</description>
    <language>en-us</language>
    <atom:link href="https://campusloop.space/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=600, s-maxage=1200",
      },
    });
  } catch (error) {
    console.error("RSS feed error:", error);
    return new NextResponse("<rss version=\"2.0\"><channel></channel></rss>", {
      headers: { "Content-Type": "application/xml" },
    });
  }
}
