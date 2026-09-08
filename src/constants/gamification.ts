export type CloutTier = {
  tierName: string;
  level: number;
  minPoints: number;
  maxPoints: number;
  badgeColor: string;
  hasBlueTick: boolean;
  iconName: "Medal" | "Award" | "Star" | "Crown" | "Flame";
  iconSymbol?: string;
  perks: string[];
};

export const LP_ACTION_REWARDS = {
  // Engagement & Content
  CREATE_POST: 5,
  CREATE_POLL: 8,
  CREATE_CONFESSION: 4,
  REPOST: 4,
  CREATE_COMMENT: 3,
  RECEIVE_UPVOTE: 3,
  GIVE_UPVOTE: 1,
  RECEIVE_COMMENT: 2,

  // Stories & Vibes
  CREATE_STORY: 5,
  STORY_LIKE_RECEIVED: 1,

  // Academic Study Vault
  UPLOAD_ACADEMIC_NOTE: 30,
  CREATE_STUDY_PLAYLIST: 20,
  ACADEMIC_NOTE_DOWNLOADED: 5, // Rewarded to uploader when peer downloads
  ACADEMIC_VOTE_RECEIVED: 2,

  // Longform Articles
  PUBLISH_ARTICLE: 25,
  ARTICLE_UPVOTE_RECEIVED: 2,

  // Growth & Streaks
  ONBOARDING_COMPLETED: 25,
  PROFILE_COMPLETION: 15,
  DAILY_LOGIN_STREAK: 5,
  STREAK_7_DAY_BONUS: 25,
  STREAK_30_DAY_BONUS: 100,
  REFERRAL_SIGNUP: 50,
  CAMPUS_AMBASSADOR_MILESTONE: 100,
} as const;

export type LpActionType = keyof typeof LP_ACTION_REWARDS;

/**
 * Abuse Protection & Daily Earning Caps
 * Ensures fair clout progression, prevents bot farming, and stops rapid script manipulation.
 */
export const LP_ABUSE_PROTECTION = {
  // Maximum points a user can earn per action category in a single 24-hour UTC window
  DAILY_CAPS: {
    GIVE_UPVOTE: 15, // max 15 points/day from voting
    CREATE_COMMENT: 30, // max 30 points/day from commenting
    CREATE_POST: 25, // max 25 points/day from posts
    CREATE_STORY: 20, // max 20 points/day from stories
    REPOST: 16, // max 16 points/day from reposts
    DAILY_TOTAL_MAX: 300, // global hard cap per user per day
  },
  // Anti-abuse timing
  MIN_COOLDOWN_SECONDS: 8, // cooldown between repeated identical micro-actions
  MAX_ACTIONS_PER_MINUTE: 12, // velocity limiter
  SELF_REWARD_ALLOWED: false, // strictly forbidden to reward self-votes or self-downloads
} as const;

export const VERIFIED_LP_THRESHOLD = 150; // 150 LP unlocks Gold Star verified student badge

export const CLOUT_TIERS: CloutTier[] = [
  {
    tierName: "Bronze Rookie",
    level: 1,
    minPoints: 0,
    maxPoints: 49,
    badgeColor: "text-amber-700 bg-amber-700/10 border-amber-700/20",
    hasBlueTick: false,
    iconName: "Medal",
    perks: ["Access to campus feed", "Join college sub-hubs", "Up to 5 secret crush slots"],
  },
  {
    tierName: "Silver Starter",
    level: 2,
    minPoints: 50,
    maxPoints: 149,
    badgeColor: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    hasBlueTick: false,
    iconName: "Award",
    perks: ["Create polls & open discussions", "Share 24h campus stories", "Upload up to 10 study notes"],
  },
  {
    tierName: "Gold Star",
    level: 3,
    minPoints: 150,
    maxPoints: 499,
    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    hasBlueTick: true,
    iconName: "Star",
    perks: [
      "Verified Student Shield badge",
      "Expand Secret Crush slots to 50",
      "Publish full-length campus articles",
      "Direct Study Playlist curator badge",
    ],
  },
  {
    tierName: "Crown Legend",
    level: 4,
    minPoints: 500,
    maxPoints: 999,
    badgeColor: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    hasBlueTick: true,
    iconName: "Crown",
    perks: [
      "Priority feed algorithmic boosting",
      "Custom profile aesthetic themes",
      "Campus Community moderator eligibility",
      "Exclusive Beta feature testing",
    ],
  },
  {
    tierName: "Conqueror Icon",
    level: 5,
    minPoints: 1000,
    maxPoints: 999999,
    badgeColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    hasBlueTick: true,
    iconName: "Flame",
    perks: [
      "Hall of Fame campus spotlight",
      "CampusLoop verified ambassador badge",
      "Unlimited note uploads & verified badges",
      "Direct voice in platform feature voting",
    ],
  },
];

export function getCloutTier(points: number = 0): CloutTier {
  for (let i = CLOUT_TIERS.length - 1; i >= 0; i--) {
    if (points >= CLOUT_TIERS[i].minPoints) {
      return CLOUT_TIERS[i];
    }
  }
  return CLOUT_TIERS[0];
}

export function isAutoVerified(points: number = 0): boolean {
  return points >= VERIFIED_LP_THRESHOLD;
}

export const SECRET_CRUSH_BASE_SLOTS = 5;
export const SECRET_CRUSH_MAX_SLOTS = 50;
export const SECRET_CRUSH_EXPANSION_LP_THRESHOLD = 150; // Unlocked at Gold Star (150 LP)

export function getSecretCrushSlotLimit(points: number = 0): number {
  return points >= SECRET_CRUSH_EXPANSION_LP_THRESHOLD ? SECRET_CRUSH_MAX_SLOTS : SECRET_CRUSH_BASE_SLOTS;
}

export interface SecretCrushSlotProgress {
  isExpanded: boolean;
  maxSlots: number;
  points: number;
  threshold: number;
  pointsNeeded: number;
  progressPercent: number;
}

export function getSecretCrushSlotProgress(points: number = 0): SecretCrushSlotProgress {
  const isExpanded = points >= SECRET_CRUSH_EXPANSION_LP_THRESHOLD;
  const maxSlots = isExpanded ? SECRET_CRUSH_MAX_SLOTS : SECRET_CRUSH_BASE_SLOTS;
  const pointsNeeded = Math.max(0, SECRET_CRUSH_EXPANSION_LP_THRESHOLD - points);
  const progressPercent = Math.min(100, Math.round((points / SECRET_CRUSH_EXPANSION_LP_THRESHOLD) * 100));

  return {
    isExpanded,
    maxSlots,
    points,
    threshold: SECRET_CRUSH_EXPANSION_LP_THRESHOLD,
    pointsNeeded,
    progressPercent,
  };
}
