import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(
  avatarUrl?: string | null,
  username?: string | null,
  displayName?: string | null
): string {
  if (avatarUrl && avatarUrl.trim().length > 0) return avatarUrl;
  const seed = (displayName || username || "Student").trim();
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0284c7,2563eb,7c3aed,db2777,ea580c,059669,4f46e5&textColor=ffffff&fontWeight=800&fontSize=42`;
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
