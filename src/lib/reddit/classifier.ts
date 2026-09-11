import type {
  NormalizedRedditMedia,
  RawRedditPostData,
  RedditContentType,
  RedditPostType,
  SubredditSourceConfig,
} from "./types";

/** Unescape XML entity encodings in Reddit URLs */
export function cleanRedditUrl(url?: string | null): string {
  if (!url) return "";
  return url.replace(/&amp;/g, "&").trim();
}

/** Check if a URL points to an image */
export function isImageUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".png") ||
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".webp") ||
    clean.includes("i.redd.it") ||
    clean.includes("preview.redd.it")
  );
}

/** Check if a URL or object points to a GIF */
export function isGifMedia(post: RawRedditPostData): boolean {
  const url = (post.url_overridden_by_dest || post.url || "").toLowerCase();
  if (url.split("?")[0].endsWith(".gif")) return true;

  const video = post.media?.reddit_video || post.secure_media?.reddit_video;
  if (video?.is_gif) return true;

  if (post.preview?.images?.[0]?.variants?.gif) return true;

  return false;
}

/** Check if post contains a Reddit-hosted video */
export function extractRedditVideo(post: RawRedditPostData): NormalizedRedditMedia | null {
  const video = post.media?.reddit_video || post.secure_media?.reddit_video;
  if (!video?.fallback_url) {
    // If domain is v.redd.it but no media object, attempt fallback URL construction
    const url = post.url_overridden_by_dest || post.url || "";
    if (url.includes("v.redd.it")) {
      const clean = cleanRedditUrl(url);
      const isGif = post.post_hint?.includes("gif") || false;
      return {
        mediaType: isGif ? "GIF" : "VIDEO",
        url: clean,
        previewUrl: cleanRedditUrl(post.preview?.images?.[0]?.source?.url),
        thumbnailUrl: cleanRedditUrl(post.preview?.images?.[0]?.source?.url),
        isGif,
        position: 0,
      };
    }
    return null;
  }

  const fallbackUrl = cleanRedditUrl(video.fallback_url);
  const preview = post.preview?.images?.[0]?.source?.url;
  const isGif = Boolean(video.is_gif);

  return {
    mediaType: isGif ? "GIF" : "VIDEO",
    url: fallbackUrl,
    previewUrl: cleanRedditUrl(preview),
    thumbnailUrl: cleanRedditUrl(preview),
    hlsUrl: cleanRedditUrl(video.hls_url),
    dashUrl: cleanRedditUrl(video.dash_url),
    width: video.width,
    height: video.height,
    duration: video.duration,
    isGif,
    position: 0,
  };
}

/** Extract gallery items from a Reddit gallery post */
export function extractRedditGallery(post: RawRedditPostData): NormalizedRedditMedia[] {
  if (!post.gallery_data?.items || !post.media_metadata) {
    return [];
  }

  const items: NormalizedRedditMedia[] = [];

  for (let i = 0; i < post.gallery_data.items.length; i++) {
    const item = post.gallery_data.items[i];
    const meta = post.media_metadata[item.media_id];
    if (!meta || meta.status !== "valid") continue;

    // Prefer highest resolution image in 's'
    let mediaUrl = meta.s?.u || meta.s?.gif || meta.s?.mp4;
    if (!mediaUrl && meta.p && meta.p.length > 0) {
      mediaUrl = meta.p[meta.p.length - 1]?.u;
    }

    if (!mediaUrl) continue;

    const cleanedUrl = cleanRedditUrl(mediaUrl);
    const isGif = meta.e === "AnimatedImage" || Boolean(meta.s?.gif);

    items.push({
      mediaType: isGif ? "GIF" : "IMAGE",
      url: cleanedUrl,
      previewUrl: cleanedUrl,
      thumbnailUrl: cleanRedditUrl(meta.p?.[0]?.u || cleanedUrl),
      width: meta.s?.x,
      height: meta.s?.y,
      isGif,
      position: i,
    });
  }

  return items;
}

