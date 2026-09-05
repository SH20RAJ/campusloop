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

/**
 * Strips raw markdown formatting, image tags, image URLs, code blocks,
 * and excessive whitespace from text to produce clean, safe plaintext.
 */
export function stripMarkdown(text?: string | null): string {
  if (!text) return "";
  return text
    // 1. Remove markdown images: ![alt](url) or ![alt][ref]
    .replace(/!\[.*?\](?:\(.*?\)|\[.*?\])/g, "")
    // 2. Remove HTML tags: <img ... />, <div>, etc.
    .replace(/<[^>]*>/g, "")
    // 3. Remove standalone image URLs (e.g. https://.../image.jpg)
    .replace(/https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp|svg|bmp)(?:\?[^\s)]*)?/gi, "")
    // 4. Remove fenced code blocks: ```...``` and inline code `...`
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // 5. Convert markdown links: [label](url) -> label
    .replace(/\[(.*?)\]\([^\)]*\)/g, "$1")
    // 6. Remove headings, blockquotes, horizontal rules
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^(?:[-*_]\s*){3,}$/gm, "")
    // 7. Remove bold, italic, strikethrough: **bold**, *italic*, ~~strike~~
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    // 8. Remove list bullets and ordered numbers: - item, 1. item
    .replace(/^[\s*+-]+\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    // 9. Normalize multiple newlines and spaces into single space
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns a clean, single-line plaintext snippet truncated to maxLength with ellipsis
 */
export function cleanSnippet(text?: string | null, maxLength = 80): string {
  const cleaned = stripMarkdown(text);
  if (!cleaned) return "";
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "...";
}
