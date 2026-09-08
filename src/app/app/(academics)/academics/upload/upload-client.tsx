"use client";

import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  FileQuestion,
  FileText,
  FlaskConical,
  GraduationCap,
  Layers,
  Link2,
  Loader2,
  Plus,
  Presentation,
  ShieldCheck,
  Sparkles,
  Tag,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { uploadMediaFile } from "@/lib/upload";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const RESOURCE_TYPES = [
  {
    id: "NOTES",
    label: "Lecture Notes",
    desc: "Classroom slides, topper handwritten notes, and professor summaries",
    icon: BookOpen,
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  },
  {
    id: "PYQ",
    label: "PYQs & Solutions",
    desc: "Past semester endsem/midsem exam papers with step-by-step solutions",
    icon: FileQuestion,
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  },
  {
    id: "CHEAT_SHEET",
    label: "Formula Cheat Sheet",
    desc: "Quick 15-minute exam revision sheets, formulas, and concept mind-maps",
    icon: Zap,
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/25",
  },
  {
    id: "LAB_MANUAL",
    label: "Lab Manual & Code",
    desc: "Lab experiments, circuit diagrams, viva questions, and source code",
    icon: FlaskConical,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  },
  {
    id: "MODULE",
    label: "Unit / Module Pack",
    desc: "Comprehensive unit-wise notes tailored to specific syllabus chapters",
    icon: Layers,
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/25",
  },
  {
    id: "BOOK",
    label: "Reference Solutions",
    desc: "Problem solutions for standard university prescribed textbooks",
    icon: Bookmark,
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/25",
  },
] as const;

const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biotechnology",
  "Chemical Engineering",
  "Data Science & AI",
  "Basic Sciences",
  "All Branches",
];

const COMMON_TAG_SUGGESTIONS = [
  "Endsem2024",
  "MidsemExam",
  "StepByStep",
  "TopperNotes",
  "FormulaSheet",
  "SolvedNumericals",
  "ImportantQuestions",
  "UnitWise",
];

