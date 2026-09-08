import { getDb } from "../src/db";
import { academicResources } from "../src/db/schema";
import { desc } from "drizzle-orm";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

async function checkUrl(url: string): Promise<{ ok: boolean; status: number; message?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    // Try HEAD first
    const headRes = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (headRes.ok) {
      return { ok: true, status: headRes.status };
    }

    // If HEAD failed with 405 (method not allowed) or 403, try GET with Range
    if (headRes.status === 405 || headRes.status === 403) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), 7000);
      const getRes = await fetch(url, {
        method: "GET",
        headers: {
          Range: "bytes=0-100",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
        signal: getController.signal,
      });
      clearTimeout(getTimeout);
      return { ok: getRes.ok || getRes.status === 206, status: getRes.status };
    }

    return { ok: false, status: headRes.status };
  } catch (err: any) {
    return { ok: false, status: 0, message: err.message };
  }
}

async function run() {
  const db = getDb();
  console.log("🔍 Scanning the 500 most recently added academic notes...");

  const latestNotes = await db
    .select({
      id: academicResources.id,
      title: academicResources.title,
      subjectCode: academicResources.subjectCode,
      fileUrl: academicResources.fileUrl,
      driveUrl: academicResources.driveUrl,
      createdAt: academicResources.createdAt,
    })
    .from(academicResources)
    .orderBy(desc(academicResources.createdAt))
    .limit(500);

  console.log(`Retrieved ${latestNotes.length} latest notes. Testing URLs concurrently...`);

  const results: Array<{
    id: string;
    title: string;
    url: string;
    status: number;
    ok: boolean;
    error?: string;
  }> = [];

  // Concurrency pool of 10
  const queue = [...latestNotes];
  const workers = Array.from({ length: 10 }, async () => {
    while (queue.length > 0) {
      const note = queue.shift();
      if (!note) break;
      const targetUrl = note.fileUrl || note.driveUrl;
      if (!targetUrl) {
        results.push({
          id: note.id,
          title: note.title,
          url: "NONE",
          status: 404,
          ok: false,
          error: "No URL",
        });
        continue;
      }

      const check = await checkUrl(targetUrl);
      results.push({
        id: note.id,
        title: note.title,
        url: targetUrl,
        status: check.status,
        ok: check.ok,
        error: check.message,
      });
    }
  });

  await Promise.all(workers);

  const broken = results.filter((r) => !r.ok);
  const working = results.filter((r) => r.ok);

  console.log(`\n================ SCAN SUMMARY ================`);
  console.log(`Total scanned: ${results.length}`);
  console.log(`Working (200/206 OK): ${working.length}`);
  console.log(`Broken / 404 / 500: ${broken.length}`);

  if (broken.length > 0) {
    console.log(`\n❌ Broken Notes List:`);
    for (const b of broken) {
      console.log(`- [${b.id}] "${b.title}": Status ${b.status} | URL: ${b.url} ${b.error ? `(${b.error})` : ""}`);
    }
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
