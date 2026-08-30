import { describe, expect, it } from "vitest";
import { extractEmbedsFromText, extractSpotifyEmbedUrl, extractYouTubeId } from "./embeds";

describe("Link and Embed Parsing Engine", () => {
  it("extracts standard YouTube watch URLs", () => {
    const url = "https://www.youtube.com/watch?v=6znH4Pz8j3Q";
    expect(extractYouTubeId(url)).toBe("6znH4Pz8j3Q");
  });

  it("extracts short youtu.be URLs and shorts", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtube.com/shorts/abc12345678")).toBe("abc12345678");
  });

  it("extracts live, mobile, music and query-shuffled YouTube URLs", () => {
    expect(extractYouTubeId("https://www.youtube.com/live/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://m.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://music.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    // The `v` param is not always first — YouTube's own share links reorder it.
    expect(extractYouTubeId("https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ?si=AbCdEfGhIjKl")).toBe("dQw4w9WgXcQ");
  });

  it("renders a live stream link as a YouTube embed rather than a bare link preview", () => {
    const embeds = extractEmbedsFromText("Tune in https://www.youtube.com/live/dQw4w9WgXcQ");
    expect(embeds[0]?.type).toBe("youtube");
    expect(embeds[0]?.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("ignores lookalike hosts that are not YouTube", () => {
    expect(extractYouTubeId("https://notyoutube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("extracts Spotify embed URLs", () => {
    const track = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
    expect(extractSpotifyEmbedUrl(track)).toBe("https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");
  });

  it("extracts rich embeds from complex post body text", () => {
    const text = `
      Check out my new video on how VPNs work: https://www.youtube.com/watch?v=6znH4Pz8j3Q
      Also follow my friend @shaswatraj on CampusLoop!
      Join our community https://campusloop.space/c/coders-club
      And register for the hackathon at /app/events/hackbit-2026
    `;

    const embeds = extractEmbedsFromText(text);

    const yt = embeds.find((e) => e.type === "youtube");
    expect(yt).toBeDefined();
    expect(yt?.id).toBe("6znH4Pz8j3Q");

    const profile = embeds.find((e) => e.type === "internal_profile");
    expect(profile).toBeDefined();
    expect(profile?.username).toBe("shaswatraj");

    const comm = embeds.find((e) => e.type === "internal_community");
    expect(comm).toBeDefined();
    expect(comm?.slug).toBe("coders-club");

    const event = embeds.find((e) => e.type === "internal_event");
    expect(event).toBeDefined();
    expect(event?.id).toBe("hackbit-2026");
  });
});
