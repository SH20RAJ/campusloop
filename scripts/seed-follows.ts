/**
 * Seeds a realistic follow graph over the students already in the database.
 *
 * Edges are weighted rather than uniform: students are far more likely to
 * follow classmates from their own institution, and high-clout profiles pick
 * up more followers. A share of edges is then followed back to create mutual
 * "friend" pairs, and is_mutual is reconciled from the data at the end.
 *
 * Usage:
 *   bun run scripts/seed-follows.ts            # seed
 *   bun run scripts/seed-follows.ts --reset    # wipe all follows first
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("DB_URL is required");
  process.exit(1);
}

const sql = neon(dbUrl);

// Tuning knobs
const MIN_FOLLOWING = 3;
const MAX_FOLLOWING = 28;
const SAME_CAMPUS_BIAS = 0.7; // share of a student's follows that stay on campus
const FOLLOW_BACK_RATE = 0.55; // share of incoming follows reciprocated → friends

interface Student {
  id: string;
  username: string;
  institution_id: string;
  points: number;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Weighted pick without replacement; weight scales with clout. */
function pickWeighted(pool: Student[], count: number, exclude: Set<string>): Student[] {
  const candidates = pool.filter((s) => !exclude.has(s.id));
  const picked: Student[] = [];
  const weights = candidates.map((s) => 1 + Math.log1p(Math.max(s.points, 0)) * 2);
  let totalWeight = weights.reduce((a, b) => a + b, 0);
  const taken = new Set<number>();

  while (picked.length < count && taken.size < candidates.length && totalWeight > 0) {
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < candidates.length; i++) {
      if (taken.has(i)) continue;
      roll -= weights[i];
      if (roll <= 0) {
        taken.add(i);
        totalWeight -= weights[i];
        picked.push(candidates[i]);
        break;
      }
    }
  }
  return picked;
}

async function main() {
  const reset = process.argv.includes("--reset");

  const students = (await sql`
    SELECT id, username, institution_id, points
    FROM user_profiles
    WHERE status = 'ACTIVE' AND onboarding_completed = TRUE
  `) as unknown as Student[];

  console.log(`Fetched ${students.length} active students from the database.`);
  if (students.length < 2) {
    console.log("Not enough students to build a follow graph. Nothing to do.");
    return;
  }

  if (reset) {
    await sql`DELETE FROM follows`;
    console.log("Reset: cleared all existing follow edges.");
  }

  // Bucket by campus so most edges stay local
  const byCampus = new Map<string, Student[]>();
  for (const s of students) {
    const list = byCampus.get(s.institution_id) || [];
    list.push(s);
    byCampus.set(s.institution_id, list);
  }
  console.log(`Spread across ${byCampus.size} campuses.`);

  const edges = new Set<string>();
  const key = (a: string, b: string) => `${a}>${b}`;

  for (const student of students) {
    const target = randInt(MIN_FOLLOWING, Math.min(MAX_FOLLOWING, students.length - 1));
    const campusPeers = (byCampus.get(student.institution_id) || []).filter((s) => s.id !== student.id);

    const localCount = Math.min(Math.round(target * SAME_CAMPUS_BIAS), campusPeers.length);
    const globalCount = target - localCount;

    const exclude = new Set<string>([student.id]);
    for (const pick of pickWeighted(campusPeers, localCount, exclude)) {
      exclude.add(pick.id);
      edges.add(key(student.id, pick.id));
    }
    for (const pick of pickWeighted(students, globalCount, exclude)) {
      exclude.add(pick.id);
      edges.add(key(student.id, pick.id));
    }
  }

  // Reciprocate a share of edges so real friendships exist
  let reciprocated = 0;
  for (const edge of Array.from(edges)) {
    if (Math.random() > FOLLOW_BACK_RATE) continue;
    const [a, b] = edge.split(">");
    const back = key(b, a);
    if (!edges.has(back)) {
      edges.add(back);
      reciprocated++;
    }
  }
  console.log(`Built ${edges.size} edges (${reciprocated} follow-backs).`);

  // Insert in chunks; ON CONFLICT keeps re-runs idempotent
  const rows = Array.from(edges).map((e) => e.split(">") as [string, string]);
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    // Parameterized so ids are never interpolated into SQL text
    const values = chunk
      .map((_, idx) => `(gen_random_uuid(), $${idx * 2 + 1}, $${idx * 2 + 2})`)
      .join(",");
    const params = chunk.flat();
    const res = await sql.query(
      `INSERT INTO follows (id, follower_id, following_id) VALUES ${values}
       ON CONFLICT (follower_id, following_id) DO NOTHING
       RETURNING id`,
      params,
    );
    inserted += (res as unknown as unknown[]).length;
    console.log(`  inserted ${inserted}/${rows.length}...`);
  }

  // Reconcile the denormalized friend flag from the actual edges
  await sql`
    UPDATE follows f SET is_mutual = EXISTS (
      SELECT 1 FROM follows r
      WHERE r.follower_id = f.following_id AND r.following_id = f.follower_id
    )
  `;

  const [stats] = (await sql`
    SELECT
      count(*)::int AS edges,
      count(*) FILTER (WHERE is_mutual)::int AS mutual_edges,
      count(DISTINCT follower_id)::int AS students_following
    FROM follows
  `) as unknown as { edges: number; mutual_edges: number; students_following: number }[];

  console.log("\nSeed complete:");
  console.log(`  follow edges     : ${stats.edges}`);
  console.log(`  friendships      : ${stats.mutual_edges / 2} (${stats.mutual_edges} mutual edges)`);
  console.log(`  active followers : ${stats.students_following} students`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
