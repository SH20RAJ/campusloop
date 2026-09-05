"use client";

import { BookOpen, Link2, Loader2, Plus, UploadCloud, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWRInfinite from "swr/infinite";
import { AcademicCard } from "@/components/communities/academic-card";
import { AnimateBookOpen, AnimateCheck, AnimatedIcon, AnimatePlus, AnimateSearch, AnimateZap } from "@/components/ui/animated-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { AcademicAuthBenefitsCard } from "@/components/academics/academic-auth-benefits-card";
import { AcademicAuthModal } from "@/components/academics/academic-auth-modal";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadMediaFile } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface AcademicsClientProps {
  profileId: string | null;
}

const RESOURCE_TYPES = [
  { id: "all", label: "All Types" },
  { id: "NOTES", label: "Lecture Notes 📝" },
  { id: "MODULE", label: "Module / Unit 📘" },
  { id: "BOOK", label: "Whole Book 📚" },
  { id: "PPT", label: "PPT / Slides 📊" },
  { id: "PYQ", label: "PYQs & Papers 📑" },
  { id: "CHEAT_SHEET", label: "Cheat Sheets ⚡" },
  { id: "LAB_MANUAL", label: "Lab Manuals 🔬" },
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
  "Management",
  "Pharmacy",
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
  const [scope, setScope] = useState<"campus" | "global">("campus");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "downloads" | "views">("latest");

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<"SAVE" | "VOTE" | "COMMENT" | "UPLOAD" | "AI">("UPLOAD");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formSubjectCode, setFormSubjectCode] = useState("");
  const [formSubjectName, setFormSubjectName] = useState("");
  const [formBranch, setFormBranch] = useState("Computer Science");
  const [formSemester, setFormSemester] = useState(1);
  const [formResourceType, setFormResourceType] = useState("NOTES");
  const [formModule, setFormModule] = useState("");
  const [formDriveUrl, setFormDriveUrl] = useState("");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formFileName, setFormFileName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && (!previousPageData.items?.length || !previousPageData.hasMore)) {
      return null;
    }
    const params = new URLSearchParams();
    if (selectedType !== "all") params.set("resourceType", selectedType);
    if (selectedBranch !== "All") params.set("branch", selectedBranch);
    if (selectedSemester !== "all") params.set("semester", selectedSemester);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    params.set("scope", scope);
    params.set("sort", sortBy);
    params.set("page", String(pageIndex + 1));
    params.set("limit", "15");
    return `/api/academics?${params.toString()}`;
  };

  const { data, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    totalPages: number;
  }>(getKey, fetcher, {
    revalidateFirstPage: false,
    dedupingInterval: 4000,
  });

  const items = useMemo(() => {
    return data ? data.flatMap((page) => page.items || []) : [];
  }, [data]);

  const totalCount = data?.[0]?.total ?? 0;
  const isInitialLoading = isLoading && items.length === 0;
  const isEmpty = !isLoading && items.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.hasMore);
  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined") || isValidating;

  // Infinite scroll observer
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoadingMore) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, setSize]);

  // Scroll to highlight element if present in query param
  useEffect(() => {
    if (highlightId && items.length > 0) {
      const el = document.getElementById(`academic-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightId, items]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    sounds.tap();
    haptics.medium();

    try {
      const res = await uploadMediaFile(file);
      if (res?.url) {
        setFormFileUrl(res.url);
        setFormFileName(file.name);
        toast.success(`File uploaded to Cloudflare R2: ${file.name} 🚀`);
      } else {
        toast.error("File upload failed. Try sharing a Google Drive link.");
      }
    } catch {
      toast.error("Upload error. Check connection.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formSubjectCode.trim() || !formSubjectName.trim()) {
      toast.error("Please provide Title, Subject Code, and Subject Name");
      return;
    }
    if (!formFileUrl && !formDriveUrl.trim()) {
      toast.error("Please upload a file or attach a Google Drive / Web link");
      return;
    }

    setIsSubmitting(true);
    sounds.send();
    haptics.medium();

    try {
      const res = await fetch("/api/academics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          subjectCode: formSubjectCode.trim(),
          subjectName: formSubjectName.trim(),
          branch: formBranch,
          semester: Number(formSemester),
          resourceType: formResourceType,
          moduleOrChapter: formModule.trim() || null,
          driveUrl: formDriveUrl.trim() || null,
          fileUrl: formFileUrl || null,
        }),
      });

      const json = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && json.success) {
        toast.success("Study resource shared! +20 Loop Points (LP) earned 🎉");
        setShowUploadModal(false);
        setFormTitle("");
        setFormSubjectCode("");
        setFormSubjectName("");
        setFormModule("");
        setFormDriveUrl("");
        setFormFileUrl("");
        setFormFileName("");
        setFormDescription("");
        mutate();
      } else {
        toast.error(json.error || "Failed to publish resource");
      }
    } catch {
      toast.error("Network error while publishing resource");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28 border-x border-border/30 bg-background">
      {/* ─── Sticky Twitter/X Header & Omnibar Search ─── */}
      <header className="sticky top-0 z-40 flex flex-col gap-2.5 border-b border-border/30 bg-background/85 px-4 pt-3 pb-1 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              <AnimatedIcon icon={AnimateBookOpen} animation="pop" size={18} className="text-primary" />
              <span>Academic Vault</span>
            </h1>
            <span className="text-xs text-muted-foreground font-medium">
              {totalCount > 0 ? `· ${totalCount.toLocaleString()} resources` : "· Notes, Books & PYQs"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!profileId) {
                setAuthModalReason("UPLOAD");
                setIsAuthModalOpen(true);
                return;
              }
              sounds.tap();
              haptics.light();
              setShowUploadModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <AnimatedIcon icon={AnimatePlus} animation="pop" size={13} />
            <span>Upload Notes</span>
          </button>
        </div>

        {/* Omnibar Search Input */}
        <div className="relative">
          <AnimatedIcon
            icon={AnimateSearch}
            animation="pop"
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject (CS201), topic, module, book, or PYQ..."
            className="w-full h-9.5 rounded-full bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background pl-10 pr-9 text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all text-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-4.5 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Guest conversion banner if not logged in */}
        {!profileId && (
          <AcademicAuthBenefitsCard returnTo="/app/academics" />
        )}

        {/* ─── Twitter-Style Sliding Tabs for Resource Types ─── */}
        <div className="flex border-b border-border/25 overflow-x-auto no-scrollbar pt-0.5">
          {RESOURCE_TYPES.map((type) => {
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
                  "relative pb-2.5 pt-1 px-3 text-xs font-bold transition-colors cursor-pointer shrink-0",
                  isSelected
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{type.label}</span>
                {isSelected && (
                  <motion.div
                    layoutId="academic-tab-indicator"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-foreground rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Secondary Filter Strip (Campus/India, Branch, Semester, Sort) ─── */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pb-1.5 pt-0.5">
          {/* Scope Selector */}
          <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setScope("campus");
              }}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                scope === "campus"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🏫 My Campus
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                setScope("global");
              }}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                scope === "global"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🇮🇳 All Colleges
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* Branch Dropdown */}
            <select
              value={selectedBranch}
              onChange={(e) => {
                sounds.tap();
                setSelectedBranch(e.target.value);
              }}
              className="h-7.5 rounded-full bg-muted/40 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
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
              className="h-7.5 rounded-full bg-muted/40 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            >
              {SEMESTERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === "all" ? "📚 All Sems" : s.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                sounds.tap();
                setSortBy(e.target.value as any);
              }}
              className="h-7.5 rounded-full bg-muted/40 border border-border/40 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            >
              <option value="latest">⏱️ Latest</option>
              <option value="popular">🔥 Most Upvoted</option>
              <option value="downloads">📥 Most Downloaded</option>
              <option value="views">👁️ Most Viewed</option>
            </select>
          </div>
        </div>
      </header>

      {/* ─── Academic Resources Feed ─── */}
      <section className="divide-y divide-border/20">
        {isInitialLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : items.length > 0 ? (
          <>
            {items.map((item) => (
              <AcademicCard
                key={item.id}
                item={item}
                currentUserId={profileId || undefined}
                isHighlighted={highlightId === item.id}
              />
            ))}

            {/* Sentinel element for infinite scroll */}
            <div ref={loadMoreRef} className="flex flex-col items-center justify-center p-4 min-h-16">
              {isLoadingMore && (
                <div className="flex items-center gap-2 py-3 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-indigo-500" />
                  <span>Loading more vault resources...</span>
                </div>
              )}
              {isReachingEnd && (
                <div className="py-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/40 border border-border/40 text-[11px] font-semibold text-muted-foreground">
                    <span>✨ Reached end of vault ({totalCount.toLocaleString()} resources)</span>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.tap();
                        setShowUploadModal(true);
                      }}
                      className="text-indigo-500 hover:underline font-bold cursor-pointer"
                    >
                      + Add your notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-24 text-center px-4 space-y-3">
            <BookOpen className="size-10 text-muted-foreground/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No study resources found</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Be the first to upload lecture notes, whole books, PPTs, or PYQs for this branch and earn 20
                LP!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Upload First Notes</span>
            </button>
          </div>
        )}
      </section>

      {/* ─── Upload Study Resource Modal ─── */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-5 max-h-[90vh] overflow-y-auto no-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <AnimatedIcon icon={AnimateBookOpen} animation="pop" size={18} className="text-indigo-500" />
              <span>Share Notes, PPTs &amp; Books</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateResource} className="space-y-3.5 pt-2">
            {/* Title */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Resource Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete Trees & Graphs Handwritten Notes (Midsem)"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full h-9 rounded-xl bg-muted/40 border border-border/40 px-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"
              />
            </div>

            {/* Subject Code & Subject Name */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Subject Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS201 / IT301"
                  value={formSubjectCode}
                  onChange={(e) => setFormSubjectCode(e.target.value.toUpperCase())}
                  className="w-full h-9 rounded-xl bg-muted/40 border border-border/40 px-3 text-xs font-bold uppercase text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures"
                  value={formSubjectName}
                  onChange={(e) => setFormSubjectName(e.target.value)}
                  className="w-full h-9 rounded-xl bg-muted/40 border border-border/40 px-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Resource Type & Module / Chapter */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Resource Type</label>
                <select
                  value={formResourceType}
                  onChange={(e) => setFormResourceType(e.target.value)}
                  className="w-full h-9 rounded-xl bg-muted/40 border border-border/40 px-2 text-xs font-bold text-foreground outline-none"
                >
                  <option value="NOTES">📝 Lecture Notes</option>
                  <option value="MODULE">📘 Module / Unit Notes</option>
                  <option value="BOOK">📚 Complete Course Book</option>
                  <option value="PPT">📊 PPT / Presentation Slides</option>
                  <option value="PYQ">📑 PYQ Exam Paper</option>
                  <option value="CHEAT_SHEET">⚡ Formula / Cheat Sheet</option>
                  <option value="LAB_MANUAL">🔬 Lab Manual &amp; Code</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground">
                  Module / Chapter (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Module 2 / Unit 3 / Full"
                  value={formModule}
                  onChange={(e) => setFormModule(e.target.value)}
                  className="w-full h-9 rounded-xl bg-muted/40 border border-border/40 px-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none"
                />
              </div>
            </div>

            {/* Branch & Semester */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Branch</label>
                <select
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                  className="w-full h-9 rounded-xl bg-muted/40 border border-border/40 px-2 text-xs font-bold text-foreground outline-none"
                >
                  {BRANCHES.filter((b) => b !== "All").map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="All">All Branches (Common Course)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Semester</label>
                <select
                  value={formSemester}
                  onChange={(e) => setFormSemester(Number(e.target.value))}
                  className="w-full h-9 rounded-xl bg-muted/40 border border-border/40 px-2 text-xs font-bold text-foreground outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direct File Upload (Cloudflare R2) */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">
                Upload Document (R2 Direct Storage)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.ppt,.docx,.doc,.zip,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-all cursor-pointer select-none"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Uploading to R2...</span>
                    </>
                  ) : formFileUrl ? (
                    <>
                      <AnimatedIcon
                        icon={AnimateCheck}
                        animation="pop"
                        size={14}
                        className="text-emerald-500"
                      />
                      <span className="truncate max-w-[200px] text-emerald-500 font-black">
                        {formFileName || "File Attached"}
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="size-4" />
                      <span>Choose PDF / PPT / DOCX / ZIP</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Google Drive or External Link */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">
                Or Google Drive / Notion / GitHub Link
              </label>
              <div className="relative mt-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formDriveUrl}
                  onChange={(e) => setFormDriveUrl(e.target.value)}
                  className="w-full h-9 rounded-xl bg-muted/40 border border-border/40 pl-8.5 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Description & Exam Tips */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">
                Notes Description &amp; Exam Tips
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Covers Module 1 to 3 with solved midsem PYQs from 2024 and 2025."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full rounded-xl bg-muted/40 border border-border/40 p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <AnimatedIcon icon={AnimateZap} animation="twinkle" size={13} />
                    <span>Publish &amp; Earn 20 LP</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Guest conversion modal */}
      <AcademicAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionReason={authModalReason}
        returnTo="/app/academics"
      />
    </main>
  );
}
