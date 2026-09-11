/**
 * Centralized Video Stream Resolution & Audio Extraction Engine
 * Provides HLS master playlists, discrete audio streams, and HD resolution
 * upgrades for Reddit CDN (v.redd.it) and standard campus videos.
 */

export interface VideoStreamInfo {
  isRedditVideo: boolean;
  videoId: string | null;
  hlsUrl: string | null;
  audioUrl: string | null;
  fallbackAudioUrl: string | null;
  videoUrl: string;
  hdVideoUrl: string;
}

const REDDIT_VIDEO_REGEX = /https?:\/\/v\.redd\.it\/([a-zA-Z0-9_-]+)/i;

/**
 * Extract clean streaming URLs (HLS, HD Video, Audio) from any video URL or post media
 */
export function extractVideoStreamInfo(
  rawUrl?: string | null,
  externalMedia?: Array<{
    mediaType?: string;
    mediaUrl?: string | null;
    hlsUrl?: string | null;
    dashUrl?: string | null;
  }>
): VideoStreamInfo | null {
  if (!rawUrl && (!externalMedia || externalMedia.length === 0)) {
    return null;
  }

  // Check external media first
  const extVideo = externalMedia?.find((m) => m.mediaType === "VIDEO" && m.mediaUrl);
  const targetUrl = extVideo?.mediaUrl || rawUrl || "";

  if (!targetUrl) return null;

  const redditMatch = targetUrl.match(REDDIT_VIDEO_REGEX);
  if (redditMatch) {
    const videoId = redditMatch[1];
    const hlsUrl = extVideo?.hlsUrl || `https://v.redd.it/${videoId}/HLSPlaylist.m3u8`;
    const audioUrl = `https://v.redd.it/${videoId}/CMAF_AUDIO_128.mp4`;
    const fallbackAudioUrl = `https://v.redd.it/${videoId}/DASH_audio.mp4`;

    // Ensure 720p HD resolution instead of 270p/360p
    let hdVideoUrl = targetUrl;
    if (hdVideoUrl.includes("CMAF_")) {
      hdVideoUrl = hdVideoUrl.replace(/CMAF_\d+\.mp4/i, "CMAF_720.mp4");
    } else if (hdVideoUrl.includes("DASH_")) {
      hdVideoUrl = hdVideoUrl.replace(/DASH_\d+\.mp4/i, "DASH_720.mp4");
    } else if (hdVideoUrl.endsWith(videoId) || hdVideoUrl.endsWith(`${videoId}/`)) {
      hdVideoUrl = `https://v.redd.it/${videoId}/CMAF_720.mp4`;
    }

    return {
      isRedditVideo: true,
      videoId,
      hlsUrl,
      audioUrl,
      fallbackAudioUrl,
      videoUrl: hdVideoUrl,
      hdVideoUrl,
    };
  }

  // Standard (non-Reddit) video
  return {
    isRedditVideo: false,
    videoId: null,
    hlsUrl: targetUrl.endsWith(".m3u8") ? targetUrl : null,
    audioUrl: null,
    fallbackAudioUrl: null,
    videoUrl: targetUrl,
    hdVideoUrl: targetUrl,
  };
}
