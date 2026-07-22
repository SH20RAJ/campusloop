"use client";

import { useState, useEffect } from "react";
import { Search, MessageSquare, School, Users, Hash, Sparkles } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FeedCard } from "@/components/ui/feed-card";
import { FeedPost } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  institution?: { name: string } | null;
}

interface CollegeItem {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
}

interface CommunityItem {
  id: string;
  name: string;
  description: string | null;
}

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "POSTS" | "COLLEGES" | "USERS" | "COMMUNITIES">("ALL");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    posts: FeedPost[];
    colleges: CollegeItem[];
    users: UserItem[];
    communities: CommunityItem[];
  }>({
    posts: [],
    colleges: [],
    users: [],
    communities: [],
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ posts: [], colleges: [], users: [], communities: [] });
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = (await res.json()) as {
            posts: FeedPost[];
            colleges: CollegeItem[];
            users: UserItem[];
            communities: CommunityItem[];
          };
          if (!ignore) setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 200);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  const totalResults =
    results.posts.length + results.colleges.length + results.users.length + results.communities.length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-20 px-4 pt-6 gap-6">
      {/* Search Header Input */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search posts, campus confessions, colleges, students, or communities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="pl-11 h-12 text-sm rounded-2xl bg-card border-border/80 shadow-sm focus-visible:ring-primary"
          />
        </div>

        {/* Filter Category Tabs */}
        {query.trim() && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold border-b border-border/40 pt-1">
            {[
              { id: "ALL", label: `All (${totalResults})` },
              { id: "POSTS", label: `Posts (${results.posts.length})` },
              { id: "COLLEGES", label: `Colleges (${results.colleges.length})` },
              { id: "USERS", label: `Students (${results.users.length})` },
              { id: "COMMUNITIES", label: `Communities (${results.communities.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-4 py-8">
          <div className="h-20 rounded-2xl bg-card/60 shimmer-effect" />
          <div className="h-32 rounded-2xl bg-card/60 shimmer-effect" />
        </div>
      ) : query.trim() ? (
        <div className="space-y-6">
          {/* Colleges Results */}
          {(activeTab === "ALL" || activeTab === "COLLEGES") && results.colleges.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <School className="size-3.5 text-primary" /> Colleges ({results.colleges.length})
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {results.colleges.map((col) => (
                  <Link key={col.id} href={`/college/${col.slug || col.id}`}>
                    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 hover:border-primary/50 hover:shadow-sm transition-all">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <School className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{col.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{col.district ? `${col.district}, ` : ""}{col.state}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Students / Users Results */}
          {(activeTab === "ALL" || activeTab === "USERS") && results.users.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="size-3.5 text-emerald-500" /> Students & Profiles ({results.users.length})
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {results.users.map((u) => (
                  <Link key={u.id} href={`/app/profile/${u.username}`}>
                    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 hover:border-primary/50 hover:shadow-sm transition-all">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                        {u.displayName?.[0] || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{u.displayName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">@{u.username} {u.institution ? `&middot; ${u.institution.name}` : ""}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Communities Results */}
          {(activeTab === "ALL" || activeTab === "COMMUNITIES") && results.communities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="size-3.5 text-amber-500" /> Communities & Clubs ({results.communities.length})
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {results.communities.map((c) => (
                  <Link key={c.id} href={`/app/communities/${c.id}`}>
                    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 hover:border-primary/50 hover:shadow-sm transition-all">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs">
                        <Hash className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{c.description || "Student community hub"}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          {(activeTab === "ALL" || activeTab === "POSTS") && results.posts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="size-3.5 text-primary" /> Posts & Confessions ({results.posts.length})
              </h3>
              <div className="space-y-4">
                {results.posts.map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Zero Results State */}
          {totalResults === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-3xl border-border bg-card/40 p-6 space-y-2">
              <Sparkles className="size-8 text-muted-foreground/40" />
              <h3 className="text-sm font-bold text-foreground">No matches found</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                We couldn't find anything matching "{query}". Try checking your spelling or search another keyword.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Default Search Suggestions State */
        <div className="space-y-6 pt-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Popular Campus Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {["IIT Delhi", "BITS Pilani", "Confessions", "Canteen Tea", "Hostel Life", "Exam Backlogs"].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-xl border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
