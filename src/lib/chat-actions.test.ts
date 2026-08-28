import { describe, expect, it } from "vitest";

describe("Chat Media & Links Extractor", () => {
  it("extracts direct image URLs and hosted images from message bodies", () => {
    const bodies = [
      "Hey check this photo https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500 it's great",
      "Look at this screenshot https://i.ibb.co/abc123/screenshot.png and tell me",
      "Regular text with no media",
      "Another one: https://cdn.example.com/banner.webp?quality=80",
    ];

    const imageRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s]*)?)/gi;
    const hostedImageRegex = /(https?:\/\/(?:images\.unsplash\.com|i\.ibb\.co|res\.cloudinary\.com)[^\s]+)/gi;

    const extracted: string[] = [];
    bodies.forEach((b) => {
      const matches = b.match(imageRegex) || b.match(hostedImageRegex);
      if (matches) {
        extracted.push(...matches);
      }
    });

    expect(extracted).toHaveLength(3);
    expect(extracted[0]).toContain("unsplash.com");
    expect(extracted[1]).toContain("i.ibb.co");
    expect(extracted[2]).toContain("banner.webp");
  });

  it("extracts hyperlinks from messages and skips pure image URLs", () => {
    const body = "Visit https://campusloop.space and read the docs at https://github.com/SH20RAJ/campusloop also see https://example.com/pic.jpg";
    const urlRegex = /(https?:\/\/[^\s]+)/gi;

    const matches = body.match(urlRegex) || [];
    const webLinks = matches.filter((url) => !/\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(url));

    expect(webLinks).toHaveLength(2);
    expect(webLinks[0]).toBe("https://campusloop.space");
    expect(webLinks[1]).toBe("https://github.com/SH20RAJ/campusloop");
  });

  it("correctly determines host domain from full URL", () => {
    const url1 = "https://www.campusloop.space/app/chat";
    const parsed1 = new URL(url1);
    expect(parsed1.hostname.replace(/^www\./, "")).toBe("campusloop.space");

    const url2 = "https://github.com/SH20RAJ/campusloop";
    const parsed2 = new URL(url2);
    expect(parsed2.hostname.replace(/^www\./, "")).toBe("github.com");
  });
});
