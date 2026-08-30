"use client";

import { useEffect, useRef, useState } from "react";

export type UsernameStatus =
  | { state: "idle" }
  | { state: "invalid"; reason: string }
  | { state: "checking" }
  | { state: "available"; isCurrent: boolean }
  | { state: "taken"; reason: string }
  | { state: "error" };

interface AvailabilityResponse {
  username: string;
  available: boolean;
  isCurrent?: boolean;
  reason?: string;
}

/**
 * Debounced live check of whether a handle can be claimed, shared by onboarding
 * and profile editing so both report availability the same way.
 *
 * Responses are matched against the value that is current when they land, so a
 * slow reply for an earlier keystroke can never overwrite a newer result.
 */
export function useUsernameAvailability(
  username: string,
  { enabled = true, debounceMs = 450 }: { enabled?: boolean; debounceMs?: number } = {}
): UsernameStatus {
  const [status, setStatus] = useState<UsernameStatus>({ state: "idle" });
  const latestRequest = useRef(0);

  useEffect(() => {
    const candidate = username.trim().toLowerCase();

    if (!enabled || !candidate) {
      setStatus({ state: "idle" });
      return;
    }

    // Cheap local rules first, so obvious mistakes need no round trip.
    if (candidate.length < 3) {
      setStatus({ state: "invalid", reason: "At least 3 characters." });
      return;
    }
    if (candidate.length > 30) {
      setStatus({ state: "invalid", reason: "At most 30 characters." });
      return;
    }
    if (!/^[a-z0-9_]+$/.test(candidate)) {
      setStatus({ state: "invalid", reason: "Only lowercase letters, numbers and underscores." });
      return;
    }

    setStatus({ state: "checking" });

    const requestId = ++latestRequest.current;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/profile/username-available?username=${encodeURIComponent(candidate)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Request failed");

        const data = (await res.json()) as AvailabilityResponse;

        // A stale response must not clobber a newer keystroke's result.
        if (requestId !== latestRequest.current) return;

        if (data.available) {
          setStatus({ state: "available", isCurrent: Boolean(data.isCurrent) });
        } else {
          setStatus({ state: "taken", reason: data.reason || "That username is taken." });
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        if (requestId !== latestRequest.current) return;
        setStatus({ state: "error" });
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username, enabled, debounceMs]);

  return status;
}
