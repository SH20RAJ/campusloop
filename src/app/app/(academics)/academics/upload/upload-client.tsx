"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  FileCode,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  FolderOpen,
  Globe,
  Layers,
  Link2,
  Loader2,
  Plus,
  Presentation,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  Video,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadMediaFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

export interface UploadAttachmentItem {
  id: string;
  title: string;
  url: string;
  type: "PDF" | "PPT" | "DOCX" | "IMAGE" | "DRIVE" | "LINK" | "VIDEO" | "CODE" | "OTHER";
  sizeBytes?: number;
  fileName?: string;
  status: "ready" | "uploading" | "error";
  uploadProgress?: number;
  error?: string;
}

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

function inferAttachmentType(filenameOrUrl: string): "PDF" | "PPT" | "DOCX" | "IMAGE" | "DRIVE" | "LINK" | "VIDEO" | "CODE" | "OTHER" {
  const lower = filenameOrUrl.toLowerCase();
  if (lower.includes("drive.google.com")) return "DRIVE";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "VIDEO";
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "PPT";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "DOCX";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) return "IMAGE";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) return "OTHER";
  if (lower.endsWith(".py") || lower.endsWith(".cpp") || lower.endsWith(".c") || lower.endsWith(".java") || lower.endsWith(".js") || lower.endsWith(".ts")) return "CODE";
  if (lower.startsWith("http://") || lower.startsWith("https://")) return "LINK";
  return "OTHER";
}

