"use client";

import {
  Building2,
  ChevronRight,
  Compass,
  GraduationCap,
  Loader2,
  MessageSquare,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
  Users,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FeedCard } from "@/components/ui/feed-card";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const TRENDING_SEARCH_SUGGESTIONS = [
  "BIT Mesra",
  "Arman Night Canteen",
  "Confessions",
  "Hostel 10",
  "Placement Drives",
  "Bike Rentals",
  "Midsem Notes",
  "Coding Club",
];

export function SearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery || searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<
    "all" | "colleges" | "stores" | "posts" | "communities" | "users"
  >("all");
  const [, startTransition] = useTransition();

  const { data, isLoading } = useSWR<{
    posts: any[];
    colleges: any[];
    users: any[];
    communities: any[];
    merchants?: any[];
  }>(searchQuery.trim() ? `/api/search?q=${encodeURIComponent(searchQuery.trim())}` : null, fetcher, {
    dedupingInterval: 5000,
    keepPreviousData: true,
  });

  const posts = data?.posts || [];
  const colleges = data?.colleges || [];
  const users = data?.users || [];
  const communities = data?.communities || [];
  const merchants = data?.merchants || [];

  const totalResults = posts.length + colleges.length + users.length + communities.length + merchants.length;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    sounds.tap();
    haptics.light();
    startTransition(() => {
      router.push(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
    });
  }

  function handleSuggestionClick(term: string) {
    sounds.tap();
    haptics.light();
    setSearchQuery(term);
    startTransition(() => {
      router.push(`/app/search?q=${encodeURIComponent(term)}`);
    });
  }

  function handleCopyLink(url: string, label: string) {
    sounds.tap();
    haptics.light();
    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(fullUrl);
    toast.success(`${label} link copied to clipboard! 📋`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl min-h-screen border-x border-border/20 bg-background text-foreground pb-28 select-none">
      {/* ─── Search Input Bar ─── */}
      <header className="sticky top-0 z-30 border-b border-border/30 bg-background/85 px-4 py-3 backdrop-blur-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campuses, night canteens, confessions, students..."
            className="w-full h-11 pl-10 pr-10 rounded-2xl bg-muted/50 border border-border/60 text-xs font-bold text-foreground placeholder:text-muted-foreground focus:bg-background focus:border-foreground outline-none transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </form>

        {/* Trending Suggestions Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1 shrink-0 pr-1">
            <Zap className="size-3 text-amber-500" />
            <span>Popular:</span>
          </span>
          {TRENDING_SEARCH_SUGGESTIONS.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleSuggestionClick(term)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-card border border-border/60 hover:border-foreground/40 text-foreground transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        {searchQuery.trim() && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-border/20">
            {[
              { id: "all", label: `All (${totalResults})` },
              { id: "colleges", label: `Colleges (${colleges.length})` },
              { id: "stores", label: `Stores (${merchants.length})` },
              { id: "posts", label: `Threads (${posts.length})` },
              { id: "communities", label: `Communities (${communities.length})` },
              { id: "users", label: `Students (${users.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setActiveTab(tab.id as any);
                }}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                  activeTab === tab.id
                    ? "bg-foreground text-background font-black shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ─── Search Results Body ─── */}
      <main className="p-4 space-y-5">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs font-bold">Searching campus network &amp; directories...</p>
          </div>
        )}

        {!isLoading && !searchQuery.trim() && (
          <div className="text-center py-16 space-y-3">
            <div className="size-12 mx-auto rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
              <Compass className="size-6" />
            </div>
            <h2 className="text-sm font-black text-foreground">Explore Campus Network</h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Search for your college hub, campus night canteens, student confessions, clubs, or classmates.
            </p>
          </div>
        )}

        {!isLoading && searchQuery.trim() && totalResults === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="size-12 mx-auto rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
              <Search className="size-6" />
            </div>
            <h2 className="text-sm font-black text-foreground">
              No matches found for &ldquo;{searchQuery}&rdquo;
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Try searching with broader terms or browse the all-India campus directory.
            </p>
            <Link
              href="/app/colleges"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-black"
            >
              <span>Browse All Colleges</span>
            </Link>
          </div>
        )}

        {/* ─── 1. Campus Stores & Canteens Section ─── */}
        {(activeTab === "all" || activeTab === "stores") && merchants.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Store className="size-3.5 text-emerald-500" />
                <span>Campus Stores &amp; Canteens ({merchants.length})</span>
              </h2>
            </div>

            <div className="space-y-2.5">
              {merchants.map((merchant) => (
                <div
                  key={merchant.id}
                  className="p-4 rounded-3xl bg-card border border-border/50 hover:border-border transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                        <Store className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-foreground leading-none">{merchant.name}</h3>
                          <Badge
                            variant="outline"
                            className="text-[9px] text-emerald-500 border-emerald-500/30"
                          >
                            Verified Store
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {merchant.address} · Delivery ₹{merchant.deliveryFee || 20}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/app/marketplace/store/${merchant.id}`}
                      className="px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-black shrink-0 hover:opacity-90 flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ChevronRight className="size-3" />
                    </Link>
                  </div>

                  {/* Relative Sub-links under search result */}
                  <div className="pt-2 border-t border-border/30 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/app/marketplace/store/${merchant.id}`}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg"
                    >
                      <UtensilsCrossed className="size-3" />
                      <span>View Live Menu</span>
                    </Link>

                    <Link
                      href="/app/marketplace/checkout"
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg"
                    >
                      <ShoppingBag className="size-3" />
                      <span>Hostel Delivery</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(`/app/marketplace/store/${merchant.id}`, merchant.name)}
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg cursor-pointer ml-auto"
                    >
                      <Share2 className="size-3" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 2. Colleges & Campus Hubs Section ─── */}
        {(activeTab === "all" || activeTab === "colleges") && colleges.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                <span>Colleges &amp; Universities ({colleges.length})</span>
              </h2>
            </div>

            <div className="space-y-2.5">
              {colleges.map((college) => (
                <div
                  key={college.id}
                  className="p-4 rounded-3xl bg-card border border-border/50 hover:border-border transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <GraduationCap className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-foreground leading-none">{college.name}</h3>
                          <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {college.district ? `${college.district}, ` : ""}
                          {college.state || "India"} · Verified Campus Hub
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/app/college/${college.id}`}
                      className="px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-black shrink-0 hover:opacity-90 flex items-center gap-1"
                    >
                      <span>Hub</span>
                      <ChevronRight className="size-3" />
                    </Link>
                  </div>

                  {/* Relative Sub-links under College result */}
                  <div className="pt-2 border-t border-border/30 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/app/college/${college.id}`}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg"
                    >
                      <Building2 className="size-3" />
                      <span>Campus Feed</span>
                    </Link>

                    <Link
                      href="/app/confessions"
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg"
                    >
                      <span>🎭 Confessions</span>
                    </Link>

                    <Link
                      href="/app/marketplace"
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg"
                    >
                      <ShoppingBag className="size-3" />
                      <span>Stores &amp; Canteen</span>
                    </Link>

                    <Link
                      href="/app/communities"
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg"
                    >
                      <Users className="size-3" />
                      <span>Clubs</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(`/app/college/${college.id}`, college.name)}
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg cursor-pointer ml-auto"
                    >
                      <Share2 className="size-3" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 3. Student Communities Section ─── */}
        {(activeTab === "all" || activeTab === "communities") && communities.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="size-3.5 text-indigo-500" />
              <span>Student Communities ({communities.length})</span>
            </h2>

            <div className="space-y-2.5">
              {communities.map((community) => (
                <div
                  key={community.id}
                  className="p-4 rounded-3xl bg-card border border-border/50 hover:border-border transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-foreground">{community.name}</h3>
                      {community.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {community.description}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/app/communities/${community.id}`}
                      className="px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-black shrink-0 hover:opacity-90"
                    >
                      Join
                    </Link>
                  </div>

                  {/* Relative Sub-links under Community */}
                  <div className="pt-2 border-t border-border/30 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/app/communities/${community.id}`}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg"
                    >
                      <MessageSquare className="size-3" />
                      <span>Community Chat</span>
                    </Link>

                    <Link
                      href={`/app/communities/${community.id}`}
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg"
                    >
                      <span>🧵 Discussions</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(`/app/communities/${community.id}`, community.name)}
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg cursor-pointer ml-auto"
                    >
                      <Share2 className="size-3" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 4. Students & Profiles Section ─── */}
        {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="size-3.5 text-rose-500" />
              <span>Verified Students ({users.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-2xl bg-card border border-border/50 hover:border-border transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-border/40 shrink-0">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="text-xs font-bold bg-muted">
                        {user.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-foreground truncate">{user.displayName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">@{user.username}</p>
                      {user.institution?.name && (
                        <p className="text-[10px] text-primary truncate font-semibold">
                          {user.institution.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/30 flex items-center gap-2">
                    <Link
                      href={`/@${user.username}`}
                      className="flex-1 py-1 text-center rounded-lg bg-foreground text-background text-[11px] font-bold hover:opacity-90"
                    >
                      View Profile
                    </Link>
                    <Link
                      href="/app/chat"
                      className="px-2.5 py-1 rounded-lg bg-muted text-foreground text-[11px] font-bold hover:bg-muted/80"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 5. Posts & Confessions Section ─── */}
        {(activeTab === "all" || activeTab === "posts") && posts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-primary" />
              <span>Campus Threads &amp; Confessions ({posts.length})</span>
            </h2>

            <div className="space-y-3">
              {posts.map((post) => (
                <FeedCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
