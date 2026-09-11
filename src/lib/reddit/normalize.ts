import { classifyRedditContent } from "./classifier";
import { calculateRedditRelevance } from "./relevance";
import type { NormalizedRedditPost, RawRedditPostData, SubredditSourceConfig } from "./types";

/**
 * Normalizes a raw Reddit API child data object into a standardized internal representation.
 */
export function normalizeRedditPost(
  raw: RawRedditPostData,
  sourceConfig?: SubredditSourceConfig
): NormalizedRedditPost {
  const permalink = raw.permalink.startsWith("/") ? raw.permalink : `/${raw.permalink}`;
  const canonicalUrl = `https://www.reddit.com${permalink}`;

  const { contentType, postType, media, gallery } = classifyRedditContent(raw, sourceConfig);

  const { totalScore: relevanceScore } = calculateRedditRelevance(raw, sourceConfig, contentType);

  // Construct standard post body with clean markdown embeds for CampusLoop feed
  const title = (raw.title || "").trim();
  const rawSelftext = (raw.selftext || "").trim();
  const bodyParts: string[] = [];

  if (rawSelftext && rawSelftext !== "[removed]" && rawSelftext !== "[deleted]") {
    bodyParts.push(rawSelftext);
  }

  // Append markdown media tags so existing RichText and video players can identify them
  if (contentType === "VIDEO" && media?.url) {
    bodyParts.push(`\n\n![video](${media.url})`);
  } else if (contentType === "GIF" && media?.url) {
    bodyParts.push(`\n\n![image:gif](${media.url})`);
  } else if (contentType === "IMAGE" && media?.url) {
    bodyParts.push(`\n\n![image](${media.url})`);
  } else if (contentType === "GALLERY" && gallery.length > 0) {
    for (const item of gallery) {
      bodyParts.push(`\n![image](${item.url})`);
    }
  } else if (contentType === "LINK" && media?.url) {
    bodyParts.push(`\n\n[${title || "External Link"}](${media.url})`);
  }

  const formattedBody = bodyParts.join("\n").trim() || title;

  return {
    redditId: raw.id,
    redditFullname: raw.name || `t3_${raw.id}`,
    subreddit: raw.subreddit,
    redditAuthor: raw.author || "[deleted]",
    title,
    body: formattedBody,
    permalink,
    canonicalUrl,
    source: "reddit",

    contentType,
    postType,

    media,
    gallery,

    score: raw.score || 0,
    numComments: raw.num_comments || 0,
    createdAt: new Date((raw.created_utc || Date.now() / 1000) * 1000).toISOString(),

    nsfw: Boolean(raw.over_18),
    spoiler: Boolean(raw.spoiler),

    sourcePriority: sourceConfig?.priority ?? 50,
    relevanceScore,
    sourceMetadata: {
      ups: raw.ups,
      domain: raw.domain,
      linkFlairText: raw.link_flair_text,
      postHint: raw.post_hint,
    },
  };
}
