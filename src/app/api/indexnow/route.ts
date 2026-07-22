import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions, posts, communities, userProfiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const INDEXNOW_KEY = "ff35ddf54af340798feb9034fcd9d317";
const HOST = "campusloop.space";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export async function GET() {
  try {
    const db = getDb();

    // 1. Static URLs
    const urls: string[] = [
      `https://${HOST}/`,
      `https://${HOST}/about`,
      `https://${HOST}/contact`,
      `https://${HOST}/join`,
      `https://${HOST}/privacy`,
      `https://${HOST}/safety`,
      `https://${HOST}/colleges`,
      `https://${HOST}/pitch`,
    ];

    // 2. Colleges
    const collegeList = await db.query.institutions.findMany({
      orderBy: [desc(institutions.createdAt)],
      limit: 2000,
    });
    for (const c of collegeList) {
      urls.push(`https://${HOST}/app/college/${c.slug || c.id}`);
      urls.push(`https://${HOST}/college/${c.id}`);
    }

    // 3. Posts
    const postList = await db.query.posts.findMany({
      where: eq(posts.status, "PUBLISHED"),
      orderBy: [desc(posts.createdAt)],
      limit: 5000,
    });
    for (const p of postList) {
      urls.push(`https://${HOST}/app/post/${p.id}`);
    }

    // 4. Communities
    const commList = await db.query.communities.findMany({
      orderBy: [desc(communities.createdAt)],
      limit: 2000,
    });
    for (const comm of commList) {
      urls.push(`https://${HOST}/app/communities/${comm.id}`);
      urls.push(`https://${HOST}/c/${comm.id}`);
    }

    // 5. User profiles
    const profileList = await db.query.userProfiles.findMany({
      orderBy: [desc(userProfiles.createdAt)],
      limit: 5000,
    });
    for (const prof of profileList) {
      if (prof.username) {
        urls.push(`https://${HOST}/@${prof.username}`);
      }
    }

    // IndexNow allows max 10,000 URLs per batch payload
    const batchSize = 10000;
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const payload = {
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: batch,
      };

      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });

      results.push({
        status: res.status,
        submittedCount: batch.length,
      });
    }

    return NextResponse.json({
      success: true,
      totalUrls: urls.length,
      batches: results,
    });
  } catch (error) {
    console.error("IndexNow API submission error:", error);
    return NextResponse.json(
      { error: "IndexNow submission failed", details: String(error) },
      { status: 500 }
    );
  }
}
