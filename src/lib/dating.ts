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

/** Stable small hash → 0..(mod-1). Same pair always jitters the same way. */
function stableJitter(a: string, b: string, mod = 5): number {
  const s = `${a}:${b}`;
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
  opts: { likedMe?: boolean } = {},
): CompatibilityResult {
  let score = BASELINE;

  // Shared interests: the strongest signal (+10 each, cap +30)
  const sharedInterests = sharedInterestsBetween(me, cand);
  score += Math.min(sharedInterests.length * 10, 30);

  // Campus proximity
  if (me.institutionId && cand.institutionId && me.institutionId === cand.institutionId) {
    score += 15;
  } else if (
    me.institution?.state &&
    cand.institution?.state &&
    me.institution.state === cand.institution.state
  ) {
    score += 8;
  }

  // Academic overlap
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

  // Profile quality — reward effort, starve empty profiles
  const photoCount = cand.photos?.length ?? 0;
  if (photoCount >= 2) score += 4;
  if (cand.bio && cand.bio.trim().length > 10) score += 3;
  if (cand.avatarUrl) score += 2;

  // Activity on the platform
  if ((cand.points ?? 0) > 100) score += 3;

  // They already liked you → matching is one tap away
  if (opts.likedMe) score += 8;

  score += stableJitter(me.id, cand.id);

  return {
    score: Math.max(BASELINE, Math.min(MAX_SCORE, score)),
    sharedInterests,
  };
}

/**
 * Resolve the effective "show me" gender.
 * With no explicit choice, straight-default like every major dating app:
 * male → women, female → men, other/unset → everyone. An explicit choice
 * always wins.
 */
export function resolveGenderPreference(
  myGender: string | null | undefined,
  requested: string | null | undefined,
): "MALE" | "FEMALE" | "ALL" {
  if (requested === "MALE" || requested === "FEMALE" || requested === "ALL") {
    return requested;
  }
  if (myGender === "MALE") return "FEMALE";
  if (myGender === "FEMALE") return "MALE";
  return "ALL";
}
