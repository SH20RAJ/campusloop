import { resolveFeedPage, formatApiFeedPosts } from "../src/lib/feed";
import { posts, externalPosts } from "../src/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { applyReelDiversityFilter } from "../src/lib/reels/algorithm";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

async function test() {
  const videoCondition = sql`(${posts.body} ILIKE '%.mp4%' OR ${posts.body} ILIKE '%.webm%' OR ${posts.body} ILIKE '%.mov%' OR ${posts.body} ILIKE '%/api/files/r2/videos/%' OR EXISTS (SELECT 1 FROM external_media em JOIN external_posts ep ON em.external_post_id = ep.id WHERE ep.post_id = ${posts.id} AND em.media_type = 'VIDEO'))`;

  const conditions = [
    eq(posts.status, "PUBLISHED"),
    or(
      eq(posts.isSeeded, false),
      sql`EXISTS (SELECT 1 FROM ${externalPosts} WHERE ${externalPosts.postId} = ${posts.id})`
    )!,
    videoCondition,
  ];

  console.log("Resolving page 1 with sort=reels, limit=10...");
  const rawPage1 = await resolveFeedPage({
    conditions,
    sort: "reels",
    limit: 10,
    offset: 0,
    userInstitutionId: null,
    seenIds: [],
    viewerProfileId: null,
  });
  const page1 = applyReelDiversityFilter(await formatApiFeedPosts(rawPage1, null));
  const page1Ids = new Set(page1.map((r) => r.id));
  console.log(`Page 1 returned ${page1.length} reels.`);

  console.log("Resolving page 2 with seenIds from page 1...");
  const page2Conditions = [
    ...conditions,
    sql`${posts.id} NOT IN (${sql.join(Array.from(page1Ids).map((id) => sql`${id}`), sql`, `)})`,
  ];
  const rawPage2 = await resolveFeedPage({
    conditions: page2Conditions,
    sort: "reels",
    limit: 10,
    offset: 0,
    userInstitutionId: null,
    seenIds: Array.from(page1Ids),
    viewerProfileId: null,
  });
  const page2 = applyReelDiversityFilter(await formatApiFeedPosts(rawPage2, null));
  console.log(`Page 2 returned ${page2.length} reels.`);

  const duplicates = page2.filter((r) => page1Ids.has(r.id));
  console.log(`Duplicates between Page 1 and Page 2: ${duplicates.length}`);
  if (duplicates.length === 0) {
    console.log("✓ SUCCESS: ZERO repeated reels between sessions/pages!");
  } else {
    console.error("❌ FAILED: Found repeated reels:", duplicates.map((d) => d.id));
  }
}

test()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
  });
