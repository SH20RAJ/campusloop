import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { linkClicks, shortLinks } from "@/db/schema";

export const dynamic = "force-dynamic";

function parseUserAgent(userAgent?: string | null) {
  if (!userAgent) {
    return { device: "desktop", browser: "unknown", os: "unknown" };
  }

  const ua = userAgent.toLowerCase();

  let device = "desktop";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = "mobile";
  } else if (/ipad|tablet/i.test(ua)) {
    device = "tablet";
  }

  let browser = "other";
  if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("opr") || ua.includes("opera")) {
    browser = "Opera";
  }

  let os = "other";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  return { device, browser, os };
}

export async function GET(
  req: Request,
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const cleanSlug = (slug || "").trim().toLowerCase();

  if (!cleanSlug) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const db = getDb();
    const link = await db.query.shortLinks.findFirst({
      where: eq(shortLinks.slug, cleanSlug),
    });

    if (!link) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const userAgent = req.headers.get("user-agent");
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : req.headers.get("cf-connecting-ip") || null;
    const country = req.headers.get("cf-ipcountry") || null;
    const referer = req.headers.get("referer") || null;

    const { device, browser, os } = parseUserAgent(userAgent);

    // Record click
    await db.insert(linkClicks).values({
      shortLinkId: link.id,
      refCode: cleanSlug,
      ip: ip ? ip.slice(0, 64) : null,
      userAgent: userAgent ? userAgent.slice(0, 500) : null,
      device,
      browser,
      os,
      referer: referer ? referer.slice(0, 500) : null,
      country,
    });

    // Increment click counter
    await db
      .update(shortLinks)
      .set({
        clicks: sql`${shortLinks.clicks} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(shortLinks.id, link.id));

    // Handle relative or absolute target URL
    let targetUrl = link.targetUrl;
    if (targetUrl.startsWith("/")) {
      targetUrl = new URL(targetUrl, req.url).toString();
    } else if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    const redirectResponse = NextResponse.redirect(targetUrl, { status: 302 });

    // Also attach referral attribution cookie
    redirectResponse.cookies.set("campusloop_ref", cleanSlug, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return redirectResponse;
  } catch (err) {
    console.error("Short link redirect error:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
