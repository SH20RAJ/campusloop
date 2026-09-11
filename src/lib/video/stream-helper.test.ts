import { describe, expect, it } from "vitest";
import { extractVideoStreamInfo } from "./stream-helper";

describe("extractVideoStreamInfo", () => {
  it("resolves Reddit video CDN urls to 720p HD and HLS playlist with discrete audio", () => {
    const info = extractVideoStreamInfo("https://v.redd.it/mjerk1n4ftnh1/CMAF_270.mp4");
    expect(info).not.toBeNull();
    expect(info?.isRedditVideo).toBe(true);
    expect(info?.videoId).toBe("mjerk1n4ftnh1");
    expect(info?.hlsUrl).toBe("https://v.redd.it/mjerk1n4ftnh1/HLSPlaylist.m3u8");
    expect(info?.audioUrl).toBe("https://v.redd.it/mjerk1n4ftnh1/CMAF_AUDIO_128.mp4");
    expect(info?.hdVideoUrl).toBe("https://v.redd.it/mjerk1n4ftnh1/CMAF_720.mp4");
  });

  it("handles DASH fallback URLs and upgrades to 720p HD", () => {
    const info = extractVideoStreamInfo("https://v.redd.it/abc123vid/DASH_360.mp4?source=fallback");
    expect(info?.isRedditVideo).toBe(true);
    expect(info?.videoId).toBe("abc123vid");
    expect(info?.hdVideoUrl).toContain("DASH_720.mp4");
  });

  it("prioritizes externalMedia hlsUrl when provided", () => {
    const info = extractVideoStreamInfo(null, [
      {
        mediaType: "VIDEO",
        mediaUrl: "https://v.redd.it/customid/CMAF_720.mp4",
        hlsUrl: "https://v.redd.it/customid/HLSPlaylist.m3u8",
      },
    ]);
    expect(info?.isRedditVideo).toBe(true);
    expect(info?.hlsUrl).toBe("https://v.redd.it/customid/HLSPlaylist.m3u8");
    expect(info?.audioUrl).toBe("https://v.redd.it/customid/CMAF_AUDIO_128.mp4");
  });

  it("returns clean non-reddit video info without error", () => {
    const info = extractVideoStreamInfo("https://example.com/campus-event.mp4");
    expect(info?.isRedditVideo).toBe(false);
    expect(info?.videoId).toBeNull();
    expect(info?.hlsUrl).toBeNull();
    expect(info?.audioUrl).toBeNull();
    expect(info?.hdVideoUrl).toBe("https://example.com/campus-event.mp4");
  });

  it("returns null for empty input", () => {
    expect(extractVideoStreamInfo(null)).toBeNull();
    expect(extractVideoStreamInfo("")).toBeNull();
  });
});
