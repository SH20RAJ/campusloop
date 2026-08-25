"use client";

import React, { useEffect, useState } from "react";
import { SWRConfig } from "swr";
import { SWR_STORAGE_KEY } from "@/constants";

function localStorageProvider() {
  if (typeof window === "undefined") {
    return new Map();
  }

  let map: Map<string, any>;
  try {
    const raw = localStorage.getItem(SWR_STORAGE_KEY);
    map = new Map(raw ? JSON.parse(raw) : []);
  } catch (e) {
    console.warn("Failed to load SWR cache from localStorage:", e);
    map = new Map();
  }

  // Before unload or periodically sync to localStorage
  const syncToDisk = () => {
    try {
      // Exclude large binary/blob entries or transient errors
      const serializableEntries: [string, any][] = [];
      let totalSize = 0;
      const MAX_CACHE_BYTES = 4 * 1024 * 1024; // 4MB safe cap

      for (const [key, value] of map.entries()) {
        if (typeof key === "string" && !key.startsWith("$inf$") && value?.data) {
          const serialized = JSON.stringify([key, value]);
          if (totalSize + serialized.length < MAX_CACHE_BYTES) {
            serializableEntries.push([key, value]);
            totalSize += serialized.length;
          }
        }
      }

      localStorage.setItem(SWR_STORAGE_KEY, JSON.stringify(serializableEntries));
    } catch (e) {
      console.warn("Failed to persist SWR cache to localStorage:", e);
    }
  };

  window.addEventListener("beforeunload", syncToDisk);
  window.addEventListener("pagehide", syncToDisk);

  return map;
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<() => Map<string, any>>(() => () => new Map());

  useEffect(() => {
    setProvider(() => localStorageProvider);
  }, []);

  return (
    <SWRConfig
      value={{
        provider,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        dedupingInterval: 3000,
        keepPreviousData: true,
        errorRetryCount: 3,
        errorRetryInterval: 4000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