export function UploadAcademicClient() {
  const router = useRouter();

  // Form State
  const [resourceType, setResourceType] = useState<string>("NOTES");
  const [title, setTitle] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [branch, setBranch] = useState("Computer Science");
  const [semester, setSemester] = useState<number>(3);
  const [moduleOrChapter, setModuleOrChapter] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(["Endsem2024"]);
  const [tagInput, setTagInput] = useState("");

  // Upload method & files
  const [uploadMethod, setUploadMethod] = useState<"FILE" | "DRIVE">("FILE");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [driveUrl, setDriveUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate title helper
  function handleGenerateTitle() {
    if (!subjectCode.trim() && !subjectName.trim()) {
      toast.info("Enter Subject Code or Subject Name first to generate title");
      return;
    }
    sounds.tap();
    haptics.light();
    const typeObj = RESOURCE_TYPES.find((r) => r.id === resourceType);
    const typeLabel = typeObj ? typeObj.label : "Notes";
    const sub = subjectCode.trim() || subjectName.trim();
    const semStr = `Semester ${semester}`;
    const generated = `${sub} ${typeLabel} - ${semStr} ${branch} (${moduleOrChapter ? `Unit ${moduleOrChapter}` : "Complete Syllabus"})`;
    setTitle(generated);
  }

  // Handle direct file upload via Cloudflare R2
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File exceeds maximum allowed size of 100MB");
      return;
    }

    setIsUploading(true);
    sounds.tap();
    haptics.medium();

    try {
      const res = await uploadMediaFile(file);
      if (res?.url) {
        setFileUrl(res.url);
        setFileName(file.name);
        setFileSize(file.size);
        toast.success(`Uploaded "${file.name}" to Cloudflare Storage!`);

        // If title is empty, prefill from filename
        if (!title.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          setTitle(cleanName);
        }
      } else {
        toast.error("Direct upload failed. Try providing a Google Drive link.");
      }
    } catch {
      toast.error("Upload error. Check network connection.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleAddTag(tagText: string) {
    const clean = tagText.trim().replace(/^#/, "");
    if (!clean) return;
    if (tags.includes(clean)) {
      setTagInput("");
      return;
    }
    sounds.tap();
    haptics.light();
    setTags((prev) => [...prev, clean]);
    setTagInput("");
  }

  function handleRemoveTag(tagToRemove: string) {
    sounds.tap();
    haptics.light();
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }

  // Form submission to /api/academics
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for the document");
      return;
    }
    if (!subjectCode.trim()) {
      toast.error("Subject code is required (e.g. CS201, EC304)");
      return;
    }
    if (!subjectName.trim()) {
      toast.error("Subject name is required (e.g. Data Structures)");
      return;
    }
    if (!fileUrl && !driveUrl.trim()) {
      toast.error("Please upload a document or provide a Google Drive / Web link");
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
          title: title.trim(),
          description: description.trim() || undefined,
          subjectCode: subjectCode.trim().toUpperCase(),
          subjectName: subjectName.trim(),
          branch,
          semester,
          resourceType,
          moduleOrChapter: moduleOrChapter.trim() || null,
          driveUrl: uploadMethod === "DRIVE" ? driveUrl.trim() : null,
          fileUrl: uploadMethod === "FILE" ? fileUrl : null,
          tags,
        }),
      });

      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        sounds.pop();
        haptics.success();
        toast.success("Study resource published! +20 Loop Points earned");
        router.push(`/app/academics/${json.item?.id || ""}`);
      } else {
        toast.error(json.error || "Failed to publish academic resource");
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Network error while submitting resource");
      setIsSubmitting(false);
    }
  }

  // Validation status
  const hasTitle = title.trim().length > 0;
  const hasSubjectCode = subjectCode.trim().length > 0;
  const hasSubjectName = subjectName.trim().length > 0;
  const hasFileOrLink = Boolean(fileUrl || driveUrl.trim());
  const isFormValid = hasTitle && hasSubjectCode && hasSubjectName && hasFileOrLink;

  const currentType = RESOURCE_TYPES.find((r) => r.id === resourceType) || RESOURCE_TYPES[0];

  return (
    <div className="mx-auto w-full max-w-7xl pb-24 px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
      {/* ─── Breadcrumb & Header ─── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link
              href="/app/academics"
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Academic Vault</span>
            </Link>
            <span>/</span>
            <span className="text-foreground">Upload Studio</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <span>Publish Study Materials</span>
            <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <UploadCloud className="size-4" />
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Share verified question papers, lecture notes, formula cheat sheets, and lab manuals with college peers across India.
          </p>
        </div>

        {/* Clout Reward Badge */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
            <Zap className="size-4 text-amber-400 fill-amber-400 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-black">+20 Loop Points</p>
              <p className="text-[10px] text-muted-foreground">Credited on verified upload</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── LEFT COLUMN: Multi-Section Creator Studio (8 Columns) ─── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Resource Type Selector */}
            <div className="rounded-3xl border border-border/40 bg-card/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">
                    1
                  </span>
                  <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Select Material Category
                  </h2>
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  {currentType.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {RESOURCE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = resourceType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        sounds.tap();
                        haptics.light();
                        setResourceType(type.id);
                      }}
                      className={cn(
                        "flex flex-col text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative",
                        isSelected
                          ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
                          : "bg-muted/20 border-border/40 hover:bg-muted/40 hover:border-border/80"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div
                          className={cn(
                            "flex size-8 items-center justify-center rounded-xl border",
                            type.badgeColor
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        {isSelected && (
                          <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-black text-foreground">{type.label}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                        {type.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Course & Subject Identification */}
            <div className="rounded-3xl border border-border/40 bg-card/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">
                    2
                  </span>
                  <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Subject &amp; Course Details
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateTitle}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  <Sparkles className="size-3" />
                  <span>Auto-Format Title</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Subject Code</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Required</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS201, EC304, MA101"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                    className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 px-3.5 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
                  />
                </div>

                {/* Subject Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Subject Name</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Required</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures &amp; Algorithms"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 px-3.5 text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
                  />
                </div>
              </div>

              {/* Document Title */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Document Title</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Required</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS201 Endsem 2024 Question Paper with Complete Solutions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 px-3.5 text-xs sm:text-sm font-bold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Topics Covered / Curator Notes</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize the topics, chapters, professor name, or exam years included in this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-border/40 bg-muted/30 p-3 text-xs sm:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors resize-none"
                />
              </div>
            </div>

            {/* Step 3: Academic Scope (Semester, Branch, Module) */}
            <div className="rounded-3xl border border-border/40 bg-card/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">
                  3
                </span>
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Semester &amp; Branch Scope
                </h2>
              </div>

              {/* Semester Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Target Semester</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                    const isSelected = semester === sem;
                    return (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          haptics.light();
                          setSemester(sem);
                        }}
                        className={cn(
                          "py-2 rounded-xl text-xs font-black transition-all cursor-pointer text-center border",
                          isSelected
                            ? "bg-foreground text-background border-foreground shadow-xs"
                            : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40 hover:bg-muted/50"
                        )}
                      >
                        Sem {sem}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Branch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Branch / Stream</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 px-3 text-xs sm:text-sm font-semibold text-foreground outline-none focus:border-primary focus:bg-background transition-colors cursor-pointer"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b} className="bg-background text-foreground">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Module / Unit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Module / Chapter</label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 1, Module 3, or Full Syllabus"
                    value={moduleOrChapter}
                    onChange={(e) => setModuleOrChapter(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 px-3.5 text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Document File or External Link */}
            <div className="rounded-3xl border border-border/40 bg-card/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">
                    4
                  </span>
                  <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Document File or Link
                  </h2>
                </div>

                {/* Upload Method Switcher */}
                <div className="flex items-center rounded-full bg-muted/50 p-0.5 border border-border/40">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("FILE")}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      uploadMethod === "FILE"
                        ? "bg-foreground text-background shadow-xs font-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <UploadCloud className="size-3" />
                    <span>Direct File (R2)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod("DRIVE")}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                      uploadMethod === "DRIVE"
                        ? "bg-foreground text-background shadow-xs font-black"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link2 className="size-3" />
                    <span>Google Drive</span>
                  </button>
                </div>
              </div>

              {uploadMethod === "FILE" ? (
                <div className="space-y-3">
                  <label
                    htmlFor="academic-file-upload"
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                      fileUrl
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/50"
                    )}
                  >
                    <input
                      id="academic-file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <p className="text-xs font-bold text-foreground">Uploading to Cloudflare R2...</p>
                        <p className="text-[11px] text-muted-foreground">Encrypting &amp; indexing document</p>
                      </div>
                    ) : fileUrl ? (
                      <div className="flex flex-col items-center gap-2 py-2 text-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="size-6" />
                        </div>
                        <p className="text-xs font-black text-foreground truncate max-w-sm">{fileName}</p>
                        {fileSize && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {(fileSize / (1024 * 1024)).toFixed(2)} MB • Ready for preview
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-primary hover:underline mt-1">
                          Click to replace file
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center py-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                          <UploadCloud className="size-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-foreground">
                            Click to upload or drag &amp; drop document
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            PDF, DOCX, PPTX, or ZIP (up to 100MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    Google Drive, OneDrive or GitHub Link
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/.../view"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 pl-10 pr-3.5 text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Ensure link permission is set to <strong>&quot;Anyone with the link can view&quot;</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Step 5: Tags & Search Discoverability */}
            <div className="rounded-3xl border border-border/40 bg-card/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">
                  5
                </span>
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Exam &amp; Topic Tags
                </h2>
              </div>

              {/* Tag Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Add topic tags (e.g. Dijkstra, AVL, Endsem2024)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    className="h-9.5 w-full rounded-2xl border border-border/40 bg-muted/30 pl-10 pr-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className="px-3.5 h-9.5 rounded-2xl bg-muted/60 hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Active Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="cursor-pointer hover:text-foreground ml-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5 pt-2 border-t border-border/20">
                <span className="text-[11px] font-semibold text-muted-foreground">Quick suggestions:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {COMMON_TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddTag(s)}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40 transition-colors cursor-pointer"
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Live Vault Preview & Publish Action (4 Columns) ─── */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
            {/* Live Preview Card */}
            <div className="rounded-3xl border border-border/40 bg-card/75 p-5 backdrop-blur-md shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Live Vault Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  100% Verified
                </span>
              </div>

              {/* Simulated Card Tile */}
              <div className="rounded-2xl border border-border/50 bg-background/80 p-4 space-y-3 shadow-2xs">
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-mono text-[11px] font-black tracking-wider">
                    {subjectCode.trim() || "CS201"}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border", currentType.badgeColor)}>
                    {currentType.label}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h4 className="text-sm font-black text-foreground line-clamp-2 leading-snug">
                    {title.trim() || "Document Title Preview"}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {subjectName.trim() || "Course Name"}
                  </p>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                  {description.trim() || "Curated notes covering core examination topics and syllabus modules."}
                </p>

                {/* Meta details */}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                  <span>Sem {semester}</span>
                  <span>•</span>
                  <span className="truncate">{branch}</span>
                  {moduleOrChapter && (
                    <>
                      <span>•</span>
                      <span className="truncate">{moduleOrChapter}</span>
                    </>
                  )}
                </div>

                {/* Tags in preview */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] font-mono text-primary">
                        #{t}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Pre-Publish Checklist */}
              <div className="space-y-2 pt-2 border-t border-border/30 text-xs">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Readiness Checklist
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-4 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                        hasSubjectCode
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {hasSubjectCode ? <Check className="size-2.5 stroke-[3]" /> : "•"}
                    </div>
                    <span className={hasSubjectCode ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      Subject code entered
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-4 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                        hasTitle
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {hasTitle ? <Check className="size-2.5 stroke-[3]" /> : "•"}
                    </div>
                    <span className={hasTitle ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      Document title set
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-4 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                        hasFileOrLink
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {hasFileOrLink ? <Check className="size-2.5 stroke-[3]" /> : "•"}
                    </div>
                    <span className={hasFileOrLink ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      File or Drive link attached
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !isFormValid}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Publishing Material...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-4" />
                    <span>Publish to Vault (+20 LP)</span>
                  </>
                )}
              </button>

              {/* Integrity statement */}
              <div className="flex items-start gap-2 text-[11px] text-muted-foreground/80 leading-snug pt-1">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Resources are distributed under verified student fair-use for academic learning &amp; peer collaboration.
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
