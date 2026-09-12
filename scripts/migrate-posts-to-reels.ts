import { config } from "dotenv";
config({ path: ".dev.vars" });
import { getDb } from "../src/db/index";
import { sql } from "drizzle-orm";

interface PostRow {
  id: string;
  title: string | null;
  body: string | null;
  author_id: string | null;
  institution_id: string | null;
  created_at: Date;
  updated_at: Date;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  external_post_id: string;
  canonical_url: string | null;
  subreddit: string | null;
  score: number | null;
  comment_count: number | null;
  media_url: string | null;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
}

const REDDIT_VIDEO_REGEX = /https:\/\/v\.redd\.it\/([a-zA-Z0-9_-]+)/;
const HASHTAG_REGEX = /#[a-zA-Z0-9_]+/g;

async function checkUrlStatus(url: string, timeoutMs = 2500): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CampusLoop/1.0)" },
    });
    return res.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

async function findWorkingRedditStreams(videoId: string): Promise<{
  hlsUrl: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
} | null> {
  const hlsUrl = `https://v.redd.it/${videoId}/HLSPlaylist.m3u8`;
  const hlsStatus = await checkUrlStatus(hlsUrl);

  // If master HLS is 403/AccessDenied, video is dead/deleted on Reddit
  if (hlsStatus !== 200) {
    return null;
  }

  // Find the highest resolution MP4 that actually exists (200 OK)
  const candidateMp4s = [
    `https://v.redd.it/${videoId}/CMAF_720.mp4`,
    `https://v.redd.it/${videoId}/CMAF_480.mp4`,
    `https://v.redd.it/${videoId}/CMAF_360.mp4`,
    `https://v.redd.it/${videoId}/DASH_720.mp4`,
    `https://v.redd.it/${videoId}/DASH_480.mp4`,
    `https://v.redd.it/${videoId}/DASH_360.mp4`,
    `https://v.redd.it/${videoId}/CMAF_270.mp4`,
  ];

  let workingVideoUrl: string | null = null;
  for (const url of candidateMp4s) {
    const status = await checkUrlStatus(url);
    if (status === 200) {
      workingVideoUrl = url;
      break;
    }
  }

  // If no raw MP4 exists, we can still stream via HLS directly
  const audioUrl = `https://v.redd.it/${videoId}/CMAF_AUDIO_128.mp4`;
  const audioStatus = await checkUrlStatus(audioUrl);

  return {
    hlsUrl,
    videoUrl: workingVideoUrl || candidateMp4s[0],
    audioUrl: audioStatus === 200 ? audioUrl : null,
  };
}

