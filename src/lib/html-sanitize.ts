/**
 * Post Text & Reddit HTML Sanitizer
 * Strips raw HTML, XML comments (<!-- SC_OFF -->), table wrappers,
 * decodes entities (&#32;, &amp;, etc.), and normalizes duplicate headers.
 */

export function cleanPostHtml(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 1. If text contains reddit RSS HTML table / SC_OFF comment wrappers
  if (
    cleaned.includes("<!-- SC_OFF -->") ||
    cleaned.includes("<!-- SC_ON -->") ||
    cleaned.includes("<table") ||
    cleaned.includes("<div class=\"md\">") ||
    /<[a-z][\s\S]*>/i.test(cleaned)
  ) {
    // Extract images inside <img src="..."> before stripping tags
    const imgMatches: string[] = [];
    const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"'>]+)["'][^>]*>/gi;
    let m: RegExpExecArray | null;
    while ((m = imgRegex.exec(cleaned)) !== null) {
      if (m[1] && !imgMatches.includes(m[1])) {
        // Skip tiny reddit tracking pixels or icons if any
        if (!m[1].includes("pixel") && !m[1].includes("1x1")) {
          imgMatches.push(m[1]);
        }
      }
    }

    // Extract text from inside <div class="md">...</div> if present
    const mdDivMatch = cleaned.match(/<div class=["']md["']>([\s\S]*?)<\/div>/i);
    if (mdDivMatch && mdDivMatch[1]) {
      cleaned = mdDivMatch[1];
    } else {
      // Remove table wrappers and SC comments
      cleaned = cleaned
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<table[\s\S]*?<\/table>/gi, " ")
        .replace(/<[^>]+>/g, " ");
    }

    // Strip any remaining HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, " ");

    // Append any extracted images as clean markdown if not already present in the body
    for (const imgUrl of imgMatches) {
      if (!cleaned.includes(imgUrl)) {
        cleaned += `\n\n![Image](${imgUrl})`;
      }
    }
  }

  // 2. Decode HTML entities
  cleaned = cleaned
    .replace(/&#32;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x20;/g, " ")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x3A;/g, ":");

  // 3. Remove reddit footer artifacts like "submitted by ... [link] [comments]"
  cleaned = cleaned
    .replace(/submitted by\s+\/u\/[^\s]+(?:\s+to\s+r\/[^\s]+)?/gi, "")
    .replace(/\[link\]/gi, "")
    .replace(/\[comments\]/gi, "");

  // 4. Normalize consecutive blank lines and trim
  cleaned = cleaned
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return cleaned;
}

/**
 * Strips redundant duplicate title from beginning of body if post.title is already displayed
 */
export function removeDuplicateTitleFromBody(body: string, title?: string | null): string {
  if (!body) return "";
  const cleaned = cleanPostHtml(body);
  if (!title) return cleaned;

  const normalizedTitle = title.trim().toLowerCase();
  const lines = cleaned.split("\n");

  if (lines.length > 0) {
    const firstLineNorm = lines[0].trim().toLowerCase();
    if (firstLineNorm === normalizedTitle) {
      return lines.slice(1).join("\n").trim();
    }
  }

  return cleaned;
}
