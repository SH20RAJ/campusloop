import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { useMemo } from "react";

export interface College {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
  website: string | null;
  yearOfEstablishment: number | null;
  aisheCode?: string;
  postCount?: number;
}

interface CollegesApiResponse {
  colleges: College[];
  hasMore?: boolean;
}

export function useColleges(limit = 100, page = 1) {
  const { data, error, isLoading, mutate } = useSWR<CollegesApiResponse | College[]>(
    `/api/colleges?limit=${limit}&page=${page}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  const colleges = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.colleges || [];
  }, [data]);

  const hasMore = useMemo(() => {
    if (!data || Array.isArray(data)) return false;
    return Boolean(data.hasMore);
  }, [data]);

  function filterColleges(searchQuery: string, stateFilter = "ALL") {
    return colleges.filter((c) => {
      const matchesState = stateFilter === "ALL" || c.state?.toLowerCase() === stateFilter.toLowerCase();
      if (!matchesState) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q)
      );
    });
  }

  return {
    colleges,
    hasMore,
    isLoading,
    error,
    mutate,
    filterColleges,
  };
}
