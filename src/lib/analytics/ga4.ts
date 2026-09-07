/**
 * CampusLoop GA4 Creative Analytics & Custom Properties Engine
 * 
 * Measurement ID: G-3546ZQ6HB1
 * Features:
 * - Dynamic Route & Single Page App (SPA) Pageview tracking with Content Grouping
 * - Custom User Dimensions: Student verification status, Institution, Branch, Semester, Loop Points Tier, PWA mode
 * - Rich Academic Vault Telemetry: Note Views, Downloads, 5-Download Guest Quota tracking, Limit Reached prompts, Votes, Shares
 * - Social Feed & Dating Telemetry: Post impressions, Confession interactions, Swipe matching
 * - Marketplace & Community Event pipelines
 */

export const GA_MEASUREMENT_ID = "G-3546ZQ6HB1";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Universal safe call to Google gtag
 */
export function gtag(...args: any[]) {
  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag(...args);
    } else if (window.dataLayer) {
      window.dataLayer.push(arguments);
    }
  }
}

/**
 * Dispatch custom GA4 event with standard parameters
 */
export function gtagEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  const enrichedParams = {
    send_to: GA_MEASUREMENT_ID,
    timestamp: new Date().toISOString(),
    is_pwa: typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches,
    theme: typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
    ...params,
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, enrichedParams);
  } else if (window.dataLayer) {
    window.dataLayer.push(["event", eventName, enrichedParams]);
  }
}

/**
 * Set persistent GA4 User Properties
 */
export interface GA4UserProperties {
  user_type?: "guest" | "student" | "viewer" | "admin";
  institution_name?: string;
  institution_id?: string;
  branch?: string;
  semester?: number | string;
  loop_points_tier?: "bronze" | "silver" | "gold" | "campus_legend";
  anonymity_mode?: "all" | "no_anon";
}

export function setGA4UserProperties(props: GA4UserProperties) {
  if (typeof window === "undefined") return;

  const userProps: Record<string, any> = {};
  if (props.user_type) userProps.cl_user_type = props.user_type;
  if (props.institution_name) userProps.cl_institution = props.institution_name;
  if (props.institution_id) userProps.cl_institution_id = props.institution_id;
  if (props.branch) userProps.cl_branch = props.branch;
  if (props.semester) userProps.cl_semester = String(props.semester);
  if (props.loop_points_tier) userProps.cl_points_tier = props.loop_points_tier;
  if (props.anonymity_mode) userProps.cl_anon_mode = props.anonymity_mode;

  gtag("set", "user_properties", userProps);
}

/**
 * Infer content group for Next.js App Router paths
 */
export function inferContentGroup(pathname: string): string {
  if (!pathname || pathname === "/") return "landing";
  if (pathname.startsWith("/app/academics/sources")) return "academic_sources";
  if (pathname.startsWith("/app/academics")) return "academics";
  if (pathname.startsWith("/app/matching") || pathname.startsWith("/app/dating")) return "dating";
  if (pathname.startsWith("/app/chat")) return "chat";
  if (pathname.startsWith("/app/marketplace")) return "marketplace";
  if (pathname.startsWith("/app/articles") || pathname.startsWith("/a/")) return "articles";
  if (pathname.startsWith("/app/college") || pathname.startsWith("/colleges") || pathname.startsWith("/college/")) return "colleges";
  if (pathname.startsWith("/app/communities") || pathname.startsWith("/c/")) return "communities";
  if (pathname.startsWith("/app/post")) return "post_detail";
  if (pathname.startsWith("/app/profile") || pathname.startsWith("/@")) return "student_profile";
  if (pathname.startsWith("/app/confessions")) return "confessions";
  if (pathname === "/app") return "campus_feed";
  if (pathname.startsWith("/admin")) return "admin";
  return "other";
}

