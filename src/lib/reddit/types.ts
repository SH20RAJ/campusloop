/**
 * Types and interfaces for the Reddit Ingestion Engine
 */

export type RedditContentType = "TEXT" | "IMAGE" | "VIDEO" | "GIF" | "GALLERY" | "LINK" | "OTHER";

export type RedditPostType = "NORMAL" | "MEME";

export interface RedditVideoData {
  fallback_url?: string;
  height?: number;
  width?: number;
  duration?: number;
  is_gif?: boolean;
  hls_url?: string;
  dash_url?: string;
}

export interface RedditMediaMetadataItem {
  status?: string;
  e?: string; // "Image", "AnimatedImage", etc.
  m?: string; // MIME e.g. "image/jpg"
  s?: {
    u?: string;
    gif?: string;
    mp4?: string;
    x?: number;
    y?: number;
  };
  p?: Array<{
    u?: string;
    x?: number;
    y?: number;
  }>;
  id?: string;
}

export interface RedditPreviewImage {
  source: {
    url: string;
    width: number;
    height: number;
  };
  resolutions?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  variants?: {
    gif?: {
      source: {
        url: string;
        width: number;
        height: number;
      };
    };
    mp4?: {
      source: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

export interface RawRedditPostData {
  id: string;
  name: string; // e.g. "t3_1abcde"
  subreddit: string;
  author: string;
  title: string;
  selftext?: string;
  permalink: string;
  url: string;
  url_overridden_by_dest?: string;
  post_hint?: string;
  is_video?: boolean;
  is_gallery?: boolean;
  over_18?: boolean;
  spoiler?: boolean;
  score: number;
  ups?: number;
  num_comments: number;
  created_utc: number;
  domain?: string;
  media?: {
    reddit_video?: RedditVideoData;
    type?: string;
    oembed?: Record<string, unknown>;
  } | null;
  secure_media?: {
    reddit_video?: RedditVideoData;
  } | null;
  preview?: {
    images?: RedditPreviewImage[];
    enabled?: boolean;
  };
  gallery_data?: {
    items?: Array<{
      media_id: string;
      id: number;
      caption?: string;
    }>;
  };
  media_metadata?: Record<string, RedditMediaMetadataItem>;
  link_flair_text?: string | null;
  removed_by_category?: string | null;
}

export interface RawRedditChild {
  kind: string;
  data: RawRedditPostData;
}

export interface RawRedditListing {
  kind: "Listing";
  data: {
    after?: string | null;
    before?: string | null;
    dist?: number;
    children: RawRedditChild[];
  };
}

export interface NormalizedRedditMedia {
  mediaType: "IMAGE" | "VIDEO" | "GIF" | "LINK";
  url: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  hlsUrl?: string;
  dashUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  isGif: boolean;
  position: number;
  metadata?: Record<string, unknown>;
}

export interface NormalizedRedditPost {
  redditId: string;
  redditFullname: string;
  subreddit: string;
  redditAuthor: string;
  title: string;
  body: string;
  permalink: string;
  canonicalUrl: string;
  source: "reddit";

  contentType: RedditContentType;
  postType: RedditPostType;

  media: NormalizedRedditMedia | null;
  gallery: NormalizedRedditMedia[];

  score: number;
  numComments: number;
  createdAt: string;

  nsfw: boolean;
  spoiler: boolean;

  sourcePriority: number;
  relevanceScore: number;
  sourceMetadata?: Record<string, unknown>;
}

export interface SubredditSourceConfig {
  subreddit: string;
  priority: number;
  enabled: boolean;
  categories: string[];
  defaultSort?: "hot" | "new" | "top_day" | "top_week";
}

export interface IngestOptions {
  subreddit?: string;
  limit?: number;
  sort?: "hot" | "new" | "top_day" | "top_week";
  dryRun?: boolean;
}

export interface IngestResultItem {
  redditId: string;
  subreddit: string;
  title: string;
  contentType: RedditContentType;
  action: "INSERTED" | "SKIPPED_DUPLICATE" | "SKIPPED_MODERATION" | "SKIPPED_LOW_RELEVANCE" | "DRY_RUN";
  relevanceScore: number;
  reason?: string;
  postId?: string;
}

export interface IngestSummary {
  sourcesProcessed: number;
  totalFetched: number;
  normalized: number;
  duplicates: number;
  moderationFiltered: number;
  lowRelevanceFiltered: number;
  inserted: number;
  dryRun: boolean;
  durationMs: number;
  items: IngestResultItem[];
}
