"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { FeedPost } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
GraduationCap,
Hash,
MapPin,
MessageCircle,
School,
Search,
ShieldCheck,
Users,
X,
Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter,useSearchParams } from "next/navigation";
import { useEffect,useState } from "react";
import { toast } from "sonner";

interface UserItem {
  id: string;
  username: string;
  displayName: string;
  officialName?: string | null;
  avatarUrl: string | null;
  headline?: string | null;
  bio?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  points?: number;
  interests?: string[] | null;
  institution?: {
    id: string;
    name: string;
    state?: string | null;
    district?: string | null;
  } | null;
}

interface CollegeItem {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
  nirfRank?: number | null;
  logoUrl?: string | null;
  description?: string | null;
}

interface CommunityItem {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  category?: string | null;
}

type TabType = "ALL" | "PEOPLE" | "POSTS" | "COLLEGES" | "COMMUNITIES";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [loading, setLoading] = useState(false);
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});
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

  // Synchronize with URL query parameter changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Query search API
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults({ posts: [], colleges: [], users: [], communities: [] });
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = (await res.json()) as {
            posts?: FeedPost[];
            colleges?: CollegeItem[];
            users?: UserItem[];
            communities?: CommunityItem[];
          };

          if (!ignore) {
            setResults({
              posts: data.posts || [],
              colleges: data.colleges || [],
              users: data.users || [],
              communities: data.communities || [],
            });
          }
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 120);


    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.replace(`/app/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleFollowToggle(peerId: string, peerName: string) {
    setFollowedIds((prev) => {
      const nextState = !prev[peerId];
      if (nextState) {
        toast.success(`Connected with ${peerName}!`);
      }
      return { ...prev, [peerId]: nextState };
    });
  }

  const totalResults =
    results.users.length +
    results.posts.length +
    results.colleges.length +
    results.communities.length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* ─── LinkedIn / Twitter Hybrid Sticky Header ─── */}
      <header className="sticky top-0 z-40 bg-background/90 px-4 pt-3 pb-0 backdrop-blur-xl border-b border-border/30 space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="size-4.5" />
          </button>

          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students, posts, colleges, communities..."
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                const trimmed = val.trim();
                window.history.replaceState(
                  null,
                  "",
                  trimmed ? `/app/search?q=${encodeURIComponent(trimmed)}` : "/app/search"
                );
              }}
              autoFocus
              className="w-full h-10.5 pl-10 pr-9 rounded-full bg-muted/60 border border-transparent focus:border-border/80 focus:bg-background text-[13px] font-normal placeholder:text-muted-foreground/60 outline-none transition-all shadow-2xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  router.replace("/app/search");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 text-foreground flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </form>
        </div>

        {/* Filter Pills (LinkedIn + Twitter Style) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 pt-0.5">
          {[
            { id: "ALL", label: `All (${totalResults})` },
            { id: "PEOPLE", label: `People (${results.users.length})` },
            { id: "POSTS", label: `Posts (${results.posts.length})` },
            { id: "COLLEGES", label: `Colleges (${results.colleges.length})` },
            { id: "COMMUNITIES", label: `Communities (${results.communities.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0",
                  isActive
                    ? "bg-foreground text-background shadow-xs font-black"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Search Results Body ─── */}
      <div className="flex flex-col px-4 pt-3.5 gap-4">
        {loading ? (
          <FeedSkeleton />
        ) : query.trim() ? (
          <>
            {/* Results count banner */}
            <div className="text-[12px] font-semibold text-muted-foreground px-1">
              About {totalResults} {totalResults === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
            </div>

            {/* 1. LINKEDIN-STYLE PEOPLE (STUDENTS) RESULTS */}
            {(activeTab === "ALL" || activeTab === "PEOPLE") && results.users.length > 0 && (
              <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs divide-y divide-border/20">
                <div className="px-4 py-2.5 bg-muted/20 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>People ({results.users.length})</span>
                  </h3>
                </div>

                {results.users.map((user) => {
                  const isFollowed = Boolean(followedIds[user.id]);
                  const headline =
                    user.headline ||
                    (user.course && user.branch
                      ? `${user.course} ${user.branch}${user.year ? ` · Year ${user.year}` : ""}`
                      : null);

                  return (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3.5"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <Link href={`/@${user.username}`} className="shrink-0 group">
                          <Avatar className="size-13 border border-border/40">
                            <AvatarImage src={user.avatarUrl || ""} />
                            <AvatarFallback className="text-sm font-black bg-muted text-foreground">
                              {user.displayName[0]}
                            </AvatarFallback>
                          </Avatar>
                        </Link>

                        <div className="min-w-0 flex-1 space-y-1">
                          <Link href={`/@${user.username}`} className="group block">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[15px] font-black text-foreground group-hover:underline">
                                {user.displayName}
                              </span>
                              {(user.points || 0) >= 150 && (
                                <ShieldCheck className="size-4 text-[#1d9bf0] shrink-0" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                @{user.username}
                              </span>
                            </div>

                            {headline && (
                              <p className="text-xs font-medium text-foreground/90 line-clamp-1 pt-0.5">
                                {headline}
                              </p>
                            )}

                            {user.institution && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5 truncate">
                                <GraduationCap className="size-3 shrink-0" />
                                <span className="truncate">{user.institution.name}</span>
                                {user.institution.district && (
                                  <span>· {user.institution.district}, {user.institution.state}</span>
                                )}
                              </p>
                            )}
                          </Link>

                          {user.bio && (
                            <p className="text-xs text-muted-foreground line-clamp-2 pt-1 leading-relaxed">
                              {user.bio}
                            </p>
                          )}

                          {user.interests && user.interests.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {user.interests.slice(0, 3).map((interest) => (
                                <span
                                  key={interest}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/30"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Connect / Follow & Message */}
                      <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-1 sm:pt-0">
                        <Link
                          href={`/app/chat?userId=${user.id}`}
                          className="rounded-full border border-border/70 bg-transparent hover:bg-muted text-foreground text-xs font-black px-3.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="size-3.5" />
                          <span>Message</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleFollowToggle(user.id, user.displayName)}
                          className={cn(
                            "rounded-full px-4 py-1.5 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-2xs",
                            isFollowed
                              ? "border border-border/60 bg-transparent text-foreground hover:border-destructive/40 hover:text-destructive"
                              : "bg-foreground text-background hover:opacity-90"
                          )}
                        >
                          {isFollowed ? "Connected" : "Connect"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. COLLEGES RESULTS */}
            {(activeTab === "ALL" || activeTab === "COLLEGES") && results.colleges.length > 0 && (
              <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs divide-y divide-border/20">
                <div className="px-4 py-2.5 bg-muted/20">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <School className="size-3.5" />
                    <span>Colleges &amp; Universities ({results.colleges.length})</span>
                  </h3>
                </div>

                {results.colleges.map((col) => (
                  <Link
                    key={col.id}
                    href={`/app/college/${col.slug || col.id}`}
                    className="flex items-center justify-between gap-3.5 p-4 hover:bg-muted/20 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="size-12 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center text-foreground font-black text-sm shrink-0">
                        <School className="size-6 text-foreground/80" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-[14px] font-black text-foreground group-hover:underline truncate">
                          {col.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="size-3 shrink-0" />
                          <span>{col.district ? `${col.district}, ` : ""}{col.state}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {col.nirfRank && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          NIRF #{col.nirfRank}
                        </span>
                      )}
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground hidden sm:inline">
                        View Hub →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* 3. COMMUNITIES RESULTS */}
            {(activeTab === "ALL" || activeTab === "COMMUNITIES") && results.communities.length > 0 && (
              <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs divide-y divide-border/20">
                <div className="px-4 py-2.5 bg-muted/20">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Hash className="size-3.5" />
                    <span>Communities &amp; Sub-Hubs ({results.communities.length})</span>
                  </h3>
                </div>

                {results.communities.map((c) => (
                  <Link
                    key={c.id}
                    href={`/app/communities/${c.slug || c.id}`}
                    className="flex items-center justify-between gap-3.5 p-4 hover:bg-muted/20 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="size-11 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center text-foreground font-black text-sm shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-[14px] font-black text-foreground group-hover:underline truncate">
                          c/{c.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {c.description || "Student community hub"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-foreground text-background text-xs font-black px-3.5 py-1.5 shrink-0">
                      Join
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* 4. POSTS RESULTS */}
            {(activeTab === "ALL" || activeTab === "POSTS") && results.posts.length > 0 && (
              <div className="space-y-3">
                <div className="px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MessageCircle className="size-3.5" />
                    <span>Posts &amp; Confessions ({results.posts.length})</span>
                  </h3>
                </div>
                {results.posts.map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* 5. ZERO RESULTS STATE */}
            {totalResults === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 border border-border/40 rounded-2xl bg-card p-8">
                <p className="text-base font-black text-foreground">
                  No results found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Check your spelling or try searching for a student name, college, or topic.
                </p>
              </div>
            )}
          </>
        ) : (
          /* DEFAULT SUGGESTIONS */
          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-3.5 shadow-xs">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="size-3.5 text-primary" />
              <span>Popular Campus Searches</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Shaswat",
                "BIT Mesra",
                "IIT Bombay",
                "BITS Pilani",
                "#PlacementSeason",
                "#EndSemExams",
                "Confessions",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    router.replace(`/app/search?q=${encodeURIComponent(s)}`);
                  }}
                  className="rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-foreground hover:text-background transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
