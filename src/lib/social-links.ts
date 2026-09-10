/**
 * Central catalogue for student social / coding / creative / professional links.
 *
 * Students type either a bare username ("torvalds") or a full URL — the
 * helpers below normalize to a canonical outbound URL. No brand SVGs are
 * bundled; display uses monogram tiles in brand colors (see
 * components/profile/profile-social-links.tsx).
 */

export type SocialLinkCategory = "Coding" | "Social" | "Creative" | "Professional";

export type SocialLinkKind = "username" | "url" | "handle-or-url";

export interface SocialPlatform {
  key: string;
  label: string;
  category: SocialLinkCategory;
  /** 1–2 letter monogram rendered on the display tile. */
  monogram: string;
  /** Brand color used as tile tint. */
  color: string;
  kind: SocialLinkKind;
  /** Base URL prepended to bare usernames. `{u}` is the username slot. */
  baseUrl?: string;
  placeholder: string;
  hint: string;
}

export const SOCIAL_LINK_CATEGORIES: SocialLinkCategory[] = ["Coding", "Social", "Creative", "Professional"];

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  // ─── Coding ───
  {
    key: "github",
    label: "GitHub",
    category: "Coding",
    monogram: "GH",
    color: "#8b949e",
    kind: "username",
    baseUrl: "https://github.com/{u}",
    placeholder: "octocat",
    hint: "Username",
  },
  {
    key: "leetcode",
    label: "LeetCode",
    category: "Coding",
    monogram: "LC",
    color: "#ffa116",
    kind: "username",
    baseUrl: "https://leetcode.com/u/{u}",
    placeholder: "neal_wu",
    hint: "Username",
  },
  {
    key: "codeforces",
    label: "Codeforces",
    category: "Coding",
    monogram: "CF",
    color: "#3182ce",
    kind: "username",
    baseUrl: "https://codeforces.com/profile/{u}",
    placeholder: "tourist",
    hint: "Handle",
  },
  {
    key: "codechef",
    label: "CodeChef",
    category: "Coding",
    monogram: "CC",
    color: "#8a5a2b",
    kind: "username",
    baseUrl: "https://www.codechef.com/users/{u}",
    placeholder: "gennady",
    hint: "Username",
  },
  {
    key: "hackerrank",
    label: "HackerRank",
    category: "Coding",
    monogram: "HR",
    color: "#2ec866",
    kind: "username",
    baseUrl: "https://www.hackerrank.com/profile/{u}",
    placeholder: "john_doe",
    hint: "Username",
  },
  {
    key: "gfg",
    label: "GeeksforGeeks",
    category: "Coding",
    monogram: "GfG",
    color: "#2f8d46",
    kind: "username",
    baseUrl: "https://www.geeksforgeeks.org/user/{u}",
    placeholder: "your_handle",
    hint: "Username",
  },
  {
    key: "kaggle",
    label: "Kaggle",
    category: "Coding",
    monogram: "K",
    color: "#20beff",
    kind: "username",
    baseUrl: "https://www.kaggle.com/{u}",
    placeholder: "titanic_fan",
    hint: "Username",
  },
  {
    key: "stackoverflow",
    label: "Stack Overflow",
    category: "Coding",
    monogram: "SO",
    color: "#f48024",
    kind: "url",
    placeholder: "https://stackoverflow.com/users/12345/name",
    hint: "Profile URL",
  },
  // ─── Social ───
  {
    key: "instagram",
    label: "Instagram",
    category: "Social",
    monogram: "IG",
    color: "#e1306c",
    kind: "username",
    baseUrl: "https://instagram.com/{u}",
    placeholder: "your.handle",
    hint: "Username",
  },
  {
    key: "x",
    label: "X (Twitter)",
    category: "Social",
    monogram: "X",
    color: "#e7e9ea",
    kind: "username",
    baseUrl: "https://x.com/{u}",
    placeholder: "username",
    hint: "Username",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    category: "Social",
    monogram: "in",
    color: "#0a66c2",
    kind: "handle-or-url",
    baseUrl: "https://www.linkedin.com/in/{u}",
    placeholder: "in/your-name or full URL",
    hint: "Handle or URL",
  },
  {
    key: "snapchat",
    label: "Snapchat",
    category: "Social",
    monogram: "SC",
    color: "#f7f400",
    kind: "username",
    baseUrl: "https://www.snapchat.com/add/{u}",
    placeholder: "username",
    hint: "Username",
  },
  {
    key: "telegram",
    label: "Telegram",
    category: "Social",
    monogram: "TG",
    color: "#229ed9",
    kind: "username",
    baseUrl: "https://t.me/{u}",
    placeholder: "username",
    hint: "Username",
  },
  {
    key: "discord",
    label: "Discord",
    category: "Social",
    monogram: "DC",
    color: "#5865f2",
    kind: "username",
    placeholder: "username",
    hint: "Username (shown as text)",
  },
  {
    key: "reddit",
    label: "Reddit",
    category: "Social",
    monogram: "Re",
    color: "#ff4500",
    kind: "username",
    baseUrl: "https://www.reddit.com/user/{u}",
    placeholder: "spez",
    hint: "Username",
  },
  {
    key: "pinterest",
    label: "Pinterest",
    category: "Social",
    monogram: "P",
    color: "#e60023",
    kind: "username",
    baseUrl: "https://www.pinterest.com/{u}",
    placeholder: "username",
    hint: "Username",
  },
  {
    key: "threads",
    label: "Threads",
    category: "Social",
    monogram: "Th",
    color: "#e7e9ea",
    kind: "username",
    baseUrl: "https://www.threads.com/@{u}",
    placeholder: "username",
    hint: "Username",
  },
  {
    key: "facebook",
    label: "Facebook",
    category: "Social",
    monogram: "f",
    color: "#1877f2",
    kind: "username",
    baseUrl: "https://facebook.com/{u}",
    placeholder: "username",
    hint: "Username",
  },
  // ─── Creative ───
  {
    key: "youtube",
    label: "YouTube",
    category: "Creative",
    monogram: "YT",
    color: "#ff0000",
    kind: "handle-or-url",
    baseUrl: "https://www.youtube.com/@{u}",
    placeholder: "@channel or full URL",
    hint: "@handle or URL",
  },
  {
    key: "behance",
    label: "Behance",
    category: "Creative",
    monogram: "Bē",
    color: "#1769ff",
    kind: "username",
    baseUrl: "https://www.behance.net/{u}",
    placeholder: "username",
    hint: "Username",
  },
  {
    key: "dribbble",
    label: "Dribbble",
    category: "Creative",
    monogram: "Dr",
    color: "#ea4c89",
    kind: "username",
    baseUrl: "https://dribbble.com/{u}",
    placeholder: "username",
    hint: "Username",
  },
  {
    key: "medium",
    label: "Medium",
    category: "Creative",
    monogram: "M",
    color: "#e7e9ea",
    kind: "handle-or-url",
    baseUrl: "https://medium.com/@{u}",
    placeholder: "@username or full URL",
    hint: "@handle or URL",
  },
  {
    key: "spotify",
    label: "Spotify",
    category: "Creative",
    monogram: "Sp",
    color: "#1db954",
    kind: "url",
    placeholder: "https://open.spotify.com/user/...",
    hint: "Profile URL",
  },
  // ─── Professional ───
  {
    key: "portfolio",
    label: "Portfolio",
    category: "Professional",
    monogram: "Pf",
    color: "#a170ff",
    kind: "url",
    placeholder: "https://yourname.dev",
    hint: "Full URL",
  },
  {
    key: "website",
    label: "Website",
    category: "Professional",
    monogram: "W",
    color: "#38bdf8",
    kind: "url",
    placeholder: "https://your-site.com",
    hint: "Full URL",
  },
  {
    key: "blog",
    label: "Blog",
    category: "Professional",
    monogram: "Bl",
    color: "#fb923c",
    kind: "url",
    placeholder: "https://blog.yoursite.com",
    hint: "Full URL",
  },
  {
    key: "resume",
    label: "Résumé / CV",
    category: "Professional",
    monogram: "CV",
    color: "#34d399",
    kind: "url",
    placeholder: "https://drive.google.com/... (public link)",
    hint: "Public link",
  },
];