function getAttachmentIcon(type: string) {
  switch (type) {
    case "PDF":
      return FileText;
    case "PPT":
      return Presentation;
    case "DOCX":
      return FileText;
    case "IMAGE":
      return FileSpreadsheet;
    case "DRIVE":
      return FolderOpen;
    case "VIDEO":
      return Video;
    case "CODE":
      return FileCode;
    default:
      return Globe;
  }
}

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

  // Multi-Attachment State
  const [attachments, setAttachments] = useState<UploadAttachmentItem[]>([]);
  const [linkInputUrl, setLinkInputUrl] = useState("");
  const [linkInputTitle, setLinkInputTitle] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
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

  // Handle direct multiple files upload
  async function handleFilesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    sounds.tap();
    haptics.medium();

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds maximum allowed size of 50MB`);
        continue;
      }

      const tempId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const inferredType = inferAttachmentType(file.name);

      // Add to attachments in uploading state
      setAttachments((prev) => [
        ...prev,
        {
          id: tempId,
          title: cleanName,
          url: "",
          type: inferredType,
          fileName: file.name,
          sizeBytes: file.size,
          status: "uploading",
          uploadProgress: 0,
        },
      ]);

      // If overall title is empty, prefill from first file
      if (!title.trim()) {
        setTitle(cleanName);
      }

      // Execute upload
      uploadMediaFile(file, "document", file.name, (progress) => {
        setAttachments((prev) =>
          prev.map((item) =>
            item.id === tempId ? { ...item, uploadProgress: progress.percent } : item
          )
        );
      })
        .then((res) => {
          if (res?.url) {
            setAttachments((prev) =>
              prev.map((item) =>
                item.id === tempId
                  ? { ...item, url: res.url, status: "ready", uploadProgress: 100 }
                  : item
              )
            );
            toast.success(`Uploaded "${file.name}"!`);
          } else {
            setAttachments((prev) =>
              prev.map((item) =>
                item.id === tempId ? { ...item, status: "error", error: "Upload failed" } : item
              )
            );
            toast.error(`Failed to upload "${file.name}"`);
          }
        })
        .catch((err) => {
          setAttachments((prev) =>
            prev.map((item) =>
              item.id === tempId
                ? { ...item, status: "error", error: err instanceof Error ? err.message : "Error" }
                : item
            )
          );
          toast.error(`Error uploading "${file.name}"`);
        });
    }

    // Reset input
    e.target.value = "";
  }

  // Handle adding external link / Google Drive
  function handleAddExternalLink() {
    const raw = linkInputUrl.trim();
    if (!raw) {
      toast.error("Please enter a link or Google Drive URL");
      return;
    }

    if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
      toast.error("Link must start with https:// or http://");
      return;
    }

    sounds.tap();
    haptics.light();

    const inferredType = inferAttachmentType(raw);
    const defaultTitle =
      inferredType === "DRIVE"
        ? "Google Drive Folder / Document"
        : inferredType === "VIDEO"
          ? "YouTube Lecture / Playlist"
          : "External Study Resource";

    const newAtt: UploadAttachmentItem = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: linkInputTitle.trim() || defaultTitle,
      url: raw,
      type: inferredType,
      status: "ready",
    };

    setAttachments((prev) => [...prev, newAtt]);
    setLinkInputUrl("");
    setLinkInputTitle("");
    setIsAddingLink(false);
    toast.success("Link attached!");
  }

  function moveAttachment(idx: number, dir: "up" | "down") {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= attachments.length) return;
    sounds.tap();
    haptics.light();
    setAttachments((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  }

  function removeAttachment(id: string) {
    sounds.tap();
    haptics.light();
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAttachmentTitle(id: string, newTitle: string) {
    setAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, title: newTitle } : a))
    );
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
      toast.error("Please enter a title for the note / study pack");
      return;
    }
    if (!subjectCode.trim()) {
      toast.error("Subject code is required (e.g. CS201, EC304, MA101)");
      return;
    }
    if (!subjectName.trim()) {
      toast.error("Subject name is required (e.g. Data Structures & Algorithms)");
      return;
    }

    const readyAttachments = attachments.filter((a) => a.status === "ready" && a.url);
    const hasUploading = attachments.some((a) => a.status === "uploading");

    if (hasUploading) {
      toast.info("Please wait for all documents to finish uploading before publishing");
      return;
    }

    if (readyAttachments.length === 0) {
      toast.error("Please attach at least one PDF, PPT, document, or Google Drive link");
      return;
    }

    setIsSubmitting(true);
    sounds.send();
    haptics.medium();

    try {
      const firstDrive = readyAttachments.find((a) => a.type === "DRIVE" || a.url.includes("drive.google.com"));
      const firstFile = readyAttachments.find((a) => a.type !== "DRIVE" && !a.url.includes("drive.google.com"));

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
          attachments: readyAttachments.map((a) => ({
            id: a.id,
            title: a.title,
            url: a.url,
            type: a.type,
            sizeBytes: a.sizeBytes,
          })),
          driveUrl: firstDrive?.url || null,
          fileUrl: firstFile?.url || readyAttachments[0]?.url || null,
          tags,
        }),
      });

      const json = (await res.json()) as any;
      if (res.ok && json.success) {
        sounds.pop();
        haptics.success();
        toast.success("Study resource published with all attachments! +20 Loop Points earned");
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
  const readyAttachmentsCount = attachments.filter((a) => a.status === "ready" && a.url).length;
  const hasUploading = attachments.some((a) => a.status === "uploading");
  const isFormValid = hasTitle && hasSubjectCode && hasSubjectName && readyAttachmentsCount > 0 && !hasUploading;

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

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <span>Publish Study Materials &amp; Packs</span>
            <span className="flex size-6.5 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <UploadCloud className="size-3.5" />
            </span>
          </h1>
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
                <span className="text-xs font-bold text-muted-foreground">{currentType.label}</span>
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
                  <span>Note / Study Pack Title</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Required</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS201 Complete Course Notes, All PYQs &amp; Revision Slides"
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
                  placeholder="Summarize the topics, chapters, professor name, or exam years included in this post..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-border/40 bg-muted/30 p-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors resize-none"
                />
              </div>
            </div>

            {/* Step 3: Academic Branch & Semester Scope */}
            <div className="rounded-3xl border border-border/40 bg-card/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">
                  3
                </span>
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Branch &amp; Semester Alignment
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Branch */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-foreground">Target Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 px-3 text-xs sm:text-sm font-semibold text-foreground outline-none focus:border-primary focus:bg-background transition-colors cursor-pointer"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b} className="bg-card text-foreground">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-foreground">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                    className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 px-3 text-xs sm:text-sm font-semibold text-foreground outline-none focus:border-primary focus:bg-background transition-colors cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s} className="bg-card text-foreground">
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Module / Chapter */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Module / Unit</span>
                    <span className="text-[10px] text-muted-foreground">Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 1 to 5, All Modules"
                    value={moduleOrChapter}
                    onChange={(e) => setModuleOrChapter(e.target.value)}
                    className="h-10 w-full rounded-2xl border border-border/40 bg-muted/30 px-3.5 text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Multi-Attachment Studio (PDF, PPT, DOCX, Drive, Links) */}
            <div className="rounded-3xl border border-border/40 bg-card/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">
                    4
                  </span>
                  <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Upload Multiple Files, Slides &amp; Links
                  </h2>
                </div>

                <span className="text-xs font-bold text-muted-foreground">
                  {attachments.length} {attachments.length === 1 ? "document" : "documents"} attached
                </span>
              </div>

              {/* Upload Dropzone & Link Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* File Upload Trigger */}
                <label
                  htmlFor="multi-academic-files"
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all cursor-pointer text-center group"
                >
                  <input
                    id="multi-academic-files"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.txt"
                    onChange={handleFilesUpload}
                    className="hidden"
                  />
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform mb-2">
                    <UploadCloud className="size-5" />
                  </div>
                  <p className="text-xs font-black text-foreground">Upload Files / PDFs / PPTs</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Select multiple files at once (up to 50MB each)
                  </p>
                </label>

                {/* Add External Link Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setIsAddingLink((prev) => !prev);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center group",
                    isAddingLink
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/50"
                  )}
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform mb-2">
                    <Link2 className="size-5" />
                  </div>
                  <p className="text-xs font-black text-foreground">Add Drive / Web / YouTube Link</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Google Drive, Docs, YouTube playlists, Notion &amp; web portals
                  </p>
                </button>
              </div>

              {/* Expandable Add Link Panel */}
              {isAddingLink && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <Link2 className="size-3.5 text-primary" />
                      <span>Attach External Web or Cloud URL</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingLink(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Resource Link (URL)</label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/... or YouTube playlist"
                        value={linkInputUrl}
                        onChange={(e) => setLinkInputUrl(e.target.value)}
                        className="h-9.5 w-full rounded-xl border border-border/40 bg-background px-3 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground">Document Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Module 3 Endsem Solved Questions Drive"
                        value={linkInputTitle}
                        onChange={(e) => setLinkInputTitle(e.target.value)}
                        className="h-9.5 w-full rounded-xl border border-border/40 bg-background px-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingLink(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExternalLink}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Attach Link</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Attached Items List & Tray */}
              {attachments.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>Attached Materials Order</span>
                    <span>{attachments.length} items</span>
                  </div>

                  <div className="space-y-2">
                    {attachments.map((att, idx) => {
                      const Icon = getAttachmentIcon(att.type);
                      return (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-background/75 backdrop-blur-sm transition-all shadow-2xs"
                        >
                          {/* Order Index & Icon */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono font-bold text-muted-foreground w-4 text-center">
                              {idx + 1}
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-foreground border border-border/40">
                              <Icon className="size-4" />
                            </div>
                          </div>

                          {/* Title & Metadata */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <input
                              type="text"
                              value={att.title}
                              onChange={(e) => updateAttachmentTitle(att.id, e.target.value)}
                              placeholder="Document Title"
                              className="w-full bg-transparent text-xs font-bold text-foreground outline-none focus:underline"
                            />
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                              <span className="px-1.5 py-0.2 rounded bg-muted font-mono font-bold uppercase tracking-wider text-foreground">
                                {att.type}
                              </span>
                              {att.sizeBytes && (
                                <span>{(att.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                              )}
                              {att.status === "uploading" && (
                                <span className="text-primary font-bold flex items-center gap-1">
                                  <Loader2 className="size-2.5 animate-spin" />
                                  <span>Uploading {att.uploadProgress ?? 0}%</span>
                                </span>
                              )}
                              {att.status === "error" && (
                                <span className="text-destructive font-bold">{att.error || "Upload error"}</span>
                              )}
                              {att.status === "ready" && (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                  <Check className="size-2.5" />
                                  <span>Ready</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Reorder and Delete Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveAttachment(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 transition-all cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveAttachment(idx, "down")}
                              disabled={idx === attachments.length - 1}
                              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 transition-all cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeAttachment(att.id)}
                              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer ml-1"
                              title="Remove Attachment"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Tags & SEO Discovery */}
            <div className="rounded-3xl border border-border/40 bg-card/60 p-5 sm:p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-black">
                  5
                </span>
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Tags &amp; Search Keywords
                </h2>
              </div>

              {/* Tag Input Field */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Add exam tag (e.g. Endsem2024, TopperNotes)..."
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
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border",
                      currentType.badgeColor
                    )}
                  >
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
                  {description.trim() ||
                    "Curated notes covering core examination topics and syllabus modules."}
                </p>

                {/* Attached Documents in preview */}
                {attachments.length > 0 && (
                  <div className="space-y-1 pt-1.5 border-t border-border/30">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      Included Documents ({attachments.length})
                    </span>
                    <div className="space-y-1">
                      {attachments.slice(0, 3).map((a, i) => {
                        const Icon = getAttachmentIcon(a.type);
                        return (
                          <div
                            key={a.id}
                            className="flex items-center gap-1.5 text-[11px] text-foreground font-semibold truncate bg-muted/30 px-2 py-1 rounded-lg"
                          >
                            <Icon className="size-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{a.title || `Doc ${i + 1}`}</span>
                          </div>
                        );
                      })}
                      {attachments.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{attachments.length - 3} more files
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
                    <span
                      className={hasSubjectCode ? "text-foreground font-semibold" : "text-muted-foreground"}
                    >
                      Subject code entered
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-4 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                        hasTitle ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
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
                        readyAttachmentsCount > 0
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {readyAttachmentsCount > 0 ? <Check className="size-2.5 stroke-[3]" /> : "•"}
                    </div>
                    <span
                      className={readyAttachmentsCount > 0 ? "text-foreground font-semibold" : "text-muted-foreground"}
                    >
                      {readyAttachmentsCount > 0
                        ? `${readyAttachmentsCount} document${readyAttachmentsCount > 1 ? "s" : ""} attached`
                        : "Attach at least 1 document or link"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
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
                  Resources are distributed under verified student fair-use for academic learning &amp; peer
                  collaboration.
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
