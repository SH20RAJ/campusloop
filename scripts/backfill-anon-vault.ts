import { getDb } from "../src/db";
import { anonIdentityVault, comments, posts } from "../src/db/schema";
import { deriveAnonHandle, sealIdentity } from "../src/lib/anonymity";
import { and, eq, isNotNull } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function backfill() {
  const db = getDb();
  let migratedPosts = 0;
  let migratedComments = 0;

  const anonPosts = await db
    .select({ id: posts.id, authorId: posts.authorId })
    .from(posts)
    .where(and(eq(posts.isAnonymous, true), isNotNull(posts.authorId)));

  for (const post of anonPosts) {
    if (!post.authorId) continue;
    const handle = deriveAnonHandle(post.authorId);
    await db.insert(anonIdentityVault).values({ handle, sealedIdentity: sealIdentity(post.authorId) }).onConflictDoNothing();
    await db.update(posts).set({ pseudonym: handle, authorId: null }).where(eq(posts.id, post.id));
    migratedPosts++;
  }

  const anonComments = await db
    .select({ id: comments.id, authorId: comments.authorId })
    .from(comments)
    .where(and(eq(comments.isAnonymous, true), isNotNull(comments.authorId)));

  for (const comment of anonComments) {
    if (!comment.authorId) continue;
    const handle = deriveAnonHandle(comment.authorId);
    await db.insert(anonIdentityVault).values({ handle, sealedIdentity: sealIdentity(comment.authorId) }).onConflictDoNothing();
    await db.update(comments).set({ pseudonym: handle, authorId: null }).where(eq(comments.id, comment.id));
    migratedComments++;
  }

  console.log(`Backfill complete: ${migratedPosts} posts, ${migratedComments} comments sealed into the vault.`);
}

backfill()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
