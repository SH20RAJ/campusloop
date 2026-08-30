"use client";

import { AddCollegeModal } from "@/components/colleges/add-college-modal";
import { CollegeHubRow, type CollegeItem } from "@/components/colleges/college-hub-row";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Building2, Flame, Plus, School, Search, Trophy, X, Zap } from "lucide-react";
import { useEffect,useMemo,useState } from "react";
import { toast } from "sonner";

const CATEGORY_FILTERS = [
  { id: "ALL", label: "All", icon: School },
  { id: "TRENDING", label: "Trending", icon: Flame },
  { id: "IIT_NIT", label: "IITs & NITs", icon: Trophy },
  { id: "NIRF", label: "NIRF Top 100", icon: Zap },
  { id: "CENTRAL", label: "Central & Deemed", icon: Building2 },
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


  const tabs = [
    { id: "directory" as const, label: "Directory" },
    { id: "leaderboard" as const, label: "Leaderboard" },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl select-none flex-col border-x border-border/20 pb-28">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 px-4 py-3.5">
          <div className="min-w-0">
            <h1 className="text-lg font-black tracking-tight text-foreground">Colleges</h1>
            <p className="truncate text-[13px] text-muted-foreground">
              Campus hubs across India
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-95"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Request campus</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Equal-width underline tabs, matching the feed */}
        <div className="flex items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex-1 cursor-pointer py-3 text-[14px] font-bold transition-colors",
                  isActive
                    ? "font-black text-foreground"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Directory ─── */}
      {activeTab === "directory" && (
        <>
          {/* Search */}
          <div className="border-b border-border/30 px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, city or NIRF rank"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-full border border-border/60 bg-muted/30 pl-10 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-2 border-b border-border/30 px-4 py-3">
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              {CATEGORY_FILTERS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                      isSelected
                        ? "bg-foreground font-black text-background"
                        : "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              {POPULAR_STATES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedState(st);
                    setPage(1);
                  }}
                  className={cn(
                    "shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                    selectedState === st
                      ? "bg-foreground font-black text-background"
                      : "border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {st === "ALL" ? "All India" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-3.5 px-4 py-3.5">
                  <div className="size-11 shrink-0 rounded-full bg-muted/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 rounded bg-muted/60" />
                    <div className="h-2.5 w-1/3 rounded bg-muted/40" />
                  </div>
                </div>
              ))
            ) : filteredColleges.length > 0 ? (
              <>
                <p className="px-4 py-2.5 text-[13px] text-muted-foreground">
                  <strong className="font-black text-foreground">
                    {filteredColleges.length}
                  </strong>{" "}
                  {filteredColleges.length === 1 ? "campus" : "campuses"}
                  {selectedState !== "ALL" ? ` in ${selectedState}` : ""}
                </p>
                {filteredColleges.map((college) => (
                  <CollegeHubRow key={college.id} college={college} />
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
                <School className="size-8 text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="text-[15px] font-bold text-foreground">No campuses found</h3>
                  <p className="text-[13px] text-muted-foreground">
                    Can&apos;t find your college? Request it and we&apos;ll index it.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-1 cursor-pointer rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Request campus
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Leaderboard ─── */}
      {activeTab === "leaderboard" && (
        <div className="divide-y divide-border/30">
          <p className="px-4 py-3 text-[13px] text-muted-foreground">
            Ranked by student engagement, verified enrolments and active threads.
          </p>

          {TOP_LEADERBOARD_COLLEGES.map((col) => (
            <CollegeHubRow
              key={col.id}
              rank={col.rank}
              college={{
                id: col.id,
                slug: col.slug,
                name: col.name,
                state: col.location,
                district: null,
                website: null,
                yearOfEstablishment: null,
                aisheCode: "",
                logoUrl: col.logoUrl,
                nirfRank: col.nirf,
              }}
              trailing={
                <>
                  <span className="block text-[13px] font-black text-primary tabular-nums">
                    {col.points.toLocaleString("en-IN")} LP
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {col.students} enrolled
                  </span>
                </>
              }
            />
          ))}
        </div>
      )}

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
