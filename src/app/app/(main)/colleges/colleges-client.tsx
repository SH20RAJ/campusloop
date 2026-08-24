"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  School,
  Plus,
  Flame,
  Trophy,
  Sparkles,
  X,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetcher } from "@/lib/api";
import { CollegeHubCard, CollegeItem } from "@/components/colleges/college-hub-card";
import { AddCollegeModal } from "@/components/colleges/add-college-modal";

const CATEGORY_FILTERS = [
  { id: "ALL", label: "All 1,350+ Hubs", icon: School },
  { id: "TRENDING", label: "🔥 Trending", icon: Flame },
  { id: "IIT_NIT", label: "🏛️ IITs & NITs", icon: Trophy },
  { id: "NIRF", label: "⚡ NIRF Top 100", icon: Sparkles },
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

const FEATURED_CAMPUSES: CollegeItem[] = [
  {
    id: "inst_35df75700bb23dd30311ef5f",
    slug: "bitmesra",
    name: "Birla Institute of Technology, Mesra",
    state: "Jharkhand",
    district: "Ranchi",
    website: "https://bitmesra.ac.in",
    yearOfEstablishment: 1955,
    aisheCode: "U-0202",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/d2/Birla_Institute_of_Technology_Mesra.png",
    bannerUrl: "https://bitmesra.ac.in/UploadedDocuments/user_pratyush_869/Header/Header4b13a61283f54f04a30eed41dfa3f4dd_1600x520px%20webbanner%20rankings.jpg",
    nirfRank: 53,
    description: "Deemed research university in Ranchi, Jharkhand across 780 acres.",
  },
  {
    id: "inst_iitdelhi",
    slug: "iitdelhi",
    name: "Indian Institute of Technology, Delhi",
    state: "Delhi",
    district: "New Delhi",
    website: "https://iitd.ac.in",
    yearOfEstablishment: 1961,
    aisheCode: "U-0100",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg",
    bannerUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80",
    nirfRank: 2,
    description: "Premier autonomous engineering institute located in Hauz Khas.",
  },
  {
    id: "inst_c2f49cc2f6241d101ae06a00",
    slug: "bitspilani",
    name: "Birla Institute of Technology & Science, Pilani",
    state: "Rajasthan",
    district: "Pilani",
    website: "https://bits-pilani.ac.in",
    yearOfEstablishment: 1964,
    aisheCode: "U-0391",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg",
    bannerUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
    nirfRank: 25,
    description: "Premier private deemed university renowned for meritocracy and zero attendance policy.",
  },
];

export default function CollegesClient() {
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
    <main className="mx-auto flex w-full max-w-5xl flex-col min-h-screen px-3 sm:px-6 pt-4 pb-24 space-y-6 select-none">
      {/* ─── Hero Spotlight Header (College Vibes Brand Aesthetic) ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-4">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 size-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 size-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="size-3" /> 1,350+ Accredited Indian Campuses
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
              Never miss what matters across Indian colleges.
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore authentic student confessions, canteen debates, placement realities, and campus leaderboards.
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 text-xs font-bold rounded-2xl bg-primary text-primary-foreground gap-2 cursor-pointer shadow-md hover:bg-primary/90 transition-all shrink-0 self-start sm:self-center"
          >
            <Plus className="size-4" /> Request Campus (+50 LP)
          </Button>
        </div>

        {/* Hero Search Bar with Instant Debounce */}
        <div className="relative pt-2">
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
      </div>

      {/* ─── Featured / Trending Campuses Ribbon ─── */}
      {!search && selectedCategory === "ALL" && selectedState === "ALL" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Flame className="size-4 text-rose-500" /> Featured &amp; High-Activity Campus Hubs
            </h2>
            <span className="text-[11px] font-semibold text-primary">Top Verified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {FEATURED_CAMPUSES.map((college) => (
              <CollegeHubCard key={college.id} college={college} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Filter Pills & State Selectors ─── */}
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

      {/* ─── Campus Hubs Grid (2/3-Column Wide Layout) ─── */}
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

      {/* ─── Aspirants Reality Guide Footer CTA ─── */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-purple-600/10 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center justify-center sm:justify-start gap-1">
            <Sparkles className="size-3" /> JEE &amp; NEET Aspirants Reality Desk
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
