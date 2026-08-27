"use client";

import { SWR_STORAGE_KEY } from "@/constants";
import React from "react";
import { SWRConfig } from "swr";

let globalSwrMap: Map<string, any> | null = null;

function getLocalStorageProvider() {
  if (typeof window === "undefined") {
    return new Map();
  }

  if (!globalSwrMap) {
    try {
      const raw = localStorage.getItem(SWR_STORAGE_KEY);
      globalSwrMap = new Map(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.warn("Failed to load SWR cache from localStorage:", e);
      globalSwrMap = new Map();
    }

    // Sync to localStorage before unload
    const syncToDisk = () => {
      try {
        if (!globalSwrMap) return;
        const serializableEntries: [string, any][] = [];
        let totalSize = 0;
        const MAX_CACHE_BYTES = 4 * 1024 * 1024; // 4MB safe cap

        for (const [key, value] of globalSwrMap.entries()) {
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
  }

  return globalSwrMap;
}

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: getLocalStorageProvider,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        dedupingInterval: 10000,
        keepPreviousData: true,

      }}
    >
      {children}
    </SWRConfig>
  );
}

