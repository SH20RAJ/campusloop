import { getDb } from "../src/db";
import { userProfiles } from "../src/db/schema";
import { getDatingCandidatePhotoSet } from "../src/constants/dating-photos";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  const allProfiles = await db.query.userProfiles.findMany();
  console.log(`Found ${allProfiles.length} user profiles. Updating photos with curated Unsplash portraits...`);

  const BATCH_SIZE = 40;
  for (let i = 0; i < allProfiles.length; i += BATCH_SIZE) {
    const batch = allProfiles.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((prof) => {
        const photoSet = getDatingCandidatePhotoSet(prof.gender, prof.id || prof.username);
        return db
          .update(userProfiles)
          .set({
            avatarUrl: photoSet.avatar,
            photos: photoSet.photos,
          })
          .where(eq(userProfiles.id, prof.id));
      })
    );
    console.log(`Updated ${Math.min(i + BATCH_SIZE, allProfiles.length)} / ${allProfiles.length} profiles...`);
  }

  console.log(`Successfully updated all profiles in database with Unsplash portraits!`);
}

main().catch(console.error);
