import { getDb } from "../src/db";
import { academicResources } from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

async function scanAcademicNotes() {
  const db = getDb();
  const allNotes = await db.select().from(academicResources);
  console.log(`Found ${allNotes.length} academic resources in database.`);

  const brokenNotes: Array<{
    id: string;
    title: string;
    subjectCode: string;
    fileUrl: string | null;
    driveUrl: string | null;
    reason: string;
  }> = [];

  for (const note of allNotes) {
    const urlsToCheck = [
      { type: "fileUrl", url: note.fileUrl },
      { type: "driveUrl", url: note.driveUrl },
    ].filter((u) => Boolean(u.url));

    if (urlsToCheck.length === 0) {
      brokenNotes.push({
        id: note.id,
        title: note.title,
        subjectCode: note.subjectCode,
        fileUrl: note.fileUrl,
        driveUrl: note.driveUrl,
        reason: "No URLs provided",
      });
      continue;
    }

    for (const item of urlsToCheck) {
      const targetUrl = item.url!;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(targetUrl, {
          method: "HEAD",
          headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.status === 405 || res.status === 403) {
          const getController = new AbortController();
          const getTimeout = setTimeout(() => getController.abort(), 6000);
          const getRes = await fetch(targetUrl, {
            method: "GET",
            headers: {
              Range: "bytes=0-200",
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            },
            signal: getController.signal,
          });
          clearTimeout(getTimeout);
          if (getRes.status >= 400 && getRes.status !== 403) {
            brokenNotes.push({
              id: note.id,
              title: note.title,
              subjectCode: note.subjectCode,
              fileUrl: note.fileUrl,
              driveUrl: note.driveUrl,
              reason: `${item.type} HTTP ${getRes.status}: ${targetUrl}`,
            });
          }
        } else if (res.status >= 400) {
          brokenNotes.push({
            id: note.id,
            title: note.title,
            subjectCode: note.subjectCode,
            fileUrl: note.fileUrl,
            driveUrl: note.driveUrl,
            reason: `${item.type} HTTP ${res.status}: ${targetUrl}`,
          });
        }
      } catch (err: any) {
        brokenNotes.push({
          id: note.id,
          title: note.title,
          subjectCode: note.subjectCode,
          fileUrl: note.fileUrl,
          driveUrl: note.driveUrl,
          reason: `${item.type} Fetch failed: ${err.message}`,
        });
      }
    }
  }

  console.log(`\n=== SCAN REPORT ===`);
  console.log(`Total scanned: ${allNotes.length}`);
  console.log(`Broken / Unreachable: ${brokenNotes.length}`);
  for (const b of brokenNotes) {
    console.log(`- [${b.id}] ${b.subjectCode} - "${b.title}": ${b.reason}`);
  }
}

scanAcademicNotes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
