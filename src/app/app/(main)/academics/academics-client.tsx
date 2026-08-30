"use client";

import { BookOpen, FileCode2, FileText, Library, Plus, Search, X, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { AcademicCard } from "@/components/communities/academic-card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AcademicsClientProps {
  profileId: string;
}

const RESOURCE_TYPES = [
  { id: "all", label: "All Types", icon: Library },
  { id: "NOTES", label: "Lecture Notes", icon: FileText },
  { id: "PYQ", label: "PYQs & Papers", icon: BookOpen },
  { id: "CHEAT_SHEET", label: "Cheat Sheets", icon: Zap },
  { id: "LAB_MANUAL", label: "Lab Manuals", icon: FileCode2 },
] as const;

const BRANCHES = [
  "All",
  "Computer Science",
  "ECE",
  "Information Technology",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "BioTech",
] as const;

const SEMESTERS = [
  { id: "all", label: "All Sem" },
  { id: "1", label: "Sem 1" },
  { id: "2", label: "Sem 2" },
  { id: "3", label: "Sem 3" },
  { id: "4", label: "Sem 4" },
  { id: "5", label: "Sem 5" },
  { id: "6", label: "Sem 6" },
  { id: "7", label: "Sem 7" },
  { id: "8", label: "Sem 8" },
] as const;

export function AcademicsClient({ profileId }: AcademicsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");

  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("All");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "downloads" | "views">("latest");

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedType !== "all") params.set("resourceType", selectedType);
    if (selectedBranch !== "All") params.set("branch", selectedBranch);
    if (selectedSemester !== "all") params.set("semester", selectedSemester);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    params.set("sort", sortBy);
    return `/api/academics?${params.toString()}`;
  }, [selectedType, selectedBranch, selectedSemester, searchQuery, sortBy]);

  const { data, isLoading, mutate } = useSWR<{ items: any[] }>(apiUrl, fetcher, {
    dedupingInterval: 6000,
  });

  const items = data?.items || [];

  // Scroll to highlight element if present in query param
  useEffect(() => {
    if (highlightId && items.length > 0) {
      const el = document.getElementById(`academic-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightId, items]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28">
      {/* ─── Sticky Header & Omnibar Search ─── */}
      <header className="sticky top-0 z-40 flex flex-col gap-2.5 border-b border-border/30 bg-background/85 px-4 pt-3 pb-2 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              <BookOpen className="size-4.5 text-indigo-500" />
              <span>Academic Vault</span>
            </h1>
            <span className="text-xs text-muted-foreground font-medium">· Notes &amp; PYQs</span>
          </div>

          <Link
            href="/app/hub/new?type=academics"
            onClick={() => {
              sounds.tap();
              haptics.light();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="size-3.5 stroke-3" />
            <span>Upload Notes</span>
          </Link>
        </div>

        {/* Omnibar Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject code (CS201), topic, notes, or PYQ..."
            className="w-full h-10 rounded-2xl bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background pl-10 pr-9 text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* ─── Resource Types Filter Strip ─── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {RESOURCE_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setSelectedType(type.id);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95",
                  isSelected
                    ? "bg-indigo-600 text-white font-black shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40"
                )}
              >
                <Icon className="size-3.5" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Secondary Filter Bar (Branch, Semester, Sort) ─── */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Branch Dropdown */}
          <select
            value={selectedBranch}
            onChange={(e) => {
              sounds.tap();
              setSelectedBranch(e.target.value);
            }}
            className="h-8 rounded-xl bg-muted/40 border border-border/40 px-2.5 text-[11px] font-bold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "🎓 All Branches" : b}
              </option>
            ))}
          </select>

          {/* Semester Dropdown */}
          <select
            value={selectedSemester}
            onChange={(e) => {
              sounds.tap();
              setSelectedSemester(e.target.value);
            }}
            className="h-8 rounded-xl bg-muted/40 border border-border/40 px-2.5 text-[11px] font-bold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
          >
            {SEMESTERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id === "all" ? "📚 All Semesters" : s.label}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              sounds.tap();
              setSortBy(e.target.value as any);
            }}
            className="h-8 rounded-xl bg-muted/40 border border-border/40 px-2.5 text-[11px] font-bold text-muted-foreground hover:text-foreground outline-none cursor-pointer ml-auto"
          >
            <option value="latest">⏱️ Latest</option>
            <option value="popular">🔥 Most Upvoted</option>
            <option value="downloads">📥 Most Downloaded</option>
            <option value="views">👁️ Most Viewed</option>
          </select>
        </div>
      </header>

      {/* ─── Academic Resources Feed ─── */}
      <section className="divide-y divide-border/20">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <AcademicCard
              key={item.id}
              item={item}
              currentUserId={profileId}
              isHighlighted={highlightId === item.id}
            />
          ))
        ) : (
          <div className="py-24 text-center px-4 space-y-3">
            <BookOpen className="size-10 text-muted-foreground/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No study resources found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Be the first to upload lecture notes, PYQs, or formula sheets for this branch and earn 15 LP!
              </p>
            </div>
            <Link
              href="/app/hub/new?type=academics"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Upload First Notes</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
