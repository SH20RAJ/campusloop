import { describe, expect, it } from "vitest";
import {
  extractAppleMusicEmbedUrl,
  extractEmbedsFromText,
  extractInstagramEmbedUrl,
  extractNineGagId,
  extractSoundCloudEmbedUrl,
  extractSpotifyEmbedUrl,
  extractVimeoEmbedUrl,
  extractYouTubeId,
  isNineGagHomeUrl,
} from "./embeds";

describe("Link and Embed Parsing Engine", () => {
  it("extracts standard YouTube watch URLs", () => {
    const url = "https://www.youtube.com/watch?v=6znH4Pz8j3Q";
    expect(extractYouTubeId(url)).toBe("6znH4Pz8j3Q");
  });

  it("extracts 9GAG gag IDs and detects 9GAG home", () => {
    expect(extractNineGagId("https://9gag.com/gag/aeM4p25")).toBe("aeM4p25");
    expect(extractNineGagId("http://m.9gag.com/gag/aK4dY8W?ref=fsidebar")).toBe("aK4dY8W");
    expect(extractNineGagId("https://9gag.com/home")).toBeNull();
    expect(isNineGagHomeUrl("https://9gag.com/home")).toBe(true);
    expect(isNineGagHomeUrl("https://9gag.com")).toBe(true);
    expect(isNineGagHomeUrl("https://9gag.com/hot")).toBe(true);
    expect(isNineGagHomeUrl("https://9gag.com/gag/aeM4p25")).toBe(false);
  });

  it("extracts SoundCloud embed URLs for tracks and playlists", () => {
    const track = "https://soundcloud.com/chilledcow/lofi-hip-hop-radio";
    const scEmbed = extractSoundCloudEmbedUrl(track);
    expect(scEmbed).toContain("w.soundcloud.com/player");
    expect(scEmbed).toContain(encodeURIComponent(track));

    const shortUrl = "https://on.soundcloud.com/7xyz";
    const shortEmbed = extractSoundCloudEmbedUrl(shortUrl);
    expect(shortEmbed).toContain("w.soundcloud.com/player");
  });

  it("extracts Apple Music embed URLs", () => {
    const albumUrl = "https://music.apple.com/in/album/starboy/1440871441";
    expect(extractAppleMusicEmbedUrl(albumUrl)).toBe("https://embed.music.apple.com/in/album/starboy/1440871441");
  });

  it("extracts Spotify embed URLs for tracks and playlists", () => {
    const track = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
    expect(extractSpotifyEmbedUrl(track)).toBe("https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");

    const playlist = "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M";
    expect(extractSpotifyEmbedUrl(playlist)).toBe("https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M");
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

    const articleText = "Check out this guide: https://campusloop.space/app/articles/getting-started-ai";
    const articleEmbeds = extractEmbedsFromText(articleText);
    const article = articleEmbeds.find((e) => e.type === "internal_article");
    expect(article).toBeDefined();
    expect(article?.slug).toBe("getting-started-ai");
  });

  it("does not extract markdown image attachments as link previews", () => {
    const postWithImages = `
      Pure hostel engineering. Best meal of the entire week.
      #HostelChronicles #3AMMaggi #HostelLore

      ![Image](https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=60)
      ![Image](https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=60)
    `;

    const embeds = extractEmbedsFromText(postWithImages);
    expect(embeds).toHaveLength(0);
  });

  it("extracts 9GAG home and specific gag embeds from post text", () => {
    const textWith9gag = "Check out https://9gag.com/home for fresh memes or see https://9gag.com/gag/aeM4p25";
    const embeds = extractEmbedsFromText(textWith9gag);
    expect(embeds).toHaveLength(2);

    const homeEmbed = embeds.find((e) => e.type === "ninegag" && e.isHome);
    expect(homeEmbed).toBeDefined();
    expect(homeEmbed?.rawUrl).toBe("https://9gag.com/home");

    const gagEmbed = embeds.find((e) => e.type === "ninegag" && !e.isHome);
    expect(gagEmbed).toBeDefined();
    expect(gagEmbed?.id).toBe("aeM4p25");
  });

  it("extracts Instagram and Vimeo embeds", () => {
    const instaUrl = "https://www.instagram.com/reel/C8q8q12345/";
    const instaParsed = extractInstagramEmbedUrl(instaUrl);
    expect(instaParsed?.id).toBe("C8q8q12345");
    expect(instaParsed?.embedUrl).toBe("https://www.instagram.com/p/C8q8q12345/embed/");

    const vimeoUrl = "https://vimeo.com/76979871";
    const vimeoParsed = extractVimeoEmbedUrl(vimeoUrl);
    expect(vimeoParsed?.id).toBe("76979871");
  });
});
