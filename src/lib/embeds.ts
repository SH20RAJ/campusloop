/**
 * CampusLoop Link & Embed Parsing Engine
 * Detects and extracts rich embeds for:
 * - YouTube videos and Shorts
 * - Instagram / Reels
 * - Twitter / X posts
 * - Spotify tracks, albums, playlists
 * - Direct video / audio files
 * - Internal User Profiles (@username, /app/profile/username)
 * - Internal Communities (/c/slug, /app/communities/id)
 * - Internal College Hubs (/colleges/slug, /app/college/slug)
 * - Internal Events (/app/events/id)
 * - Internal Posts (/app/post/id)
 * - External OpenGraph URLs
 */

export type EmbedType =
  | "youtube"
  | "instagram"
  | "twitter"
  | "spotify"
  | "video"
  | "audio"
  | "internal_profile"
  | "internal_community"
  | "internal_college"
  | "internal_event"
  | "internal_post"
  | "internal_article"
  | "opengraph";

export interface ParsedEmbed {
  type: EmbedType;
  rawUrl: string;
  id?: string;
  username?: string;
  slug?: string;
  embedUrl?: string;
}

/**
 * Extract YouTube video ID from every YouTube URL shape students actually paste:
 * `watch?v=`, `watch?feature=x&v=`, `shorts/`, `live/`, `embed/`, `v/`, `youtu.be/`,
 * across the `www`, `m` and `music` subdomains.
 */
