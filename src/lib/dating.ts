/**
 * Campus Match compatibility engine.
 *
 * Hinge-style weighted scoring: shared interests dominate, then campus
 * proximity, academic overlap, year proximity, profile quality, activity,
 * and a "liked you already" boost that quietly raises match probability.
 * A small deterministic jitter keeps decks from feeling identical without
 * making scores unstable between requests.
 */

export interface CompatibilityProfile {
  id: string;
  institutionId: string | null;
  interests?: string[] | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  bio?: string | null;
  avatarUrl?: string | null;
  photos?: string[] | null;
  points?: number | null;
  institution?: { state?: string | null } | null;
}

export interface CompatibilityResult {
  score: number;
  sharedInterests: string[];
}

const BASELINE = 35;
const MAX_SCORE = 99;

function normalizeInterest(raw: string): string {
  return raw.trim().toLowerCase();
}

export interface ScoredCandidate<T = CompatibilityProfile> {
  candidate: T;
  score: number;
  sharedInterests: string[];
  likedYou: boolean;
}

/** Stable small hash with optional session seed to prevent deck repetition */
function stableJitter(a: string, b: string, sessionSeed = 0, mod = 8): number {
  const s = `${a}:${b}:${sessionSeed}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
}

export function sharedInterestsBetween(me: CompatibilityProfile, cand: CompatibilityProfile): string[] {
  const mine = new Map((me.interests ?? []).map((i) => [normalizeInterest(i), i]));
  const shared: string[] = [];
  for (const candInterest of cand.interests ?? []) {
    if (mine.has(normalizeInterest(candInterest))) {
      shared.push(candInterest);
    }
  }
  return shared;
}

export function computeCompatibility(
  me: CompatibilityProfile,
  cand: CompatibilityProfile,
  opts: {
    likedMe?: boolean;
    vectorSimilarity?: number;
    sessionSeed?: number;
  } = {}
): CompatibilityResult {
  let score = BASELINE;

  // Shared interests: the strongest heuristic signal (+8 each, cap +24)
  const sharedInterests = sharedInterestsBetween(me, cand);
  score += Math.min(sharedInterests.length * 8, 24);

  // Semantic Vector Similarity from Qdrant dense embeddings (0..1 -> up to +25)
  if (typeof opts.vectorSimilarity === "number" && opts.vectorSimilarity > 0) {
    score += Math.min(Math.round(opts.vectorSimilarity * 25), 25);
  }

  // Campus proximity (+15 for same college, +8 for same state)
  if (me.institutionId && cand.institutionId && me.institutionId === cand.institutionId) {
    score += 15;
  } else if (
    me.institution?.state &&
    cand.institution?.state &&
    me.institution.state === cand.institution.state
  ) {
    score += 8;
  }

  // Academic overlap (+5 course, +4 branch)
  if (me.course && cand.course && me.course.trim().toLowerCase() === cand.course.trim().toLowerCase()) {
    score += 5;
  }
  if (me.branch && cand.branch && me.branch.trim().toLowerCase() === cand.branch.trim().toLowerCase()) {
    score += 4;
  }

  // Year proximity
  if (me.year && cand.year) {
    const diff = Math.abs(me.year - cand.year);
    if (diff === 0) score += 6;
    else if (diff === 1) score += 3;
  }

  // Profile quality & effort
  const photoCount = cand.photos?.length ?? 0;
  if (photoCount >= 2) score += 4;
  if (cand.bio && cand.bio.trim().length > 10) score += 3;
  if (cand.avatarUrl) score += 2;

  // Platform clout activity
  if ((cand.points ?? 0) > 100) score += 3;

  // Reciprocal match opportunity: They already liked you -> immediate match
  if (opts.likedMe) score += 18;

  // Session-seeded jitter prevents static deck order across visits
  score += stableJitter(me.id, cand.id, opts.sessionSeed ?? 0);

  return {
    score: Math.max(BASELINE, Math.min(MAX_SCORE, score)),
    sharedInterests,
  };
}

/**
 * Two-Sided Multi-Armed Bandit Matching:
 * Partitions candidates into Reciprocal Likes, High Compatibility, and
 * Fresh Exploration tiers, interleaving them so users never see the exact same people.
 */
export function rankDatingCandidates<T extends CompatibilityProfile>(
  me: CompatibilityProfile,
  candidates: T[],
  opts: {
    likedMeIds: Set<string>;
    vectorScoreMap?: Map<string, number>;
    sessionSeed?: number;
    sort?: string;
    limit?: number;
  }
): ScoredCandidate<T>[] {
  const scored = candidates.map((cand) => {
    const isLiked = opts.likedMeIds.has(cand.id);
    const vectorSim = opts.vectorScoreMap?.get(cand.id);
    const { score, sharedInterests } = computeCompatibility(me, cand, {
      likedMe: isLiked,
      vectorSimilarity: vectorSim,
      sessionSeed: opts.sessionSeed,
    });
    return {
      candidate: cand,
      score,
      sharedInterests,
      likedYou: isLiked,
    };
  });

  if (opts.sort === "RECENT") {
    return scored
      .sort((a, b) => (b.candidate as any).createdAt - (a.candidate as any).createdAt)
      .slice(0, opts.limit ?? 25);
  }

  if (opts.sort === "POPULAR") {
    return scored
      .sort((a, b) => (b.candidate.points || 0) - (a.candidate.points || 0))
      .slice(0, opts.limit ?? 25);
  }

  // 1. Separate into Reciprocal Likes, High Affinity, and Exploration
  const reciprocalList: ScoredCandidate<T>[] = [];
  const standardList: ScoredCandidate<T>[] = [];

  for (const item of scored) {
    if (item.likedYou) {
      reciprocalList.push(item);
    } else {
      standardList.push(item);
    }
  }

  // Sort standard candidates by compatibility score
  standardList.sort((a, b) => b.score - a.score);

  // Split standard list into Top Affinity (65%) and Fresh Exploratory (35%)
  const topCutoff = Math.ceil(standardList.length * 0.65);
  const topTier = standardList.slice(0, topCutoff);
  const exploreTier = standardList.slice(topCutoff);

  // Shuffle explore tier with session seed for continuous discovery
  const seed = opts.sessionSeed ?? 1;
  exploreTier.sort((a, b) => {
    const hashA = stableJitter(me.id, a.candidate.id, seed, 100);
    const hashB = stableJitter(me.id, b.candidate.id, seed, 100);
    return hashA - hashB;
  });

  // Interleave: Reciprocal first, then 2 Top -> 1 Explore -> 2 Top -> 1 Explore
  const finalDeck: ScoredCandidate<T>[] = [...reciprocalList];
  let topIdx = 0;
  let exploreIdx = 0;

  while (topIdx < topTier.length || exploreIdx < exploreTier.length) {
    if (topIdx < topTier.length) finalDeck.push(topTier[topIdx++]);
    if (topIdx < topTier.length) finalDeck.push(topTier[topIdx++]);
    if (exploreIdx < exploreTier.length) finalDeck.push(exploreTier[exploreIdx++]);
  }

  return finalDeck.slice(0, opts.limit ?? 25);
}

/**
 * Resolve the effective "show me" gender.
 * With no explicit choice, straight-default like every major dating app:
 * male → women, female → men, other/unset → everyone. An explicit choice
 * always wins.
 */
export function resolveGenderPreference(
  myGender: string | null | undefined,
  requested: string | null | undefined
): "MALE" | "FEMALE" | "ALL" {
  if (requested === "MALE" || requested === "FEMALE" || requested === "ALL") {
    return requested;
  }
  if (myGender === "MALE") return "FEMALE";
  if (myGender === "FEMALE") return "MALE";
  return "ALL";
}
