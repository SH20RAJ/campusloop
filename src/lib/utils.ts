import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(avatarUrl?: string | null, username?: string | null): string {
  if (avatarUrl && avatarUrl.trim().length > 0) return avatarUrl;
  const seed = username || "student";
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
