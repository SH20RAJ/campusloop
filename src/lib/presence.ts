/**
 * Presence helpers shared by server and client.
 *
 * Deliberately free of database imports: this module is pulled into client
 * bundles (chat rows, the heartbeat hook), and importing the schema here
 * drags `node:crypto` into the browser build. Server-only writes live in
 * presence-server.ts.
 */

/** A student counts as online while their heartbeat is younger than this. */
export const ONLINE_WINDOW_MS = 2 * 60 * 1000;
/** Client heartbeat interval; the write is skipped if a fresher one exists. */
export const HEARTBEAT_INTERVAL_MS = 60 * 1000;
/** Don't write more often than this per user, however chatty the client is. */
export const WRITE_THROTTLE_SECONDS = 45;

export function isOnline(lastSeenAt?: Date | string | null): boolean {
  if (!lastSeenAt) return false;
  const seen = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seen)) return false;
  return Date.now() - seen < ONLINE_WINDOW_MS;
}

/**
 * Human presence label: "Online", "Active 5m ago", "Active yesterday", or
 * null when the student has never been seen (nothing to claim).
 */
export function presenceLabel(lastSeenAt?: Date | string | null): string | null {
  if (!lastSeenAt) return null;
  const seen = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seen)) return null;

  const diff = Date.now() - seen;
  if (diff < ONLINE_WINDOW_MS) return "Online";

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Active ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Active yesterday";
  if (days < 7) return `Active ${days}d ago`;
  return "Active a while ago";
}
