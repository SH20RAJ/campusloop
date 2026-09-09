/**
 * Academic Guest Download Limiter
 *
 * Allows unauthenticated guests up to 5 free notes/PYQ downloads.
 * Once exceeded (download > 5), prompts the student to sign in or create an account
 * for unlimited downloads, verified solutions, and offline vault sync.
 * Authenticated students enjoy unlimited downloads with zero restrictions.
 */

export const GUEST_DOWNLOAD_LIMIT = 5;
const GUEST_DOWNLOAD_KEY = "campusloop_guest_academic_downloads";

export function getGuestDownloadCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GUEST_DOWNLOAD_KEY);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

export interface GuestDownloadStatus {
  allowed: boolean;
  count: number;
  remaining: number;
  isLimitReached: boolean;
}

export function checkAndRecordDownload(isAuthenticated: boolean): GuestDownloadStatus {
  if (isAuthenticated) {
    return {
      allowed: true,
      count: 0,
      remaining: Infinity,
      isLimitReached: false,
    };
  }

  const currentCount = getGuestDownloadCount();

  // If already at or over limit (5 downloads), block further downloads and prompt sign-in
  if (currentCount >= GUEST_DOWNLOAD_LIMIT) {
    return {
      allowed: false,
      count: currentCount,
      remaining: 0,
      isLimitReached: true,
    };
  }

  // Increment download count for guest
  const newCount = currentCount + 1;
  try {
    localStorage.setItem(GUEST_DOWNLOAD_KEY, String(newCount));
  } catch {}

  const remaining = Math.max(0, GUEST_DOWNLOAD_LIMIT - newCount);

  return {
    allowed: true,
    count: newCount,
    remaining,
    isLimitReached: false,
  };
}
