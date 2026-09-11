import { describe, expect, it } from "vitest";
import {
  classifyRedditContent,
  cleanRedditUrl,
  extractRedditGallery,
  extractRedditVideo,
} from "./classifier";
import { normalizeRedditPost } from "./normalize";
import { calculateCollegeRelevanceScore, calculateRedditRelevance } from "./relevance";
import { findRedditSource, getAllRedditSources } from "./sources";
import type { RawRedditPostData } from "./types";

describe("Reddit Campus Ingestion System", () => {
  // 1. Normal Text Reddit Post
  it("normalizes a standard text/discussion post correctly", () => {
    const rawPost: RawRedditPostData = {
      id: "text123",
      name: "t3_text123",
      subreddit: "CollegeRant",
      author: "tired_student",
      title: "My professor assigned a 50-page paper during midsems",
      selftext: "Is anyone else dealing with this? Our attendance criteria is 75% too.",
      permalink: "/r/CollegeRant/comments/text123/my_professor_assigned/",
      url: "https://www.reddit.com/r/CollegeRant/comments/text123/my_professor_assigned/",
      score: 342,
      num_comments: 45,
      created_utc: 1700000000,
    };

    const normalized = normalizeRedditPost(rawPost);

    expect(normalized.redditId).toBe("text123");
    expect(normalized.contentType).toBe("TEXT");
    expect(normalized.postType).toBe("NORMAL");
    expect(normalized.media).toBeNull();
    expect(normalized.gallery).toHaveLength(0);
    expect(normalized.canonicalUrl).toBe(
      "https://www.reddit.com/r/CollegeRant/comments/text123/my_professor_assigned/"
    );
    expect(normalized.body).toContain("Is anyone else dealing with this?");
  });

  // 2. Reddit Image Post
  it("classifies and extracts direct Reddit image posts", () => {
    const rawPost: RawRedditPostData = {
      id: "img456",
      name: "t3_img456",
      subreddit: "Btechtards",
      author: "coder_dude",
      title: "Hostel wifi vs Campus library wifi meme",
      permalink: "/r/Btechtards/comments/img456/hostel_wifi/",
      url: "https://i.redd.it/test_meme.jpg",
      post_hint: "image",
      score: 1200,
      num_comments: 89,
      created_utc: 1700000000,
      preview: {
        images: [
          {
            source: {
              url: "https://preview.redd.it/test_meme.jpg?width=1080&amp;crop=smart",
              width: 1080,
              height: 1080,
            },
          },
        ],
      },
    };

    const sourceConfig = findRedditSource("Btechtards");
    const normalized = normalizeRedditPost(rawPost, sourceConfig);

    expect(normalized.contentType).toBe("IMAGE");
    expect(normalized.postType).toBe("MEME");
    expect(normalized.media).not.toBeNull();
    expect(normalized.media?.url).toBe("https://i.redd.it/test_meme.jpg");
    // Verify XML entities &amp; are unescaped
    expect(normalized.media?.previewUrl).toBe("https://preview.redd.it/test_meme.jpg?width=1080&crop=smart");
    expect(normalized.body).toContain("![image](https://i.redd.it/test_meme.jpg)");
  });

  // 3. Reddit Video Post
  it("extracts Reddit video with fallback, HLS, DASH, dimensions and duration", () => {
    const rawPost: RawRedditPostData = {
      id: "vid789",
      name: "t3_vid789",
      subreddit: "Btechtards",
      author: "hostel_survivor",
      title: "Night before endsem exams in boys hostel",
      permalink: "/r/Btechtards/comments/vid789/night_before_endsem/",
      url: "https://v.redd.it/abc123vid",
      is_video: true,
      score: 2500,
      num_comments: 140,
      created_utc: 1700000000,
      media: {
        reddit_video: {
          fallback_url: "https://v.redd.it/abc123vid/DASH_720.mp4?source=fallback",
          hls_url: "https://v.redd.it/abc123vid/HLSPlaylist.m3u8",
          dash_url: "https://v.redd.it/abc123vid/DASHPlaylist.mpd",
          width: 720,
          height: 1280,
          duration: 22,
          is_gif: false,
        },
      },
      preview: {
        images: [
          {
            source: {
              url: "https://preview.redd.it/thumb.jpg",
              width: 720,
              height: 1280,
            },
          },
        ],
      },
    };

    const videoMedia = extractRedditVideo(rawPost);
    expect(videoMedia).not.toBeNull();
    expect(videoMedia?.mediaType).toBe("VIDEO");
    expect(videoMedia?.url).toBe("https://v.redd.it/abc123vid/DASH_720.mp4?source=fallback");
    expect(videoMedia?.hlsUrl).toBe("https://v.redd.it/abc123vid/HLSPlaylist.m3u8");
    expect(videoMedia?.dashUrl).toBe("https://v.redd.it/abc123vid/DASHPlaylist.mpd");
    expect(videoMedia?.duration).toBe(22);
    expect(videoMedia?.height).toBe(1280);
    expect(videoMedia?.width).toBe(720);
    expect(videoMedia?.isGif).toBe(false);

    const normalized = normalizeRedditPost(rawPost);
    expect(normalized.contentType).toBe("VIDEO");
    expect(normalized.body).toContain("![video](https://v.redd.it/abc123vid/DASH_720.mp4?source=fallback)");
  });

  // 4. Reddit GIF Post
  it("identifies animated Reddit GIFs and marks isGif accordingly", () => {
    const rawPost: RawRedditPostData = {
      id: "gif101",
      name: "t3_gif101",
      subreddit: "ProgrammerHumor",
      author: "junior_dev",
      title: "When the code works on first compile",
      permalink: "/r/ProgrammerHumor/comments/gif101/first_compile/",
      url: "https://i.redd.it/celebrate.gif",
      score: 850,
      num_comments: 32,
      created_utc: 1700000000,
      preview: {
        images: [
          {
            source: { url: "https://preview.redd.it/celebrate.gif", width: 400, height: 300 },
            variants: {
              gif: {
                source: { url: "https://preview.redd.it/animated.gif", width: 400, height: 300 },
              },
            },
          },
        ],
      },
    };

    const classified = classifyRedditContent(rawPost);
    expect(classified.contentType).toBe("GIF");
    expect(classified.media?.isGif).toBe(true);
    expect(classified.postType).toBe("MEME");
  });

  // 5. Reddit Gallery Post
  it("extracts multiple gallery items in correct sequence with external URLs", () => {
    const rawPost: RawRedditPostData = {
      id: "gal202",
      name: "t3_gal202",
      subreddit: "college",
      author: "campus_tour",
      title: "Photos from our annual tech fest",
      permalink: "/r/college/comments/gal202/tech_fest_photos/",
      url: "https://www.reddit.com/gallery/gal202",
      is_gallery: true,
      score: 650,
      num_comments: 40,
      created_utc: 1700000000,
      gallery_data: {
        items: [
          { media_id: "pic_1", id: 1 },
          { media_id: "pic_2", id: 2 },
          { media_id: "pic_3", id: 3 },
        ],
      },
      media_metadata: {
        pic_1: {
          status: "valid",
          e: "Image",
          s: { u: "https://preview.redd.it/pic_1.jpg?width=1200&amp;format=pjpg", x: 1200, y: 800 },
        },
        pic_2: {
          status: "valid",
          e: "Image",
          s: { u: "https://preview.redd.it/pic_2.jpg?width=1200&amp;format=pjpg", x: 1200, y: 800 },
        },
        pic_3: {
          status: "valid",
          e: "Image",
          s: { u: "https://preview.redd.it/pic_3.jpg?width=1200&amp;format=pjpg", x: 1200, y: 800 },
        },
      },
    };

    const gallery = extractRedditGallery(rawPost);
    expect(gallery).toHaveLength(3);
    expect(gallery[0].url).toBe("https://preview.redd.it/pic_1.jpg?width=1200&format=pjpg");
    expect(gallery[0].position).toBe(0);
    expect(gallery[1].url).toBe("https://preview.redd.it/pic_2.jpg?width=1200&format=pjpg");
    expect(gallery[1].position).toBe(1);
    expect(gallery[2].position).toBe(2);

    const normalized = normalizeRedditPost(rawPost);
    expect(normalized.contentType).toBe("GALLERY");
    expect(normalized.gallery).toHaveLength(3);
  });

  // 6. External Link / Video
  it("classifies external links without assuming they are binary downloads", () => {
    const rawPost: RawRedditPostData = {
      id: "link303",
      name: "t3_link303",
      subreddit: "IndianAcademia",
      author: "research_scholar",
      title: "Guide on applying for DRDO internships",
      permalink: "/r/IndianAcademia/comments/link303/drdo_guide/",
      url: "https://youtube.com/watch?v=sample123",
      post_hint: "link",
      score: 180,
      num_comments: 20,
      created_utc: 1700000000,
    };

    const classified = classifyRedditContent(rawPost);
    expect(classified.contentType).toBe("LINK");
    expect(classified.media?.url).toBe("https://youtube.com/watch?v=sample123");
    expect(classified.media?.metadata?.isVideoSite).toBe(true);
  });

  // 7. NSFW Rejection
  it("strictly rejects NSFW posts marked over_18", () => {
    const rawPost: RawRedditPostData = {
      id: "nsfw404",
      name: "t3_nsfw404",
      subreddit: "Btechtards",
      author: "anon_user",
      title: "NSFW content title",
      permalink: "/r/Btechtards/comments/nsfw404/post/",
      url: "https://i.redd.it/nsfw.jpg",
      over_18: true,
      score: 9999,
      num_comments: 500,
      created_utc: 1700000000,
    };

    const relevance = calculateRedditRelevance(rawPost);
    expect(relevance.isAcceptable).toBe(false);
    expect(relevance.rejectionReason).toContain("NSFW");
    expect(relevance.totalScore).toBeLessThan(0);
  });

  // 8. Deleted / Removed Post Handling
  it("rejects removed or deleted Reddit posts", () => {
    const rawPost: RawRedditPostData = {
      id: "del505",
      name: "t3_del505",
      subreddit: "college",
      author: "[deleted]",
      title: "[deleted]",
      selftext: "[removed]",
      permalink: "/r/college/comments/del505/deleted/",
      url: "https://www.reddit.com/r/college/comments/del505/deleted/",
      score: 0,
      num_comments: 2,
      created_utc: 1700000000,
    };

    const relevance = calculateRedditRelevance(rawPost);
    expect(relevance.isAcceptable).toBe(false);
    expect(relevance.rejectionReason).toContain("deleted or removed");
  });

  // 9. URL Entity Unescape Helper
  it("properly unescapes XML entity encoding in Reddit media URLs", () => {
    const raw = "https://preview.redd.it/sample.png?width=1080&amp;crop=smart&amp;auto=webp&amp;s=abcdef";
    const cleaned = cleanRedditUrl(raw);
    expect(cleaned).toBe("https://preview.redd.it/sample.png?width=1080&crop=smart&auto=webp&s=abcdef");
  });

  // 10. College Relevance Keyword Scorer
  it("awards bonus points for Indian college keywords", () => {
    const text =
      "Hostel canteen food was terrible today, but our professor announced no attendance penalty for engineering midsem exams!";
    const result = calculateCollegeRelevanceScore(text);

    expect(result.relevanceScore).toBeGreaterThanOrEqual(30);
    expect(result.matchedKeywords).toContain("hostel");
    expect(result.matchedKeywords).toContain("professor");
    expect(result.matchedKeywords).toContain("attendance");
    expect(result.matchedKeywords).toContain("midsem");
  });

  // 11. Reddit Overall Relevance Score Calculation
  it("computes composite relevance score factoring source priority and engagement", () => {
    const rawPost: RawRedditPostData = {
      id: "score707",
      name: "t3_score707",
      subreddit: "Btechtards",
      author: "topper_coder",
      title: "Placement season tips for tier 3 engineering college students",
      selftext: "Focus on DSA, leetcode, and semester projects for campus placements.",
      permalink: "/r/Btechtards/comments/score707/placement_tips/",
      url: "https://www.reddit.com/r/Btechtards/comments/score707/placement_tips/",
      score: 550,
      num_comments: 75,
      created_utc: Date.now() / 1000 - 3600, // 1 hour ago
    };

    const sourceConfig = findRedditSource("Btechtards");
    const relevance = calculateRedditRelevance(rawPost, sourceConfig, "TEXT");

    expect(relevance.isAcceptable).toBe(true);
    expect(relevance.totalScore).toBeGreaterThan(120);
    expect(relevance.collegeScore).toBeGreaterThanOrEqual(30);
    expect(relevance.matchedKeywords).toContain("placement");
    expect(relevance.matchedKeywords).toContain("engineering");
    expect(relevance.matchedKeywords).toContain("dsa");
  });

  // 12. Low Engagement / Outdated Post Penalty
  it("penalizes posts with near-zero engagement", () => {
    const rawPost: RawRedditPostData = {
      id: "low808",
      name: "t3_low808",
      subreddit: "teenagers",
      author: "random_user",
      title: "Hello world random thought",
      permalink: "/r/teenagers/comments/low808/hello/",
      url: "https://www.reddit.com/r/teenagers/comments/low808/hello/",
      score: 1,
      num_comments: 0,
      created_utc: Date.now() / 1000 - 86400 * 3, // 3 days ago
    };

    const sourceConfig = findRedditSource("teenagers");
    const relevance = calculateRedditRelevance(rawPost, sourceConfig, "TEXT");

    // With 1 upvote, 0 comments, no keywords, and old age, score should be low
    expect(relevance.totalScore).toBeLessThan(45);
  });

  // 13. Subreddit Source Configuration Lookup
  it("retrieves configured sources with correct priorities", () => {
    const allSources = getAllRedditSources();
    expect(allSources.length).toBeGreaterThanOrEqual(16);

    const btechtards = findRedditSource("Btechtards");
    expect(btechtards).toBeDefined();
    expect(btechtards?.priority).toBe(100);
    expect(btechtards?.categories).toContain("engineering");

    const jeeneet = findRedditSource("r/JEENEETards");
    expect(jeeneet).toBeDefined();
    expect(jeeneet?.priority).toBe(95);
  });

  // 14. Missing Media Graceful Fallback
  it("handles posts with empty or null media structures gracefully", () => {
    const rawPost: RawRedditPostData = {
      id: "empty909",
      name: "t3_empty909",
      subreddit: "college",
      author: "poster",
      title: "Post with missing media objects",
      permalink: "/r/college/comments/empty909/missing/",
      url: "https://www.reddit.com/r/college/comments/empty909/missing/",
      media: null,
      secure_media: null,
      preview: undefined,
      score: 100,
      num_comments: 10,
      created_utc: 1700000000,
    };

    const classified = classifyRedditContent(rawPost);
    expect(classified.contentType).toBe("TEXT");
    expect(classified.media).toBeNull();
    expect(classified.gallery).toHaveLength(0);
  });

  // 15. Invalid or Malformed Media URL Handling
  it("does not crash on malformed media URLs and formats canonical links safely", () => {
    const rawPost: RawRedditPostData = {
      id: "malformed010",
      name: "t3_malformed010",
      subreddit: "IndiaMeme",
      author: "meme_lord",
      title: "Desi college meme",
      permalink: "r/IndiaMeme/comments/malformed010/meme/", // Missing leading slash
      url: "not-a-valid-url",
      score: 400,
      num_comments: 20,
      created_utc: 1700000000,
    };

    const normalized = normalizeRedditPost(rawPost);
    expect(normalized.permalink).toBe("/r/IndiaMeme/comments/malformed010/meme/");
    expect(normalized.canonicalUrl).toBe("https://www.reddit.com/r/IndiaMeme/comments/malformed010/meme/");
  });
});
