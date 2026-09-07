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

/**
 * Normalizes college / institution names to clean campus hub tags (e.g. "BIT Mesra", "IIT Bombay")
 */
export function getCollegeShortName(inst?: { name?: string | null } | null): string {
  if (!inst?.name) return "";
  let name = inst.name.trim();
  name = name.replace(/Birla Institute of Technology/gi, "BIT");
  name = name.replace(/Indian Institute of Technology/gi, "IIT");
  name = name.replace(/National Institute of Technology/gi, "NIT");
  const parts = name.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1 && (parts[0] === "BIT" || parts[0] === "IIT" || parts[0] === "NIT")) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0] || name;
}

/**
 * Formats image post timestamps as "27 August 2026, 12:17" for clean photo overlays
 */
export function formatImagePostDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}
