"use client";

import { AddCollegeModal } from "@/components/colleges/add-college-modal";
import { CollegeHubCard,CollegeItem } from "@/components/colleges/college-hub-card";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api";
import {
ArrowRight,
Award,
Building2,
ChevronRight,
Crown,
Flame,
Plus,
School,
Search,
Trophy,
X,
Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { toast } from "sonner";

const CATEGORY_FILTERS = [
  { id: "ALL", label: "All 1,350+ Hubs", icon: School },
  { id: "TRENDING", label: "🔥 Trending", icon: Flame },
  { id: "IIT_NIT", label: "🏛️ IITs & NITs", icon: Trophy },
  { id: "NIRF", label: "⚡ NIRF Top 100", icon: Zap },
  { id: "CENTRAL", label: "🎓 Central & Deemed", icon: Building2 },
];

const POPULAR_STATES = [
  "ALL",
  "Jharkhand",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Punjab",
  "Kerala",
];

const TOP_LEADERBOARD_COLLEGES = [
  {
    rank: 1,
    id: "inst_35df75700bb23dd30311ef5f",
    slug: "bitmesra",
    name: "Birla Institute of Technology, Mesra",
    location: "Ranchi, Jharkhand",
    points: 10543,
    students: 21,
    discussions: 17,
    nirf: 53,
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/d2/Birla_Institute_of_Technology_Mesra.png",
    bannerUrl: "https://bitmesra.ac.in/UploadedDocuments/user_pratyush_869/Header/Header4b13a61283f54f04a30eed41dfa3f4dd_1600x520px%20webbanner%20rankings.jpg",
  },
  {
    rank: 2,
    id: "inst_iitdelhi",
    slug: "iitdelhi",
    name: "Indian Institute of Technology, Delhi",
    location: "New Delhi, Delhi",
    points: 8420,
    students: 19,
    discussions: 14,
    nirf: 2,
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg",
    bannerUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80",
  },
  {
    rank: 3,
    id: "inst_c2f49cc2f6241d101ae06a00",
    slug: "bitspilani",
    name: "Birla Institute of Technology & Science, Pilani",
    location: "Pilani, Rajasthan",
    points: 7910,
    students: 16,
    discussions: 12,
    nirf: 25,
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg",
    bannerUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    rank: 4,
    id: "inst_iitb",
    slug: "iitb",
    name: "Indian Institute of Technology, Bombay",
    location: "Powai, Mumbai",
    points: 6850,
    students: 15,
    discussions: 11,
    nirf: 3,
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/1/1d/IIT_Bombay_Logo.svg",
  },
  {
    rank: 5,
    id: "inst_dtu",
    slug: "dtu",
    name: "Delhi Technological University",
    location: "Rohini, Delhi",
    points: 5420,
    students: 12,
    discussions: 9,
    nirf: 29,
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/b5/DTU%2C_Delhi_official_logo.png",
  },
];

export default function CollegesClient() {
  const [activeTab, setActiveTab] = useState<"directory" | "leaderboard">("directory");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");
  const [page, setPage] = useState(1);
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState("");
  const [newCollegeState, setNewCollegeState] = useState("");
  const [newCollegeDistrict, setNewCollegeDistrict] = useState("");
  const [newCollegeWebsite, setNewCollegeWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchColleges() {
      setLoading(true);
      try {
        const url = new URL("/api/colleges", window.location.origin);
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", "60");
        if (search.trim()) url.searchParams.set("q", search.trim());
        if (selectedState !== "ALL") url.searchParams.set("state", selectedState);

        const data = await fetcher<{ colleges: CollegeItem[]; hasMore: boolean }>(url.toString());
        if (!ignore) {
          setColleges(data.colleges || []);
        }
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = setTimeout(() => fetchColleges(), 200);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, selectedState, page]);

  // Client-side category filtering
  const filteredColleges = useMemo(() => {
    if (selectedCategory === "ALL") return colleges;
    if (selectedCategory === "TRENDING") {
      return colleges.filter(
        (c) =>
          c.slug === "bitmesra" ||
          c.slug?.includes("iit") ||
          c.slug?.includes("nit") ||
          c.slug?.includes("bits") ||
          c.nirfRank
      );
    }
    if (selectedCategory === "IIT_NIT") {
      return colleges.filter(
        (c) =>
          c.name.toLowerCase().includes("indian institute of technology") ||
          c.name.toLowerCase().includes("national institute of technology") ||
          c.name.toLowerCase().includes("iit") ||
          c.name.toLowerCase().includes("nit")
      );
    }
    if (selectedCategory === "NIRF") {
      return colleges.filter((c) => c.nirfRank !== null && c.nirfRank !== undefined);
    }
    if (selectedCategory === "CENTRAL") {
      return colleges.filter(
        (c) =>
          c.name.toLowerCase().includes("university") ||
          c.name.toLowerCase().includes("institute of technology")
      );
    }
    return colleges;
  }, [colleges, selectedCategory]);

  async function handleAddCollege(e: React.FormEvent) {
    e.preventDefault();
    if (!newCollegeName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCollegeName,
          state: newCollegeState,
          district: newCollegeDistrict,
          website: newCollegeWebsite,
        }),
      });

      if (!res.ok) throw new Error("Failed to add college");

      toast.success("Campus Hub request submitted! (+50 LP reward credited) 🚀");
      setShowAddModal(false);
      setNewCollegeName("");
      setNewCollegeState("");
      setNewCollegeDistrict("");
      setNewCollegeWebsite("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add college");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col min-h-screen px-3 sm:px-6 pt-4 pb-28 space-y-6 select-none">
      {/* ─── Hero Spotlight Header (College Vibes Aesthetic) ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-4">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 size-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 size-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary border border-primary/20">
              <Zap className="size-3" /> 1,350+ Accredited Indian Campuses
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
              Never miss what matters across Indian colleges.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore student confessions, canteen debates, placement realities, and inter-college rankings.
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 text-xs font-bold rounded-2xl bg-primary text-primary-foreground gap-2 cursor-pointer shadow-md hover:bg-primary/90 transition-all shrink-0 self-start sm:self-center"
          >
            <Plus className="size-4" /> Request Campus (+50 LP)
          </Button>
        </div>

        {/* View Switcher: Directory vs National Leaderboard */}
        <div className="relative z-10 flex items-center gap-2 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "directory"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <School className="size-3.5" />
            <span>Campus Directory (1,350+)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "leaderboard"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="size-3.5 text-amber-400" />
            <span>🏆 National Campus Leaderboard</span>
          </button>
        </div>

        {/* Hero Search Bar with Instant Debounce */}
        {activeTab === "directory" && (
          <div className="relative pt-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search 1,350+ colleges by name, acronym (BIT, IIT, NIT), city, or NIRF rank..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-12 pl-11 pr-10 rounded-2xl border border-border/80 bg-background/80 backdrop-blur-md text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── TAB 1: CAMPUS DIRECTORY ─── */}
      {activeTab === "directory" && (
        <>
          {/* Category Pills & State Selectors */}
          <div className="space-y-3">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {CATEGORY_FILTERS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* State Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-black uppercase text-muted-foreground/80 pl-1 shrink-0">
                State:
              </span>
              {POPULAR_STATES.map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedState(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedState === st
                      ? "bg-foreground text-background border-foreground font-bold"
                      : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
                  }`}
                >
                  {st === "ALL" ? "All India" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Campus Hubs Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{filteredColleges.length}</strong> campus hubs
                {selectedState !== "ALL" ? ` in ${selectedState}` : ""}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl border border-border/60 bg-card p-4 animate-pulse space-y-3"
                  >
                    <div className="h-20 bg-muted/60 rounded-xl" />
                    <div className="h-4 w-3/4 bg-muted/60 rounded" />
                    <div className="h-3 w-1/2 bg-muted/40 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredColleges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredColleges.map((college) => (
                  <CollegeHubCard key={college.id} college={college} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border/80 bg-card p-12 text-center space-y-4">
                <div className="size-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <School className="size-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">No campus hubs found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Can&apos;t find your college? Submit a quick request and we will index it within 24 hours.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="h-9 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground gap-1.5 cursor-pointer"
                >
                  <Plus className="size-3.5" /> Request &amp; Index College (+50 LP)
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── TAB 2: NATIONAL CAMPUS LEADERBOARD & PODIUM ─── */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top 3 National Podium */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 space-y-5 shadow-sm">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 flex items-center justify-center gap-1.5">
                <Crown className="size-4" /> All-India Campus Clout Standings
              </span>
              <h2 className="text-xl font-black text-foreground">
                India&apos;s Most Active Student Networks
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Ranked live by student engagement, verified batchmate enrollments, and active campus threads.
              </p>
            </div>

            {/* Podium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {TOP_LEADERBOARD_COLLEGES.slice(0, 3).map((col, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                return (
                  <Link
                    key={col.id}
                    href={`/app/college/${col.slug}`}
                    className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                      isFirst
                        ? "bg-gradient-to-b from-amber-500/15 via-card to-card border-amber-500/40 shadow-lg md:order-2 md:-mt-2"
                        : isSecond
                        ? "bg-card border-border/80 shadow-xs md:order-1"
                        : "bg-card border-border/80 shadow-xs md:order-3"
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`size-8 rounded-full flex items-center justify-center font-black text-xs shadow-xs ${
                          isFirst
                            ? "bg-amber-500 text-white"
                            : isSecond
                            ? "bg-slate-300 text-slate-900"
                            : "bg-amber-700 text-white"
                        }`}
                      >
                        #{col.rank}
                      </span>
                      {col.nirf && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          NIRF #{col.nirf}
                        </span>
                      )}
                    </div>

                    {/* College Emblem & Name */}
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-xl bg-card border border-border shadow-xs p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {col.logoUrl ? (
                          <img
                            src={col.logoUrl}
                            alt={col.name}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <School className="size-6 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-foreground line-clamp-2 leading-tight">
                          {col.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">{col.location}</p>
                      </div>
                    </div>

                    {/* Stats Metric */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-center">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground block">LP Score</span>
                        <span className="text-xs font-black text-primary">{col.points.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground block">Students</span>
                        <span className="text-xs font-black text-foreground">{col.students}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground block">Threads</span>
                        <span className="text-xs font-black text-foreground">{col.discussions}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Full Standings List */}
          <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Award className="size-4 text-primary" /> Top Campus Clout Leaderboard
              </h3>
              <span className="text-[11px] text-muted-foreground">Updated Live</span>
            </div>

            <div className="divide-y divide-border">
              {TOP_LEADERBOARD_COLLEGES.map((col) => (
                <Link
                  key={col.id}
                  href={`/app/college/${col.slug}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-sm font-black text-muted-foreground w-6 text-center group-hover:text-primary transition-colors">
                      #{col.rank}
                    </span>

                    <div className="size-10 rounded-xl bg-card border border-border shadow-xs p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      {col.logoUrl ? (
                        <img
                          src={col.logoUrl}
                          alt={col.name}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <School className="size-5 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {col.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground truncate">{col.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-black text-primary block">
                        {col.points.toLocaleString()} LP
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {col.students} enrolled • {col.discussions} threads
                      </span>
                    </div>

                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Aspirants Reality Guide Footer CTA ─── */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-purple-600/10 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center justify-center sm:justify-start gap-1">
            <Zap className="size-3" /> JEE &amp; NEET Aspirants Reality Desk
          </span>
          <h4 className="text-sm font-black text-foreground">
            Looking for genuine hostel tea, placement truth, and fest vibes?
          </h4>
          <p className="text-xs text-muted-foreground">
            Explore verified senior answer scorecards without promotional marketing bias.
          </p>
        </div>

        <Link
          href="/app/college/bitmesra"
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
        >
          <span>Explore BIT Mesra Hub</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Add College Modal */}
      {showAddModal && (
        <AddCollegeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          newCollegeName={newCollegeName}
          setNewCollegeName={setNewCollegeName}
          newCollegeState={newCollegeState}
          setNewCollegeState={setNewCollegeState}
          newCollegeDistrict={newCollegeDistrict}
          setNewCollegeDistrict={setNewCollegeDistrict}
          newCollegeWebsite={newCollegeWebsite}
          setNewCollegeWebsite={setNewCollegeWebsite}
          onSubmit={handleAddCollege}
          submitting={submitting}
        />
      )}
    </main>
  );
}
