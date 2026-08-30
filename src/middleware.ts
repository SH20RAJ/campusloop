import { NextResponse, type NextRequest } from "next/server";

/**
 * Public mirrors for signed-out visitors and search crawlers.
 *
 * Everything under `/app` sits behind an auth gate that redirects to sign-in.
 * That is right for the feed and for anything interactive, but it also made our
 * most linkable, most rankable pages — campus hubs, articles, events — invisible
 * to Google and to anyone opening a shared link in a private window.
 *
 * Those pages already have public equivalents outside the gated layout. This
 * middleware sends signed-out traffic there instead of to the sign-in wall.
 *
 * The session check only looks for the *presence* of an auth cookie, never its
 * validity — that stays with the server layout. A stale cookie simply means the
 * visitor reaches the gated route and gets the normal redirect, which is the
 * behaviour we already had.
 */

/** Ordered longest-prefix-first so `/app/colleges` is not caught by `/app/college`. */
const PUBLIC_MIRRORS: Array<{ gated: string; publicPath: string }> = [
  { gated: "/app/colleges", publicPath: "/colleges" },
  { gated: "/app/college/", publicPath: "/college/" },
  { gated: "/app/articles/", publicPath: "/a/" },
  { gated: "/app/events/", publicPath: "/e/" },
];

const AUTH_COOKIE_HINTS = [
  "hexclave-access",
  "hexclave-refresh",
  "stack-access",
  "stack-refresh",
];

function hasSessionCookie(req: NextRequest): boolean {
  return req.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE_HINTS.some((hint) => cookie.name.startsWith(hint)));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (hasSessionCookie(req)) {
    return NextResponse.next();
  }

  for (const { gated, publicPath } of PUBLIC_MIRRORS) {
    if (pathname === gated || pathname.startsWith(gated)) {
      const rest = pathname.slice(gated.length);

      // `/app/articles/` and `/app/events/` only mirror their detail pages; the
      // index pages stay behind the gate because they are personalised.
      if (!rest && gated.endsWith("/")) break;

      const url = req.nextUrl.clone();
      url.pathname = `${publicPath}${rest}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/college/:path*", "/app/colleges", "/app/articles/:path*", "/app/events/:path*"],
};