export function extractYouTubeId(url: string): string | null {
  // The leading lookbehind keeps lookalike hosts such as `notyoutube.com` from
  // matching the bare `youtube.com` tail of the pattern.
  const patterns = [
    // youtu.be/ID and youtube.com/{shorts,live,embed,v}/ID
    /(?<![\w.-])(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:shorts|live|embed|v)\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    // youtube.com/watch?...v=ID (the v param may sit anywhere in the query string)
    /(?<![\w.-])(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extract Spotify Embed URL
 */
export function extractSpotifyEmbedUrl(url: string): string | null {
  const match = url.match(/https:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  }
  return null;
}

/**
 * Extract Twitter / X Tweet ID
 */
export function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/i);
  return match ? match[3] : null;
}

/**
 * Parse a given text and extract all embeddable links and internal entity references
 */
export function extractEmbedsFromText(text: string): ParsedEmbed[] {
  if (!text) return [];

  const embeds: ParsedEmbed[] = [];
  const seenUrls = new Set<string>();

  // 1. URL pattern
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(text)) !== null) {
    const rawUrl = match[1];
    if (seenUrls.has(rawUrl)) continue;
    seenUrls.add(rawUrl);

    // Clean trailing punctuation
    const cleanUrl = rawUrl.replace(/[.,;!?)]+$/, "");

    // A. YouTube
    const ytId = extractYouTubeId(cleanUrl);
    if (ytId) {
      embeds.push({
        type: "youtube",
        rawUrl: cleanUrl,
        id: ytId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}`,
      });
      continue;
    }

    // B. Direct Video
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl)) {
      embeds.push({
        type: "video",
        rawUrl: cleanUrl,
      });
      continue;
    }

    // C. Direct Audio
    if (/\.(mp3|wav|m4a|aac)(\?.*)?$/i.test(cleanUrl)) {
      embeds.push({
        type: "audio",
        rawUrl: cleanUrl,
      });
      continue;
    }

    // D. Spotify
    const spotifyEmbed = extractSpotifyEmbedUrl(cleanUrl);
    if (spotifyEmbed) {
      embeds.push({
        type: "spotify",
        rawUrl: cleanUrl,
        embedUrl: spotifyEmbed,
      });
      continue;
    }

    // E. Internal CampusLoop URLs
    try {
      const parsedUrl = new URL(cleanUrl);
      const isInternalDomain =
        parsedUrl.hostname === "campusloop.space" ||
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname === "127.0.0.1";

      if (isInternalDomain) {
        const path = parsedUrl.pathname;

        // User profile: /@username or /app/profile/username or /u/username
        const profileMatch = path.match(/^\/(?:@|u\/|app\/profile\/)([a-zA-Z0-9_]+)/);
        if (profileMatch) {
          embeds.push({
            type: "internal_profile",
            rawUrl: cleanUrl,
            username: profileMatch[1],
          });
          continue;
        }

        // Community: /c/slug or /app/communities/id
        const commMatch = path.match(/^\/(?:c\/|app\/communities\/)([a-zA-Z0-9_-]+)/);
        if (commMatch) {
          embeds.push({
            type: "internal_community",
            rawUrl: cleanUrl,
            slug: commMatch[1],
          });
          continue;
        }

        // Event: /app/events/id or /events/id
        const eventMatch = path.match(/^\/(?:app\/events\/|events\/)([a-zA-Z0-9_-]+)/);
        if (eventMatch && eventMatch[1] !== "new") {
          embeds.push({
            type: "internal_event",
            rawUrl: cleanUrl,
            id: eventMatch[1],
          });
          continue;
        }

        // College Hub: /app/college/slug or /colleges/slug
        const collegeMatch = path.match(/^\/(?:app\/college\/|colleges\/|college\/)([a-zA-Z0-9_-]+)/);
        if (collegeMatch) {
          embeds.push({
            type: "internal_college",
            rawUrl: cleanUrl,
            slug: collegeMatch[1],
          });
          continue;
        }

        // Post: /app/post/id
        const postMatch = path.match(/^\/app\/post\/([a-zA-Z0-9_-]+)/);
        if (postMatch) {
          embeds.push({
            type: "internal_post",
            rawUrl: cleanUrl,
            id: postMatch[1],
          });
          continue;
        }

        // Article: /app/articles/slug or /a/slug
        const articleMatch = path.match(/^\/(?:app\/articles\/|a\/|articles\/)([a-zA-Z0-9_-]+)/);
        if (articleMatch && articleMatch[1] !== "new" && articleMatch[1] !== "dashboard") {
          embeds.push({
            type: "internal_article",
            rawUrl: cleanUrl,
            slug: articleMatch[1],
          });
          continue;
        }
      }
    } catch {
      // Ignore URL parse error
    }

    // F. General OpenGraph external link
    // Only add if not an image link (which is already rendered inline)
    if (!/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(cleanUrl)) {
      embeds.push({
        type: "opengraph",
        rawUrl: cleanUrl,
      });
    }
  }

  // 2. Look for standalone internal paths like `/@username`, `/c/coding`, `/app/events/123`, or `https://campusloop.space/@username`
  // Ensure @username is preceded by start of line, whitespace or opening bracket, never letters (e.g. mart@password123)
  const internalPathRegex =
    /(?:^|[\s([{<])(?:https?:\/\/(?:campusloop\.space|localhost(?::\d+)?)\/)?(?:\/)?(?:@|u\/|app\/profile\/)([a-zA-Z0-9_]{3,30})\b/g;
  while ((match = internalPathRegex.exec(text)) !== null) {
    const username = match[1];
    if (
      username &&
      username !== "new" &&
      username !== "password123" &&
      !embeds.some((e) => e.type === "internal_profile" && e.username === username)
    ) {
      embeds.push({
        type: "internal_profile",
        rawUrl: `/@${username}`,
        username,
      });
    }
  }

  const internalCommRegex =
    /(?:^|\s)(?:https?:\/\/(?:campusloop\.space|localhost(?::\d+)?)\/)?(?:\/)?(?:c\/|app\/communities\/)([a-zA-Z0-9_-]+)/g;
  while ((match = internalCommRegex.exec(text)) !== null) {
    const slug = match[1];
    if (slug && !embeds.some((e) => e.type === "internal_community" && e.slug === slug)) {
      embeds.push({
        type: "internal_community",
        rawUrl: `/c/${slug}`,
        slug,
      });
    }
  }

  const internalEventRegex =
    /(?:^|\s)(?:https?:\/\/(?:campusloop\.space|localhost(?::\d+)?)\/)?(?:\/)?(?:app\/events\/|events\/)([a-zA-Z0-9_-]+)/g;
  while ((match = internalEventRegex.exec(text)) !== null) {
    const id = match[1];
    if (id && id !== "new" && !embeds.some((e) => e.type === "internal_event" && e.id === id)) {
      embeds.push({
        type: "internal_event",
        rawUrl: `/app/events/${id}`,
        id,
      });
    }
  }

  const internalArticleRegex =
    /(?:^|\s)(?:https?:\/\/(?:campusloop\.space|localhost(?::\d+)?)\/)?(?:\/)?(?:app\/articles\/|a\/|articles\/)([a-zA-Z0-9_-]+)/g;
  while ((match = internalArticleRegex.exec(text)) !== null) {
    const slug = match[1];
    if (
      slug &&
      slug !== "new" &&
      slug !== "dashboard" &&
      !embeds.some((e) => e.type === "internal_article" && e.slug === slug)
    ) {
      embeds.push({
        type: "internal_article",
        rawUrl: `/app/articles/${slug}`,
        slug,
      });
    }
  }

  return embeds;
}