/**
 * Track SPA Route change as a virtual GA4 page_view
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window === "undefined") return;

  const contentGroup = inferContentGroup(url);
  gtag("event", "page_view", {
    page_title: title || document.title,
    page_location: window.location.href,
    page_path: url,
    content_group: contentGroup,
    send_to: GA_MEASUREMENT_ID,
  });
}

// ─── 1. Creative Academic Vault Analytics ───

export function trackAcademicView(resource: {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  resourceType: string;
  institutionName?: string;
}) {
  gtagEvent("academic_material_view", {
    item_id: resource.id,
    item_name: resource.title,
    subject_code: resource.subjectCode,
    subject_name: resource.subjectName,
    branch: resource.branch,
    semester: resource.semester,
    resource_type: resource.resourceType,
    institution_name: resource.institutionName || "BIT Mesra",
    content_group: "academics",
  });
}

export function trackAcademicDownload(
  resource: {
    id: string;
    title: string;
    subjectCode: string;
    resourceType: string;
    fileUrl?: string | null;
  },
  isGuest: boolean,
  downloadsUsed: number
) {
  gtagEvent("academic_download", {
    item_id: resource.id,
    item_name: resource.title,
    subject_code: resource.subjectCode,
    resource_type: resource.resourceType,
    is_guest: isGuest,
    guest_downloads_count: downloadsUsed,
    free_downloads_remaining: isGuest ? Math.max(0, 5 - downloadsUsed) : "unlimited",
    value: 1,
    currency: "INR",
  });
}

export function trackAcademicLimitReached() {
  gtagEvent("academic_guest_limit_reached", {
    limit_threshold: 5,
    action: "blocked_download_and_showed_auth_modal",
    content_group: "academics",
  });
}

export function trackAcademicVote(resourceId: string, voteType: "UP" | "DOWN", subjectCode?: string) {
  gtagEvent("academic_vote", {
    resource_id: resourceId,
    vote_type: voteType,
    subject_code: subjectCode,
  });
}

export function trackAcademicShare(resourceId: string, subjectCode?: string, method: "share_api" | "clipboard" = "clipboard") {
  gtagEvent("share", {
    content_type: "academic_resource",
    item_id: resourceId,
    subject_code: subjectCode,
    method,
  });
}

export function trackAcademicSearch(query: string, branch?: string, semester?: string, type?: string) {
  gtagEvent("search", {
    search_term: query,
    filter_branch: branch,
    filter_semester: semester,
    filter_type: type,
    content_group: "academics",
  });
}

export function trackAcademicSourceClick(source: {
  id: string;
  name: string;
  university: string;
  action: "browse_internal" | "visit_external";
}) {
  gtagEvent("academic_source_engagement", {
    source_id: source.id,
    source_name: source.name,
    university: source.university,
    action: source.action,
  });
}

// ─── 2. Social Feed & Engagement Analytics ───

export function trackFeedSwitch(scope: "campus" | "global", anonymityMode: "all" | "no_anon") {
  gtagEvent("feed_filter_change", {
    feed_scope: scope,
    anonymity_mode: anonymityMode,
  });
}

export function trackPostEngagement(
  postId: string,
  action: "like" | "comment" | "repost" | "save" | "poll_vote",
  postType?: string,
  isAnonymous?: boolean
) {
  gtagEvent("post_engagement", {
    post_id: postId,
    action_type: action,
    post_type: postType || "POST",
    is_anonymous: Boolean(isAnonymous),
  });
}

// ─── 3. Campus Match & Dating Analytics ───

export function trackDatingSwipe(action: "like" | "pass" | "superlike", scope: "campus" | "global") {
  gtagEvent("dating_swipe", {
    swipe_action: action,
    matching_scope: scope,
  });
}

export function trackDatingMatch() {
  gtagEvent("dating_match_unlocked", {
    event_category: "dating",
  });
}

// ─── 4. Growth, PWA & Auth Modals ───

export function trackAuthModalTrigger(reason: string, returnTo?: string) {
  gtagEvent("auth_modal_prompted", {
    trigger_reason: reason,
    return_to: returnTo || "",
  });
}

export function trackAuthModalCta(reason: string, cta: "sign_in" | "dismiss") {
  gtagEvent("auth_modal_action", {
    trigger_reason: reason,
    cta_choice: cta,
  });
}

export function trackPWAInstallOutcome(outcome: "accepted" | "dismissed") {
  gtagEvent("pwa_install_prompt_outcome", {
    outcome,
  });
}
