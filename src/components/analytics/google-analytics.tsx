"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { useProfile } from "@/hooks/use-profile";
import { GA_MEASUREMENT_ID, setGA4UserProperties, trackPageView } from "@/lib/analytics/ga4";

/**
 * Script injection for Google Analytics 4 (gtag.js)
 */
export function GoogleAnalyticsScripts() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: true,
              cookie_flags: 'SameSite=None;Secure',
              transport_type: 'beacon'
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Route-change and SPA listener for Next.js App Router
 * Tracks virtual pageviews with dynamic content grouping & user dimensions
 */
export function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string>("");
  const { profile } = useProfile();

  useEffect(() => {
    if (!pathname) return;

    const queryString = searchParams?.toString();
    const fullUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Avoid duplicate pageviews on initial load
    if (lastTrackedUrl.current === fullUrl) return;
    lastTrackedUrl.current = fullUrl;

    // Small delay to ensure document.title is updated by Next.js
    const timer = setTimeout(() => {
      trackPageView(fullUrl, document.title);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Sync GA4 User Properties when student profile is loaded or for guest
  useEffect(() => {
    if (profile) {
      const points = profile.loopPoints || profile.points || 0;
      let tier: "bronze" | "silver" | "gold" | "campus_legend" = "bronze";
      if (points >= 1000) tier = "campus_legend";
      else if (points >= 500) tier = "gold";
      else if (points >= 200) tier = "silver";

      setGA4UserProperties({
        user_type: profile.role === "ADMIN" ? "admin" : "student",
        institution_name: profile.institution?.name,
        institution_id: profile.institutionId || undefined,
        branch: profile.branch || undefined,
        semester: profile.year ? profile.year * 2 : undefined,
        loop_points_tier: tier,
        anonymity_mode: (profile.feedVisibility as "all" | "no_anon") || "all",
      });
    } else {
      setGA4UserProperties({
        user_type: "guest",
      });
    }
  }, [profile]);

  // Initial user environment signals (PWA mode, theme, anonymity)
  useEffect(() => {
    try {
      const anonMode = (localStorage.getItem("campusloop_feed_visibility") as "all" | "no_anon") || "all";
      setGA4UserProperties({
        anonymity_mode: anonMode,
      });

      // Listen for feed visibility toggle
      const handleVisibilityChange = (e: CustomEvent) => {
        const mode = e.detail?.visibility || "all";
        setGA4UserProperties({ anonymity_mode: mode });
      };

      window.addEventListener("campusloop_feed_visibility_change" as any, handleVisibilityChange);
      return () => {
        window.removeEventListener("campusloop_feed_visibility_change" as any, handleVisibilityChange);
      };
    } catch {}
  }, []);

  return null;
}
