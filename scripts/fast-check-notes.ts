import { getDb } from "../src/db";
import { academicResources } from "../src/db/schema";
import { notLike } from "drizzle-orm";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

async function checkUrl(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "Mozilla/5.0 CampusLoop HealthCheck" },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (res.ok) return { ok: true, status: res.status };
    if (res.status === 405 || res.status === 403) {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 4000);
      const g = await fetch(url, {
        headers: { Range: "bytes=0-100", "User-Agent": "Mozilla/5.0 CampusLoop HealthCheck" },
        signal: c2.signal,
      });
      clearTimeout(t2);
      return { ok: g.ok || g.status === 206, status: g.status };
    }
    return { ok: false, status: res.status };
  } catch (e: any) {
    return { ok: false, status: 0 };
  }
}

async function main() {
  const db = getDb();
  const nonBit = await db
    .select({
      id: academicResources.id,
      title: academicResources.title,
      fileUrl: academicResources.fileUrl,
      driveUrl: academicResources.driveUrl,
    })
    .from(academicResources)
    .where(notLike(academicResources.fileUrl, "%bitmesra.ac.in%"));

  console.log(`Scanning ${nonBit.length} non-bitmesra notes with concurrency 30...`);
  const queue = [...nonBit];
  const broken: Array<{ id: string; title: string; url: string; status: number }> = [];

  const workers = Array.from({ length: 30 }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const url = item.fileUrl || item.driveUrl;
      if (!url) {
        broken.push({ id: item.id, title: item.title, url: "NONE", status: 404 });
        continue;
      }
      const res = await checkUrl(url);
      if (!res.ok) {
        broken.push({ id: item.id, title: item.title, url, status: res.status });
      }
    }
  });

  await Promise.all(workers);
  console.log(`Finished scan. Found ${broken.length} broken/404 notes out of ${nonBit.length}.`);
  console.log(JSON.stringify(broken, null, 2));
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