/**
 * Classify a raw Reddit post into content type and CampusLoop post type.
 */
export function classifyRedditContent(
  post: RawRedditPostData,
  sourceConfig?: SubredditSourceConfig
): {
  contentType: RedditContentType;
  postType: RedditPostType;
  media: NormalizedRedditMedia | null;
  gallery: NormalizedRedditMedia[];
} {
  // 1. Check Gallery first
  if (post.is_gallery && post.gallery_data?.items && post.media_metadata) {
    const gallery = extractRedditGallery(post);
    if (gallery.length > 0) {
      const isMeme =
        sourceConfig?.categories.includes("meme") ||
        /meme|humor|dank|shitpost/i.test(post.title || "") ||
        /meme/i.test(post.link_flair_text || "");

      return {
        contentType: "GALLERY",
        postType: isMeme ? "MEME" : "NORMAL",
        media: gallery[0] || null,
        gallery,
      };
    }
  }

  // 2. Check Video / Reel
  const videoMedia = extractRedditVideo(post);
  if (videoMedia) {
    const isMeme =
      sourceConfig?.categories.includes("meme") ||
      /meme|funny|lol|lmao|bruh|humor/i.test(post.title || "") ||
      /meme/i.test(post.link_flair_text || "");

    return {
      contentType: videoMedia.isGif ? "GIF" : "VIDEO",
      postType: isMeme ? "MEME" : "NORMAL",
      media: videoMedia,
      gallery: [],
    };
  }

  const rawUrl = post.url_overridden_by_dest || post.url || "";
  const cleanedUrl = cleanRedditUrl(rawUrl);

  // 3. Check GIF
  if (isGifMedia(post)) {
    const gifUrl = cleanRedditUrl(post.preview?.images?.[0]?.variants?.gif?.source?.url) || cleanedUrl;
    const preview = cleanRedditUrl(post.preview?.images?.[0]?.source?.url);

    return {
      contentType: "GIF",
      postType: "MEME",
      media: {
        mediaType: "GIF",
        url: gifUrl,
        previewUrl: preview,
        thumbnailUrl: preview,
        isGif: true,
        position: 0,
      },
      gallery: [],
    };
  }

  // 4. Check Direct Image
  if (post.post_hint === "image" || isImageUrl(cleanedUrl)) {
    const preview = cleanRedditUrl(post.preview?.images?.[0]?.source?.url);
    const isMeme =
      sourceConfig?.categories.includes("meme") ||
      /meme|humor|shitpost|dank/i.test(post.title || "") ||
      /meme/i.test(post.link_flair_text || "");

    return {
      contentType: "IMAGE",
      postType: isMeme ? "MEME" : "NORMAL",
      media: {
        mediaType: "IMAGE",
        url: cleanedUrl,
        previewUrl: preview || cleanedUrl,
        thumbnailUrl: preview || cleanedUrl,
        width: post.preview?.images?.[0]?.source?.width,
        height: post.preview?.images?.[0]?.source?.height,
        isGif: false,
        position: 0,
      },
      gallery: [],
    };
  }

  // 5. Check External Link
  if (
    post.post_hint === "link" ||
    (cleanedUrl && !cleanedUrl.includes("reddit.com") && !cleanedUrl.includes("redd.it"))
  ) {
    const isVideoSite = /youtube\.com|youtu\.be|instagram\.com|twitter\.com|x\.com/i.test(cleanedUrl);
    return {
      contentType: "LINK",
      postType: "NORMAL",
      media: {
        mediaType: "LINK",
        url: cleanedUrl,
        previewUrl: cleanRedditUrl(post.preview?.images?.[0]?.source?.url),
        thumbnailUrl: cleanRedditUrl(post.preview?.images?.[0]?.source?.url),
        isGif: false,
        position: 0,
        metadata: { isVideoSite },
      },
      gallery: [],
    };
  }

  // 6. Default: Text / Discussion
  return {
    contentType: "TEXT",
    postType: "NORMAL",
    media: null,
    gallery: [],
  };
}
