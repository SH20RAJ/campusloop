"use client";

import { useState, useEffect } from "react";
import { Search, School, Sparkles, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetcher } from "@/lib/api";
import { CollegeHubCard, CollegeItem } from "@/components/colleges/college-hub-card";
import { AddCollegeModal } from "@/components/colleges/add-college-modal";

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
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");
  const [page, setPage] = useState(1);
  const [colleges, setColleges] = useState<CollegeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

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
        url.searchParams.set("limit", "120");
        if (search.trim()) url.searchParams.set("q", search.trim());
        if (selectedState !== "ALL") url.searchParams.set("state", selectedState);

        const data = await fetcher<{ colleges: CollegeItem[]; hasMore: boolean }>(url.toString());
        if (!ignore) {
          setColleges(data.colleges || []);
          setHasMore(data.hasMore || false);
        }
      } catch (err) {
        console.error("Failed to load colleges:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = setTimeout(() => fetchColleges(), 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, selectedState, page]);

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

      toast.success("College request submitted successfully!");
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
    <main className="mx-auto flex w-full max-w-4xl flex-col min-h-screen px-4 pt-4 pb-24 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <School className="size-5 text-primary" />
            Campus Directory
          </h1>
          <p className="text-xs text-muted-foreground">Find & join your college hub</p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="h-9 px-3 text-xs font-semibold rounded-xl bg-primary text-primary-foreground gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="size-4" /> Request Campus Hub
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search 1,350+ colleges by name, city, or state..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10 h-10 rounded-xl border border-border/60 bg-card text-xs focus:border-primary"
        />
      </div>

      {/* Popular State Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {POPULAR_STATES.map((st) => (
          <button
            key={st}
            onClick={() => {
              setSelectedState(st);
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
              selectedState === st
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* College Hubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : colleges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {colleges.map((col) => (
            <CollegeHubCard key={col.id} college={col} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/50 space-y-2">
          <School className="size-8 text-muted-foreground/60 mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No college hubs found</h3>
          <p className="text-xs text-muted-foreground">Try adjusting your search query or state filter.</p>
        </div>
      )}

      {/* Add College Modal */}
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
        submitting={submitting}
        onSubmit={handleAddCollege}
      />
    </main>
  );
}
