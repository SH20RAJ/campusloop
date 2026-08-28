export type CloutTier = {
  tierName: string;
  level: number;
  minPoints: number;
  maxPoints: number;
  badgeColor: string;
  hasBlueTick: boolean;
  iconSymbol: string;
};

export const LP_ACTION_REWARDS = {
  CREATE_POST: 5,
  RECEIVE_UPVOTE: 2,
  GIVE_UPVOTE: 1,
  CREATE_COMMENT: 2,
  RECEIVE_COMMENT: 1,
  REPOST: 3,
  CREATE_STORY: 4,
  REFERRAL_SIGNUP: 50,
  ONBOARDING_COMPLETED: 20,
} as const;

export const VERIFIED_LP_THRESHOLD = 150;

export const CLOUT_TIERS: CloutTier[] = [
  {
    tierName: "Bronze Rookie",
    level: 1,
    minPoints: 0,
    maxPoints: 49,
    badgeColor: "text-amber-700 bg-amber-700/10 border-amber-700/20",
    hasBlueTick: false,
    iconSymbol: "🥉",
  },
  {
    tierName: "Silver Starter",
    level: 2,
    minPoints: 50,
    maxPoints: 149,
    badgeColor: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    hasBlueTick: false,
    iconSymbol: "🥈",
  },
  {
    tierName: "Gold Star",
    level: 3,
    minPoints: 150,
    maxPoints: 499,
    badgeColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    hasBlueTick: true,
    iconSymbol: "🥇",
  },
  {
    tierName: "Crown Legend",
    level: 4,
    minPoints: 500,
    maxPoints: 999,
    badgeColor: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    hasBlueTick: true,
    iconSymbol: "👑",
  },
  {
    tierName: "Conqueror Icon",
    level: 5,
    minPoints: 1000,
    maxPoints: 999999,
    badgeColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    hasBlueTick: true,
    iconSymbol: "🔥",
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
  return points >= SECRET_CRUSH_EXPANSION_LP_THRESHOLD
    ? SECRET_CRUSH_MAX_SLOTS
    : SECRET_CRUSH_BASE_SLOTS;
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
