"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function ReferralTracker() {
  const searchParams = useSearchParams();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    const ref = searchParams?.get("ref")?.trim();
    if (!ref || trackedRef.current === ref) return;

    trackedRef.current = ref;

    try {
      localStorage.setItem("campusloop_ref", ref);
    } catch {}

    // Non-blocking fire & forget
    fetch("/api/referrals/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ref,
        referer: typeof document !== "undefined" ? document.referrer : null,
      }),
    }).catch(() => {});
  }, [searchParams]);

  return null;
}
