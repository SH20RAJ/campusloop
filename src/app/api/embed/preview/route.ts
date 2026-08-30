import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface OgPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const host = parsedUrl.hostname;
    const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;

    // Fetch HTML with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let html = "";
    try {
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CampusLoopBot/1.0; +https://campusloop.space)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        return NextResponse.json({
          url: targetUrl,
          title: host,
          siteName: host,
          favicon,
        });
      }

      // Read max 150KB to avoid heavy payloads
      const text = await response.text();
      html = text.slice(0, 150000);
    } catch {
      clearTimeout(timeoutId);
      // Return basic host preview if fetch fails
      return NextResponse.json({
        url: targetUrl,
        title: host,
        siteName: host,
        favicon,
      });
    }

    // Extract Open Graph & meta tags
    const getMeta = (prop: string): string | undefined => {
      const regex = new RegExp(
        `<meta[^>]+(?:property|name)=["'](?:og:|twitter:)?${prop}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      const match = html.match(regex);
      if (match) return match[1];

      // Reverse attribute order
      const revRegex = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:)?${prop}["']`,
        "i"
      );
      const revMatch = html.match(revRegex);
      return revMatch ? revMatch[1] : undefined;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = getMeta("title") || (titleMatch ? titleMatch[1].trim() : undefined) || host;
    const description = getMeta("description");
    let image = getMeta("image");

    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, targetUrl).toString();
      } catch {
        image = undefined;
      }
    }

    const siteName = getMeta("site_name") || host;

    const data: OgPreviewData = {
      url: targetUrl,
      title: title?.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
      description: description?.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
      image,
      siteName,
      favicon,
    };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("OpenGraph preview error:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}
