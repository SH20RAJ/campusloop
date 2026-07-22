"use client";

import { useState, useEffect } from "react";
import { Search, School, MapPin, ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal, Plus, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CollegeItem {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
  website: string | null;
  yearOfEstablishment: number | null;
  aisheCode: string;
}

const POPULAR_STATES = [
  "ALL",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
];

export default function CollegesClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");
  const [page, setPage] = useState(1);
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  // Add College Modal State
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
        url.searchParams.set("limit", "12");
        if (search.trim()) url.searchParams.set("q", search.trim());
        if (selectedState !== "ALL") url.searchParams.set("state", selectedState);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = (await res.json()) as { colleges: CollegeItem[]; hasMore: boolean };
          if (!ignore) {
            setColleges(data.colleges || []);
            setHasMore(data.hasMore || false);
          }
        }
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchColleges();
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, selectedState, page]);

  async function handleAddCollege(e: React.FormEvent) {
    e.preventDefault();
    if (!newCollegeName.trim()) {
      toast.error("Please enter your college name");
      return;
    }

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

      if (!res.ok) {
        throw new Error("Failed to add college");
      }

      const created = (await res.json()) as CollegeItem;
      toast.success("College added successfully! Welcome to your new campus hub 🚀");
      setShowAddModal(false);
      setNewCollegeName("");
      setNewCollegeState("");
      setNewCollegeDistrict("");
      setNewCollegeWebsite("");

      router.push(`/app/college/${created.slug || created.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Error adding college. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col min-h-screen pb-20 px-4 pt-6 gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <School className="size-5" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Campus Directory <span className="text-primary font-medium text-xs ml-1">(1,350+ Colleges)</span>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            Search and explore verified higher education institutions across India. Can&apos;t find your college? Add it in 1-click!
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white h-9 px-4 text-xs font-bold shadow-sm shadow-primary/20 hover:opacity-95 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="size-4" /> Add Missing College
        </button>
      </div>

      {/* Search Input & State Filter Pills */}
      <div className="space-y-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by college name, AISHE code, city, or state..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-11 text-xs rounded-xl bg-card border-border/80 shadow-sm focus-visible:ring-primary"
          />
        </div>

        {/* State Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="size-3" /> State:
          </span>
          {POPULAR_STATES.map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedState(st);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-lg border transition-all shrink-0 cursor-pointer",
                selectedState === st
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Colleges Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-border bg-card/60 shimmer-effect" />
          ))}
        </div>
      ) : colleges.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((col) => (
              <Link key={col.id} href={`/app/college/${col.slug || col.id}`}>
                <div className="group h-full flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                        <School className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {col.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="size-3 shrink-0" />
                          {col.district ? `${col.district}, ` : ""}{col.state || "India"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/40 mt-3 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                    <span>AISHE: {col.aisheCode}</span>
                    {col.yearOfEstablishment && <span>Est. {col.yearOfEstablishment}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-bold gap-1 cursor-pointer"
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <span className="text-xs font-bold text-muted-foreground">
              Page {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs font-bold gap-1 cursor-pointer"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-3xl border-border bg-card/40 p-6 space-y-3">
          <Sparkles className="size-8 text-muted-foreground/40" />
          <h3 className="text-sm font-bold text-foreground">No colleges found matching "{search}"</h3>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Can&apos;t find your campus in our database? You can add your college right now!
          </p>
          <button
            onClick={() => {
              setNewCollegeName(search);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white h-9 px-4 text-xs font-bold shadow-sm cursor-pointer mt-2"
          >
            <Plus className="size-4" /> Add "{search || "Your College"}"
          </button>
        </div>
      )}

      {/* Add Missing College Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <School className="size-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Add Your College</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddCollege} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">College / University Name *</label>
                <Input
                  type="text"
                  placeholder="e.g. St. Xavier's College, Mumbai"
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">State</label>
                  <Input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    value={newCollegeState}
                    onChange={(e) => setNewCollegeState(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">District / City</label>
                  <Input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={newCollegeDistrict}
                    onChange={(e) => setNewCollegeDistrict(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Website (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. xaviers.edu"
                  value={newCollegeWebsite}
                  onChange={(e) => setNewCollegeWebsite(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 text-xs font-bold h-10 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 text-xs font-bold h-10 rounded-xl bg-primary text-white cursor-pointer"
                >
                  {submitting ? "Adding..." : "Create Campus Hub"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
