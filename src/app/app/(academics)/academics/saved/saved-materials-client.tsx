"use client";

import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileQuestion,
  FileText,
  FlaskConical,
  GraduationCap,
  HardDrive,
  Layers,
  Loader2,
  Plus,
  School,
  Search,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { AcademicAiStudyBar } from "@/components/academics/academic-ai-study-bar";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AcademicResourceItem {
  id: string;
  title: string;
  description?: string | null;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  resourceType: string;
  moduleOrChapter?: string | null;
  fileUrl?: string | null;
  driveUrl?: string | null;
  viewsCount: number;
  downloadsCount: number;
  upvotesCount: number;
  savedSemester?: number;
  savedAt?: string;
  institution?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

const MATERIAL_TYPES = [
  { id: "ALL", label: "All Formats" },
  { id: "NOTES", label: "Notes", icon: BookOpen },
  { id: "PYQ", label: "PYQs", icon: FileQuestion },
  { id: "CHEAT_SHEET", label: "Cheat Sheets", icon: Zap },
  { id: "LAB_MANUAL", label: "Lab Manuals", icon: FlaskConical },
] as const;

export function SavedMaterialsClient() {
  const router = useRouter();
  const { profile } = useProfile();
  const [selectedSemester, setSelectedSemester] = useState<number | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [savingPackSem, setSavingPackSem] = useState<number | null>(null);

  const { data, error, isLoading, mutate } = useSWR<{
    items: AcademicResourceItem[];
    total: number;
    bySemester: Record<number, AcademicResourceItem[]>;
    availableSemesters: number[];
  }>("/api/academics/saved", fetcher);

  const savedItems = data?.items || [];
  const availableSemesters = data?.availableSemesters || [1, 2, 3, 4, 5, 6, 7, 8];

  // Auto-organize filtered items by subject
  const filteredItems = useMemo(() => {
    return savedItems.filter((item) => {
      const matchSem =
        selectedSemester === "ALL" || (item.savedSemester || item.semester) === selectedSemester;
      const matchType = selectedType === "ALL" || item.resourceType === selectedType;
      const matchQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSem && matchType && matchQuery;
    });
  }, [savedItems, selectedSemester, selectedType, searchQuery]);

  // Group by Subject Code
  const groupedBySubject = useMemo(() => {
    const groups: Record<
      string,
      { code: string; name: string; semester: number; items: AcademicResourceItem[] }
    > = {};

    for (const item of filteredItems) {
      const code = item.subjectCode || "GENERAL";
      if (!groups[code]) {
        groups[code] = {
          code,
          name: item.subjectName || code,
          semester: item.savedSemester || item.semester || 1,
          items: [],
        };
      }
      groups[code].items.push(item);
    }

    return Object.values(groups).sort((a, b) => a.code.localeCompare(b.code));
  }, [filteredItems]);

  async function handleRemove(id: string) {
    sounds.tap();
    haptics.light();
    try {
      const res = await fetch(`/api/academics/${id}/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UNSAVE" }),
      });
      if (res.ok) {
        toast.success("Removed from semester locker");
        mutate(
          (prev) =>
            prev
              ? {
                  ...prev,
                  items: prev.items.filter((i) => i.id !== id),
                  total: Math.max(0, prev.total - 1),
                }
              : prev,
          false
        );
      }
    } catch {
      toast.error("Failed to remove item");
    }
  }

  async function handleSaveSemesterPack(sem: number) {
    sounds.send();
    haptics.medium();
    setSavingPackSem(sem);

    try {
      const res = await fetch("/api/academics/saved/semester-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester: sem }),
      });
      const resData = (await res.json()) as any;

      if (res.ok && resData.success) {
        sounds.pop();
        haptics.success();
        toast.success(resData.message || `Saved Semester ${sem} pack to your locker!`);
        mutate();
      } else {
        toast.error(resData.message || "No materials found for this semester pack.");
      }
    } catch {
      toast.error("Network error while saving semester pack.");
    } finally {
      setSavingPackSem(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-28 select-none space-y-6">
      {/* ─── Top Header & Stats ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link
              href="/app/academics"
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Academic Vault</span>
            </Link>
            <span>/</span>
            <span className="text-foreground">Semester Locker</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <span>Saved Semester Locker</span>
            <span className="flex size-7 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <BookmarkCheck className="size-4" />
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Auto-organized cloud vault for all your course notes, PYQs, and cheat sheets. Study instantly on
            any device without filling phone storage.
          </p>
        </div>

        {/* Locker Stats Badge */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-300">
            <HardDrive className="size-4 text-purple-400 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black">{savedItems.length} Materials Saved</p>
              <p className="text-[10px] text-muted-foreground">0 MB phone storage used</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 1-Click "Save Semester Pack" Banner ─── */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs">
              <Zap className="size-3.5 text-amber-400 fill-amber-400" />
            </span>
            <h3 className="text-sm font-black text-white">1-Click Save Full Semester Pack</h3>
          </div>
          <p className="text-xs text-purple-200/70 max-w-md leading-relaxed">
            Need all study materials for your semester at once? Save the entire syllabus pack (Notes, PYQs,
            Formula Sheets) directly to your locker.
          </p>
        </div>

        {/* Quick Semester Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              type="button"
              disabled={savingPackSem !== null}
              onClick={() => handleSaveSemesterPack(sem)}
              className="px-2.5 py-1.5 rounded-xl border border-purple-500/40 bg-purple-900/40 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              title={`Save all materials for Semester ${sem}`}
            >
              {savingPackSem === sem ? <Loader2 className="size-3 animate-spin mx-auto" /> : `+ Sem ${sem}`}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Semester Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setSelectedSemester("ALL");
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border",
                selectedSemester === "ALL"
                  ? "bg-foreground text-background border-foreground shadow-xs"
                  : "bg-muted/30 text-muted-foreground border-border/40 hover:text-foreground"
              )}
            >
              All Semesters
            </button>

            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => {
                  sounds.tap();
                  setSelectedSemester(sem);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border",
                  selectedSemester === sem
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border/40 hover:text-foreground"
                )}
              >
                Sem {sem}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search saved materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-2xl border border-border/40 bg-muted/30 pl-9 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {MATERIAL_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  sounds.tap();
                  setSelectedType(type.id);
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0",
                  isSelected
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-xs"
                    : "bg-muted/20 text-muted-foreground border-border/40 hover:text-foreground"
                )}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Auto-Organized Subject Sections ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 rounded-3xl border border-border/30 bg-card/40 animate-pulse p-4 space-y-3"
            />
          ))}
        </div>
      ) : groupedBySubject.length > 0 ? (
        <div className="space-y-6">
          {groupedBySubject.map((group) => (
            <div
              key={group.code}
              className="rounded-3xl border border-border/40 bg-card/40 p-4 sm:p-5 space-y-3 shadow-xs"
            >
              {/* Subject Group Header */}
              <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary text-xs font-black uppercase tracking-wider">
                    {group.code}
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-foreground">{group.name}</h2>
                </div>

                <span className="text-[11px] font-bold text-muted-foreground">
                  Sem {group.semester} • {group.items.length} {group.items.length === 1 ? "file" : "files"}
                </span>
              </div>

              {/* Items in Subject Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 p-3.5 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase">
                          {item.resourceType}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove from locker"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-foreground line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      {item.moduleOrChapter && (
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {item.moduleOrChapter}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
                      <AcademicAiStudyBar
                        title={item.title}
                        subjectCode={item.subjectCode}
                        materialUrl={
                          item.fileUrl || item.driveUrl || `https://campusloop.space/app/academics/${item.id}`
                        }
                        pageUrl={`https://campusloop.space/app/academics/${item.id}`}
                        compact={true}
                      />

                      <Link
                        href={`/app/academics/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                      >
                        <span>Study</span>
                        <ChevronRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
          <div className="flex size-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mx-auto">
            <Bookmark className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-foreground">Your semester locker is empty</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bookmark notes and PYQs directly while exploring the Academic Vault, or click any of the
              semester pack buttons above to save your entire semester syllabus in one go.
            </p>
          </div>
          <Link
            href="/app/academics"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-black text-xs hover:bg-primary/90 transition-colors shadow-xs"
          >
            <span>Explore Academic Vault</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
