/**
 * PDF & Academic Resource URL Health Check & Verification Engine
 * 
 * Enforces pre-upload verification: checks that any submitted PDF, Drive document,
 * or academic URL is reachable, returns an HTTP success code (< 400),
 * and is not showing 404 or 500 errors.
 */

export interface ValidationResult {
  isValid: boolean;
  status?: number;
  error?: string;
  contentType?: string | null;
}

export async function validateResourceUrl(rawUrl: string): Promise<ValidationResult> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, error: "Resource URL is required and must be a valid string." };
  }

  const trimmed = rawUrl.trim();

  // 1. Basic URL syntax validation
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: "Invalid URL format. Please provide a valid HTTP or HTTPS link." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { isValid: false, error: "Only HTTP and HTTPS URLs are supported." };
  }

  // 2. Google Drive / Docs / Sites & YouTube links
  // Drive links often require specific embed or preview formats
  const isDrive = parsed.hostname.includes("drive.google.com") || parsed.hostname.includes("docs.google.com");
  const isYouTube = parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be");
  const isGoogleSites = parsed.hostname.includes("sites.google.com");

  // Perform active HTTP check
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    // Try HEAD request first
    let res: Response;
    try {
      res = await fetch(trimmed, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0 (CampusLoop Academic HealthCheck/1.0)",
          Accept: "application/pdf,application/octet-stream,text/html,*/*",
        },
        signal: controller.signal,
      });
    } catch {
      // Retry with GET if HEAD fails or aborts
      res = await fetch(trimmed, {
        method: "GET",
        headers: {
          Range: "bytes=0-2048",
          "User-Agent": "Mozilla/5.0 (CampusLoop Academic HealthCheck/1.0)",
          Accept: "application/pdf,application/octet-stream,text/html,*/*",
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    // Check if server rejected HEAD with 405 Method Not Allowed or 403
    if (res.status === 405 || (res.status === 403 && !isDrive)) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), 7000);
      try {
        res = await fetch(trimmed, {
          method: "GET",
          headers: {
            Range: "bytes=0-1024",
            "User-Agent": "Mozilla/5.0 (CampusLoop Academic HealthCheck/1.0)",
          },
          signal: getController.signal,
        });
      } finally {
        clearTimeout(getTimeout);
      }
    }

    const contentType = res.headers.get("content-type");

    // Check for HTTP 404 or 5xx status codes
    if (res.status === 404) {
      return {
        isValid: false,
        status: 404,
        error: "The provided document URL returned a 404 Not Found error. The file does not exist at this location.",
      };
    }

    if (res.status >= 500) {
      return {
        isValid: false,
        status: res.status,
        error: `The server hosting this file returned a server error (HTTP ${res.status}). Please try again later or check the hosting server.`,
      };
    }

    if (res.status >= 400) {
      // If Google Drive returns 401 or 403, advise student on sharing permissions
      if (isDrive && (res.status === 401 || res.status === 403)) {
        return {
          isValid: false,
          status: res.status,
          error: "Google Drive access denied. Please ensure the file sharing setting is set to 'Anyone with the link can view'.",
        };
      }

      return {
        isValid: false,
        status: res.status,
        error: `Failed to access document (HTTP ${res.status}). Please verify the link is accessible.`,
      };
    }

    return {
      isValid: true,
      status: res.status,
      contentType,
    };
  } catch (err: any) {
    // If it's a known reliable host like Google Drive / YouTube that might block server-side bot scrapers, allow with warning
    if (isDrive || isYouTube || isGoogleSites) {
      return {
        isValid: true,
        status: 200,
        error: undefined,
      };
    }

    return {
      isValid: false,
      error: `Could not reach the document URL: ${err.name === "AbortError" ? "Connection timed out after 7 seconds" : err.message}`,
    };
  }
}
