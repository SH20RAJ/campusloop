import type { RawRedditListing, RawRedditPostData } from "./types";

interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp ms
}

let cachedToken: TokenCache | null = null;

/**
 * Server-side Reddit API Client.
 * Uses official Reddit OAuth app-only authentication with automatic token caching.
 */
export class RedditClient {
  private clientId: string;
  private clientSecret: string;
  private refreshToken?: string;
  private userAgent: string;

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID || "";
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || "";
    this.refreshToken = process.env.REDDIT_REFRESH_TOKEN || "";
    this.userAgent =
      process.env.REDDIT_USER_AGENT || "web:space.campusloop.reddit:v1.0.0 (by /u/campusloop_official)";
  }

  public isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Retrieves an OAuth application-only access token, reusing cached token if valid.
   */
  public async getAccessToken(): Promise<string | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 60_000) {
      return cachedToken.accessToken;
    }

    try {
      const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      const bodyParams = new URLSearchParams();

      if (this.refreshToken) {
        bodyParams.set("grant_type", "refresh_token");
        bodyParams.set("refresh_token", this.refreshToken);
      } else {
        bodyParams.set("grant_type", "client_credentials");
      }

      const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": this.userAgent,
        },
        body: bodyParams.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[reddit_token_failed] HTTP ${response.status}: ${errorText.slice(0, 200)}`);
        return null;
      }

      const data = (await response.json()) as {
        access_token?: string;
        expires_in?: number;
      };

      if (!data.access_token) {
        console.error("[reddit_token_failed] Missing access_token in response");
        return null;
      }

      const expiresInMs = (data.expires_in || 3600) * 1000;
      cachedToken = {
        accessToken: data.access_token,
        expiresAt: now + expiresInMs,
      };

      return data.access_token;
    } catch (err) {
      console.error("[reddit_token_network_error]", err instanceof Error ? err.message : err);
      return null;
    }
  }

  /**
   * Fetches posts from a subreddit using OAuth API (or public endpoint fallback for local dev).
   */
  public async fetchSubredditPosts(
    subreddit: string,
    sort: "hot" | "new" | "top_day" | "top_week" = "hot",
    limit = 25
  ): Promise<RawRedditPostData[]> {
    const cleanSub = subreddit.replace(/^r\//, "").trim();
    const token = await this.getAccessToken();

    let endpoint: string;
    const headers: Record<string, string> = {
      "User-Agent": this.userAgent,
    };

    let sortPath: string = sort;
    let extraParams = "";
    if (sort === "top_day") {
      sortPath = "top";
      extraParams = "&t=day";
    } else if (sort === "top_week") {
      sortPath = "top";
      extraParams = "&t=week";
    }

    if (token) {
      endpoint = `https://oauth.reddit.com/r/${cleanSub}/${sortPath}.json?limit=${limit}${extraParams}&raw_json=1`;
      headers.Authorization = `Bearer ${token}`;
    } else {
      // Unauthenticated fallback for local dev/testing
      console.warn(
        `[reddit_unauthenticated_request] REDDIT_CLIENT_ID not set. Using public endpoint for r/${cleanSub}.`
      );
      endpoint = `https://www.reddit.com/r/${cleanSub}/${sortPath}.json?limit=${limit}${extraParams}&raw_json=1`;
    }

    try {
      const res = await fetch(endpoint, {
        headers,
        signal: AbortSignal.timeout(10_000),
      });

      if (res.status === 401 && token) {
        // Token might have expired early; invalidate cache and retry once
        cachedToken = null;
        const freshToken = await this.getAccessToken();
        if (freshToken) {
          headers.Authorization = `Bearer ${freshToken}`;
          const retryRes = await fetch(endpoint, {
            headers,
            signal: AbortSignal.timeout(10_000),
          });
          if (retryRes.ok) {
            const data = (await retryRes.json()) as RawRedditListing;
            return (data.data?.children || []).map((c) => c.data).filter(Boolean);
          }
        }
      }

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After") || "5";
        console.warn(
          `[reddit_rate_limited] 429 Too Many Requests on r/${cleanSub}. Retry-After: ${retryAfter}s`
        );
        return [];
      }

      if (res.status === 403) {
        console.warn(`[reddit_forbidden] Subreddit r/${cleanSub} is private or restricted.`);
        return [];
      }

      if (res.status === 404) {
        console.warn(`[reddit_not_found] Subreddit r/${cleanSub} does not exist.`);
        return [];
      }

      if (!res.ok) {
        console.error(`[reddit_fetch_failed] HTTP ${res.status} on r/${cleanSub}`);
        return [];
      }

      const listing = (await res.json()) as RawRedditListing;
      if (!listing?.data?.children || !Array.isArray(listing.data.children)) {
        return [];
      }

      return listing.data.children.map((child) => child.data).filter(Boolean);
    } catch (err) {
      console.error(
        `[reddit_source_failed] Error fetching r/${cleanSub}:`,
        err instanceof Error ? err.message : err
      );
      return [];
    }
  }
}

export const redditClient = new RedditClient();
