import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicResources, articles, communities, events, institutions, posts, userProfiles } from "@/db/schema";

export const dynamic = "force-dynamic";

const INDEXNOW_KEY = "ff35ddf54af340798feb9034fcd9d317";
const HOST = "campusloop.space";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export async function GET() {
  try {
    const db = getDb();

    // 1. Static Canonical URLs
    const urls: string[] = [
      `https://${HOST}/`,
      `https://${HOST}/app/academics`,
      `https://${HOST}/app/academics/sources`,
      `https://${HOST}/colleges`,
      `https://${HOST}/app/articles`,
      `https://${HOST}/app/events`,
      `https://${HOST}/app/communities`,
      `https://${HOST}/overview`,
      `https://${HOST}/pitch`,
      `https://${HOST}/about`,
      `https://${HOST}/demo`,
      `https://${HOST}/safety`,
      `https://${HOST}/privacy`,
      `https://${HOST}/terms`,
      `https://${HOST}/contact`,
    ];

    // 2. Colleges (Canonical public URLs)
    const collegeList = await db.query.institutions.findMany({
      columns: { id: true, slug: true },
      orderBy: [desc(institutions.createdAt)],
      limit: 1500,
    });
    for (const c of collegeList) {
      urls.push(`https://${HOST}/college/${c.slug || c.id}`);
    }

    // 3. Articles (Published Canonical URLs)
    const articleList = await db.query.articles.findMany({
      columns: { slug: true },
      where: eq(articles.status, "PUBLISHED"),
      orderBy: [desc(articles.publishedAt)],
      limit: 1000,
    });
    for (const a of articleList) {
      urls.push(`https://${HOST}/a/${a.slug}`);
    }

    // 4. Events (Published Canonical URLs)
    const eventList = await db.query.events.findMany({
      columns: { id: true, slug: true },
      where: eq(events.status, "PUBLISHED"),
      orderBy: [desc(events.startDate)],
      limit: 1000,
    });
    for (const e of eventList) {
      urls.push(`https://${HOST}/e/${e.slug || e.id}`);
    }

    // 5. Posts (Public Non-Anonymous Posts)
    const postList = await db.query.posts.findMany({
      columns: { id: true },
      where: eq(posts.status, "PUBLISHED"),
      orderBy: [desc(posts.createdAt)],
      limit: 1000,
    });
    for (const p of postList) {
      urls.push(`https://${HOST}/app/post/${p.id}`);
    }

    // 6. Communities (Canonical URLs)
    const commList = await db.query.communities.findMany({
      columns: { id: true },
      orderBy: [desc(communities.createdAt)],
      limit: 1000,
    });
    for (const comm of commList) {
      urls.push(`https://${HOST}/app/communities/${comm.id}`);
    }

    // 7. Student Profiles
    const profileList = await db.query.userProfiles.findMany({
      columns: { username: true },
      orderBy: [desc(userProfiles.createdAt)],
      limit: 1000,
    });
    for (const prof of profileList) {
      if (prof.username) {
        urls.push(`https://${HOST}/@${prof.username}`);
      }
    }

    // 8. Academic Resources (Notes, PYQs, Formula Sheets)
    const academicList = await db.query.academicResources.findMany({
      columns: { id: true },
      orderBy: [desc(academicResources.createdAt)],
      limit: 5000,
    });
    for (const res of academicList) {
      urls.push(`https://${HOST}/app/academics/${res.id}`);
    }

    // IndexNow allows max 10,000 URLs per batch payload
    const batchUrls = urls.slice(0, 10000);
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: batchUrls,
    };

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: true,
      status: res.status,
      totalUrlsSubmitted: batchUrls.length,
    });
  } catch (error) {
    console.error("IndexNow API submission error:", error);
    return NextResponse.json(
      { error: "IndexNow submission failed", details: String(error) },
      { status: 500 }
    );
  }
}
