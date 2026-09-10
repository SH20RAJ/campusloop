"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NotFoundSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/app/search?q=${encodeURIComponent(q)}` : "/app/search");
      }}
    >
      <label className="relative block">
        <span className="sr-only">Search CampusLoop</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, people, colleges…"
          autoComplete="off"
          className="h-12 w-full rounded-full border border-border bg-card pr-24 pl-11 text-sm shadow-xs outline-none placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-1.5 h-9 -translate-y-1/2 cursor-pointer rounded-full bg-foreground px-4 text-xs font-bold text-background transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </label>
    </form>
  );
}
