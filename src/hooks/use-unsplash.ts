"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import type { UnsplashPhoto } from "@/lib/unsplash";

interface UseUnsplashSearchOptions {
  query: string;
  orientation?: "landscape" | "portrait" | "squarish" | "all";
  perPage?: number;
  enabled?: boolean;
}

interface UnsplashSearchData {
  photos: UnsplashPhoto[];
  total: number;
  totalPages: number;
}

const fetcher = async (url: string): Promise<UnsplashSearchData> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load Unsplash photos");
  return res.json();
};

/**
 * Next.js best-practice centralized hook for fetching Unsplash photos with SWR caching,
 * debouncing, and zero duplicate network requests across components.
 */
export function useUnsplashSearch({
  query,
  orientation = "landscape",
  perPage = 16,
  enabled = true,
}: UseUnsplashSearchOptions) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const endpoint =
    enabled && debouncedQuery
      ? `/api/unsplash/search?q=${encodeURIComponent(debouncedQuery)}&orientation=${orientation}&per_page=${perPage}`
      : null;

  const { data, error, isLoading, isValidating } = useSWR<UnsplashSearchData>(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute client cache
    keepPreviousData: true,
  });

  return {
    photos: data?.photos || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    isLoading: isLoading || (enabled && query !== debouncedQuery),
    isValidating,
    error,
  };
}

/**
 * Triggers download telemetry required by Unsplash API terms.
 */
export async function pingUnsplashDownload(downloadLocation: string): Promise<void> {
  if (!downloadLocation) return;
  try {
    await fetch("/api/unsplash/track-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ downloadLocation }),
    });
  } catch (err) {
    console.warn("[Unsplash] Download ping error:", err);
  }
}