export const PLATFORM_MAP: Record<string, SocialPlatform> = Object.fromEntries(
  SOCIAL_PLATFORMS.map((p) => [p.key, p])
);

export interface CustomLink {
  label: string;
  url: string;
}

export interface SocialLinks {
  platforms: Record<string, string>;
  custom: CustomLink[];
}

export const MAX_CUSTOM_LINKS = 4;
const USERNAME_RE = /^[a-zA-Z0-9._-]{1,60}$/;

function looksLikeUrl(value: string): boolean {
  return /^(https?:\/\/)?[^/\s]+\.[^/\s]{2,}/i.test(value) || value.includes("/");
}

function withHttps(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Normalize raw input to a canonical outbound URL.
 * Returns null when the value cannot be turned into a link
 * (e.g. Discord usernames, which have no public URL scheme).
 */
export function resolvePlatformUrl(platform: SocialPlatform, raw: string): string | null {
  const value = raw.trim().replace(/^@/, "");
  if (!value) return null;

  if (platform.kind === "url") {
    return looksLikeUrl(value) ? withHttps(value) : null;
  }
  // Full URLs (or anything with a domain) pass through.
  if (/^(https?:\/\/)/i.test(value) || /^[^/\s]+\.[^/\s]{2,}(\/|$)/.test(value)) {
    return withHttps(value);
  }
  // Bare username → base profile URL.
  if (USERNAME_RE.test(value)) {
    if (!platform.baseUrl) return null; // e.g. Discord: display-only handle
    return platform.baseUrl.replace("{u}", encodeURIComponent(value));
  }
  // Path shorthand ("in/satya-nadella", "c/channel") → resolve against the
  // platform root derived from baseUrl.
  if (platform.baseUrl && /^[a-zA-Z0-9._\-/]{1,80}$/.test(value)) {
    try {
      const root = new URL(platform.baseUrl.replace("{u}", "x")).origin;
      return `${root}/${value.replace(/^\/+/, "")}`;
    } catch {
      return null;
    }
  }
  return null;
}

/** Display text for a stored value: the username, or a shortened URL. */
export function displayValueFor(platform: SocialPlatform, raw: string): string {
  const value = raw.trim();
  if (!looksLikeUrl(value)) return value.replace(/^@/, "");
  try {
    const url = new URL(withHttps(value));
    const path = url.pathname.replace(/\/$/, "");
    const last = path.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : url.hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function sanitizePlatformValue(platform: SocialPlatform, raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().slice(0, 300);
  if (!value) return null;
  if (platform.kind === "url" || looksLikeUrl(value)) {
    if (value.length > 300) return null;
    return looksLikeUrl(value) ? value : null;
  }
  const handle = value.replace(/^@/, "");
  return USERNAME_RE.test(handle) ? handle : null;
}

/**
 * Whitelist + validate a raw socialLinks payload from the client.
 * Unknown platform keys are dropped, empties removed, customs capped.
 */
export function sanitizeSocialLinks(input: unknown): SocialLinks {
  const fallback: SocialLinks = { platforms: {}, custom: [] };
  if (!input || typeof input !== "object") return fallback;
  const { platforms, custom } = input as { platforms?: unknown; custom?: unknown };

  const cleanPlatforms: Record<string, string> = {};
  if (platforms && typeof platforms === "object") {
    for (const [key, raw] of Object.entries(platforms as Record<string, unknown>)) {
      const platform = PLATFORM_MAP[key];
      if (!platform) continue;
      const clean = sanitizePlatformValue(platform, raw);
      if (clean) cleanPlatforms[key] = clean;
    }
  }

  const cleanCustom: CustomLink[] = [];
  if (Array.isArray(custom)) {
    for (const entry of custom.slice(0, MAX_CUSTOM_LINKS)) {
      if (!entry || typeof entry !== "object") continue;
      const { label, url } = entry as { label?: unknown; url?: unknown };
      if (typeof label !== "string" || typeof url !== "string") continue;
      const cleanLabel = label.trim().slice(0, 30);
      const cleanUrl = url.trim().slice(0, 300);
      if (!cleanLabel || !looksLikeUrl(cleanUrl)) continue;
      cleanCustom.push({ label: cleanLabel, url: withHttps(cleanUrl) });
    }
  }

  return { platforms: cleanPlatforms, custom: cleanCustom };
}

export function countSocialLinks(links: SocialLinks | null | undefined): number {
  if (!links) return 0;
  return Object.keys(links.platforms ?? {}).length + (links.custom ?? []).length;
}
