import { getDb } from "../src/db";
import { academicResources } from "../src/db/schema";
import { sql } from "drizzle-orm";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

async function checkUrl(url: string): Promise<{ ok: boolean; status: number; message?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
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

    if (headRes.status === 405 || headRes.status === 403) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), 6000);
      const getRes = await fetch(url, {
        method: "GET",
        headers: {
          Range: "bytes=0-200",
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
  console.log("🔍 Fetching all distinct domain patterns and testing...");

  // Also check notes that have null fileUrl and null driveUrl
  const emptyUrlNotes = await db
    .select({ id: academicResources.id, title: academicResources.title })
    .from(academicResources)
    .where(sql`${academicResources.fileUrl} IS NULL AND ${academicResources.driveUrl} IS NULL`);

  console.log(`Notes with NO url at all: ${emptyUrlNotes.length}`);

  // Fetch all notes
  const allNotes = await db
    .select({
      id: academicResources.id,
      title: academicResources.title,
      subjectCode: academicResources.subjectCode,
      fileUrl: academicResources.fileUrl,
      driveUrl: academicResources.driveUrl,
    })
    .from(academicResources);

  console.log(`Total notes in database: ${allNotes.length}`);

  // Group by URL prefix to sample or test all
  const urlPrefixes = new Map<string, number>();
  for (const n of allNotes) {
    const u = n.fileUrl || n.driveUrl;
    if (!u) continue;
    try {
      const parsed = new URL(u);
      const prefix = `${parsed.origin}/${parsed.pathname.split("/")[1] || ""}`;
      urlPrefixes.set(prefix, (urlPrefixes.get(prefix) || 0) + 1);
    } catch {
      urlPrefixes.set("INVALID_URL", (urlPrefixes.get("INVALID_URL") || 0) + 1);
    }
  }

  console.log("\n--- URL Prefix Distribution ---");
  for (const [prefix, count] of urlPrefixes.entries()) {
    console.log(`${prefix}: ${count} notes`);
  }

  // Test across all prefixes
  console.log("\nTesting 20 samples from each prefix...");
  const brokenList: Array<{ id: string; title: string; url: string; status: number; error?: string }> = [];

  for (const [prefix] of urlPrefixes.entries()) {
    const matching = allNotes.filter((n) => {
      const u = n.fileUrl || n.driveUrl;
      return u && u.startsWith(prefix.split("/")[0]);
    }).slice(0, 30);

    for (const note of matching) {
      const u = (note.fileUrl || note.driveUrl)!;
      const res = await checkUrl(u);
      if (!res.ok) {
        brokenList.push({
          id: note.id,
          title: note.title,
          url: u,
          status: res.status,
          error: res.message,
        });
      }
    }
  }

  console.log(`\nSample test results: ${brokenList.length} broken found`);
  for (const b of brokenList) {
    console.log(`- [${b.id}] "${b.title}" -> Status: ${b.status} | ${b.url}`);
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