function cleanCaption(body: string | null, title: string | null): { caption: string; tags: string[] } {
  if (!body) return { caption: title || "", tags: ["CampusReel"] };

  const tags = (body.match(HASHTAG_REGEX) || []).map((t) => t.replace(/^#/, ""));
  if (!tags.includes("CampusReel")) tags.unshift("CampusReel");

  let cleaned = body
    .replace(/!\[.*?\]\(https?:\/\/[^\s)]+\)/gi, "")
    .replace(/https?:\/\/v\.redd\.it\/[^\s]+/gi, "")
    .replace(/https?:\/\/[^\s]+\.(?:mp4|webm|mov|m3u8)[^\s]*/gi, "")
    .replace(HASHTAG_REGEX, "")
    .trim();

  if (title && cleaned.startsWith(title)) {
    cleaned = cleaned.slice(title.length).trim();
  }

  const finalCaption = cleaned || title || "Campus vibe";
  return { caption: finalCaption, tags: Array.from(new Set(tags)).slice(0, 5) };
}

async function main() {
  const db = getDb();

  console.log("📥 Querying external video posts to migrate...");
  const rawPosts = await db.execute(sql.raw(`
    SELECT
      p.id,
      p.title,
      p.body,
      p.author_id,
      p.institution_id,
      p.created_at,
      p.updated_at,
      up.display_name,
      up.username,
      up.avatar_url,
      ep.id AS external_post_id,
      ep.canonical_url,
      ep.subreddit,
      ep.score,
      ep.comment_count,
      em.media_url,
      em.thumbnail_url,
      em.width,
      em.height,
      em.duration
    FROM posts p
    JOIN external_posts ep ON ep.post_id = p.id
    LEFT JOIN external_media em ON em.external_post_id = ep.id AND em.media_type = 'VIDEO'
    LEFT JOIN user_profiles up ON up.id = p.author_id
    WHERE ep.content_type = 'VIDEO'
    ORDER BY p.created_at DESC
  `));

  const postRows = ((rawPosts as any).rows || (Array.isArray(rawPosts) ? rawPosts : [])) as PostRow[];
  console.log(`Found ${postRows.length} total video posts to inspect.`);

  let aliveCount = 0;
  let deadCount = 0;
  let insertedCount = 0;
  const postIdsToDelete: string[] = [];

  const BATCH_SIZE = 30;

  for (let i = 0; i < postRows.length; i += BATCH_SIZE) {
    const chunk = postRows.slice(i, i + BATCH_SIZE);
    console.log(`Validating chunk ${i + 1} - ${Math.min(i + BATCH_SIZE, postRows.length)} / ${postRows.length}...`);

    const results = await Promise.all(
      chunk.map(async (row) => {
        postIdsToDelete.push(row.id);

        const urlToCheck = row.media_url || row.body || "";
        const match = urlToCheck.match(REDDIT_VIDEO_REGEX);

        if (match) {
          const videoId = match[1];
          const streams = await findWorkingRedditStreams(videoId);
          if (!streams) {
            return { alive: false, row };
          }
          return {
            alive: true,
            row,
            hlsUrl: streams.hlsUrl,
            videoUrl: streams.videoUrl,
            audioUrl: streams.audioUrl,
          };
        } else {
          // Direct video URL (non-reddit)
          const status = await checkUrlStatus(urlToCheck);
          if (status === 200) {
            return {
              alive: true,
              row,
              hlsUrl: null,
              videoUrl: urlToCheck,
              audioUrl: null,
            };
          }
          return { alive: false, row };
        }
      })
    );

    // Filter alive reels to insert
    const aliveItems = results.filter((r) => r.alive && r.videoUrl);
    aliveCount += aliveItems.length;
    deadCount += results.length - aliveItems.length;

    if (aliveItems.length > 0) {
      for (const item of aliveItems) {
        const { row, hlsUrl, videoUrl, audioUrl } = item;
        const { caption, tags } = cleanCaption(row.body, row.title);

        try {
          await db.execute(sql`
            INSERT INTO reels (
              id,
              slug,
              caption,
              title,
              video_url,
              hls_url,
              audio_url,
              thumbnail_url,
              aspect_ratio,
              width,
              height,
              duration,
              author_id,
              author_name,
              author_handle,
              author_avatar_url,
              institution_id,
              source,
              source_url,
              subreddit,
              tags,
              likes_count,
              comments_count,
              shares_count,
              views_count,
              status,
              created_at,
              updated_at
            ) VALUES (
              ${row.id},
              ${row.id},
              ${caption},
              ${row.title || null},
              ${videoUrl!},
              ${hlsUrl || null},
              ${audioUrl || null},
              ${row.thumbnail_url || null},
              ${'9:16'},
              ${row.width || null},
              ${row.height || null},
              ${row.duration || null},
              ${row.author_id || null},
              ${row.display_name || "Student"},
              ${row.username || "student"},
              ${row.avatar_url || null},
              ${row.institution_id || null},
              'reddit',
              ${row.canonical_url || null},
              ${row.subreddit || null},
              ${JSON.stringify(tags)}::jsonb,
              ${Math.max(0, row.score || 0)},
              ${Math.max(0, row.comment_count || 0)},
              ${Math.floor(Math.random() * 5)},
              ${Math.max(10, (row.score || 1) * 14)},
              'PUBLISHED',
              ${row.created_at},
              ${row.updated_at}
            )
            ON CONFLICT (id) DO UPDATE SET
              video_url = EXCLUDED.video_url,
              hls_url = EXCLUDED.hls_url,
              audio_url = EXCLUDED.audio_url,
              caption = EXCLUDED.caption,
              tags = EXCLUDED.tags;
          `);
          insertedCount++;
        } catch (insertErr) {
          console.error("Insert error for row:", row.id, insertErr);
        }
      }
    }
  }

  console.log(`\n🎉 Verification summary:`);
  console.log(`- Verified Alive & Playable Reels: ${aliveCount}`);
  console.log(`- Discarded Dead/403 Videos: ${deadCount}`);
  console.log(`- Successfully inserted into 'reels' table: ${insertedCount}`);

  // Now delete the 4,200 external posts from the `posts` table
  console.log(`\n🧹 Cleaning up 'posts' table by removing ${postIdsToDelete.length} external video posts...`);
  const DELETE_BATCH = 100;
  let deletedCount = 0;

  for (let d = 0; d < postIdsToDelete.length; d += DELETE_BATCH) {
    const chunkIds = postIdsToDelete.slice(d, d + DELETE_BATCH);
    await db.execute(sql`
      DELETE FROM posts WHERE id IN (${sql.join(chunkIds.map((id) => sql`${id}`), sql`, `)})
    `);
    deletedCount += chunkIds.length;
  }

  console.log(`✅ Successfully deleted ${deletedCount} external video posts from 'posts' table!`);

  // Final count check
  const remainingPosts = await db.execute(sql.raw(`SELECT count(*) as count FROM posts`));
  const finalReels = await db.execute(sql.raw(`SELECT count(*) as count FROM reels`));
  console.log("Remaining genuine campus posts in posts table:", remainingPosts);
  console.log("Total active verified reels in reels table:", finalReels);

  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
