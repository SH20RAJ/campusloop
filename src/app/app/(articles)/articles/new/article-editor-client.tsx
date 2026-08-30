"use client";

import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Save,
  Send,
  Strikethrough,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BrandedQrModal } from "@/components/common/branded-qr-modal";
import { MarkdownContent } from "@/components/common/markdown-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface ArticleEditorClientProps {
  initialArticle?: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    content: string;
    coverImageUrl?: string | null;
    category?: string | null;
    tags?: string[] | null;
    status?: string | null;
  };
  isEditing?: boolean;
}

const CATEGORIES = [
  { id: "GENERAL", label: "General" },
  { id: "TECH_AND_CODE", label: "Tech & Code" },
  { id: "PLACEMENTS", label: "Placements" },
  { id: "CAMPUS_LIFE", label: "Campus Life" },
  { id: "RESEARCH", label: "Research" },
  { id: "INTERNSHIPS", label: "Internships" },
  { id: "PROJECTS", label: "Projects" },
  { id: "GUIDES", label: "Guides" },
  { id: "OPINION", label: "Opinion" },
];

const SUGGESTED_TAGS = [
  "Placements2026",
  "InternshipGuide",
  "DSA",
  "WebDev",
  "CampusLife",
  "HostelVibes",
  "OpenSource",
  "ResearchPaper",
  "InterviewPrep",
];

export function ArticleEditorClient({ initialArticle, isEditing = false }: ArticleEditorClientProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialArticle?.title || "");
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || "");
  const [content, setContent] = useState(initialArticle?.content || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialArticle?.coverImageUrl || "");
  const [category, setCategory] = useState(initialArticle?.category || "GENERAL");
  const [tags, setTags] = useState<string[]>(initialArticle?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Restore draft from localStorage if creating new
  useEffect(() => {
    if (!isEditing && !initialArticle) {
      const saved = localStorage.getItem("campusloop_article_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.subtitle) setSubtitle(parsed.subtitle);
          if (parsed.content) setContent(parsed.content);
          if (parsed.coverImageUrl) setCoverImageUrl(parsed.coverImageUrl);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.tags) setTags(parsed.tags);
        } catch {
          // ignore parsing error
        }
      }
    }
  }, [isEditing, initialArticle]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!isEditing) {
      const draft = { title, subtitle, content, coverImageUrl, category, tags };
      localStorage.setItem("campusloop_article_draft", JSON.stringify(draft));
    }
  }, [title, subtitle, content, coverImageUrl, category, tags, isEditing]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  function insertFormatting(prefix: string, suffix: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  }

  /** Uploads a file and drops a markdown image tag at the caret. */
  async function handleInlineImageUpload(file: File) {
    if (!file) return;
    setIsUploadingInline(true);
    haptics.light();
    const toastId = toast.loading("Uploading image...");
    try {
      const { displayUrl } = await uploadImageToImgBB(file);
      const textarea = textareaRef.current;
      const snippet = `\n\n![${file.name.replace(/\.[^.]+$/, "")}](${displayUrl})\n\n`;
      if (textarea) {
        const start = textarea.selectionStart;
        setContent(content.substring(0, start) + snippet + content.substring(textarea.selectionEnd));
      } else {
        setContent(`${content}${snippet}`);
      }
      toast.success("Image added to your article", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed", { id: toastId });
    } finally {
      setIsUploadingInline(false);
      if (inlineImageInputRef.current) inlineImageInputRef.current.value = "";
    }
  }

  async function handleCoverUpload(file: File) {
    if (!file) return;
    setIsUploadingCover(true);
    haptics.light();
    const toastId = toast.loading("Uploading cover...");
    try {
      const { displayUrl } = await uploadImageToImgBB(file);
      setCoverImageUrl(displayUrl);
      toast.success("Cover image set", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cover upload failed", { id: toastId });
    } finally {
      setIsUploadingCover(false);
      if (coverImageInputRef.current) coverImageInputRef.current.value = "";
    }
  }

  function handleAddTag(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      if (tags.length >= 6) {
        toast.error("Max 6 tags per article");
        return;
      }
      setTags((prev) => [...prev, clean]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }

  async function handleSave(status: "PUBLISHED" | "DRAFT") {
    if (!title.trim()) {
      toast.error("Please enter an article title");
      return;
    }

    if (!content.trim()) {
      toast.error("Article content cannot be empty");
      return;
    }

    setIsSubmitting(true);
    haptics.medium();

    try {
      const endpoint = isEditing && initialArticle ? `/api/articles/${initialArticle.slug}` : "/api/articles";
      const method = isEditing && initialArticle ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          content,
          coverImageUrl,
          category,
          tags,
          status,
        }),
      });

      const data = (await res.json()) as Record<string, any>;
      if (!res.ok) {
        throw new Error(data.error || "Failed to save article");
      }

      // Clear local draft if published
      if (status === "PUBLISHED" && !isEditing) {
        localStorage.removeItem("campusloop_article_draft");
      }

      if (status === "PUBLISHED") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        sounds.pop();
        toast.success("Article Published! +15 Loop Points (LP) Earned! 🚀");
        const finalSlug = data.article?.slug || initialArticle?.slug;
        setPublishedSlug(finalSlug);
        setShowQrModal(true);
      } else {
        toast.success("Draft saved successfully 📁");
        router.push("/app/articles/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pb-28 border-x border-border/30 bg-background max-w-3xl mx-auto select-none">
      {/* ─── Top Sticky Bar ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-foreground">
              {isEditing ? "Edit Article" : "Write Article"}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
              {readingTime} min read · {wordCount} words
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Write / Preview Tab Switcher */}
          <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                activeTab === "write"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                activeTab === "preview"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="size-3" />
              <span>Preview</span>
            </button>
          </div>

          {/* Save Draft */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSave("DRAFT")}
            disabled={isSubmitting}
            className="h-8 px-3 rounded-full text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="size-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>

          {/* Publish Button */}
          <Button
            size="sm"
            onClick={() => handleSave("PUBLISHED")}
            disabled={isSubmitting}
            className="h-8 px-3.5 rounded-full text-xs font-black bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20 cursor-pointer active:scale-95 gap-1.5"
          >
            <Send className="size-3.5" />
            <span>{isEditing ? "Update" : "Publish"}</span>
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-6 space-y-6">
        {activeTab === "write" ? (
          <div className="space-y-5">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Title of your article..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-2xl md:text-3xl font-black text-foreground placeholder:text-muted-foreground/50 outline-none tracking-tight leading-tight"
              />
            </div>

            {/* Subtitle Input */}
            <div>
              <input
                type="text"
                placeholder="Add a subtitle or summary hook..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-transparent text-sm md:text-base font-medium text-muted-foreground placeholder:text-muted-foreground/40 outline-none"
              />
            </div>

            {/* Cover Image Input */}
            <div className="rounded-2xl border border-border/40 bg-muted/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-primary" />
                  <span>Cover Image URL (Optional)</span>
                </label>
                {coverImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl("")}
                    className="text-[10px] text-destructive hover:underline cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste image link, or upload →"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="rounded-xl text-xs h-9 bg-background"
                />
                <button
                  type="button"
                  disabled={isUploadingCover}
                  onClick={() => coverImageInputRef.current?.click()}
                  className="shrink-0 flex items-center gap-1.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-black cursor-pointer hover:opacity-90 active:scale-95 transition-opacity disabled:opacity-60"
                >
                  {isUploadingCover ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  <span className="hidden sm:inline">Upload</span>
                </button>
                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleCoverUpload(file);
                  }}
                />
              </div>
              {coverImageUrl && (
                <div className="aspect-21/9 w-full overflow-hidden rounded-xl bg-muted/40 border border-border/40 mt-2">
                  <img
                    src={coverImageUrl}
                    alt="Cover Preview"
                    className="h-full w-full object-cover"
                    onError={() => toast.error("Invalid image link")}
                  />
                </div>
              )}
            </div>

            {/* Category & Tags Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="text-xs font-bold text-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl bg-muted/30 border border-border/40 text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-background">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-bold text-foreground">Tags (Max 6)</label>
                <form onSubmit={handleAddTag} className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="e.g. DSA, Placements"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="rounded-xl text-xs h-10 bg-muted/30"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="rounded-xl h-10 text-xs font-bold px-3 shrink-0"
                  >
                    Add
                  </Button>
                </form>
              </div>
            </div>

            {/* Selected Tags Chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-destructive cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground">Suggested topics:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      if (!tags.includes(st) && tags.length < 6) {
                        setTags((prev) => [...prev, st]);
                      }
                    }}
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer",
                      tags.includes(st)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40"
                    )}
                  >
                    #{st}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Rich Markdown Formatting Toolbar ─── */}
            <div className="sticky top-16 z-30 flex flex-wrap items-center gap-1 rounded-2xl border border-border/40 bg-card/95 p-1.5 backdrop-blur-md shadow-sm">
              <button
                type="button"
                onClick={() => insertFormatting("# ")}
                title="Heading 1"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Heading1 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("## ")}
                title="Heading 2"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Heading2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("### ")}
                title="Heading 3"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Heading3 className="size-4" />
              </button>

              <div className="h-4 w-px bg-border/60 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                title="Bold"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Bold className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                title="Italic"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Italic className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("~~", "~~")}
                title="Strikethrough"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Strikethrough className="size-4" />
              </button>

              <div className="h-4 w-px bg-border/60 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                title="Quote Block"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Quote className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("```\n", "\n```")}
                title="Code Block"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Code className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                title="Bullet List"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("1. ")}
                title="Numbered List"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ListOrdered className="size-4" />
              </button>

              <div className="h-4 w-px bg-border/60 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting("[Link Title](", ")")}
                title="Insert Link"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <LinkIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("![Image Alt](", ")")}
                title="Insert image by URL"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ImageIcon className="size-4" />
              </button>
              <button
                type="button"
                disabled={isUploadingInline}
                onClick={() => inlineImageInputRef.current?.click()}
                title="Upload an image"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-primary/10 text-primary font-black text-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isUploadingInline ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                <span className="hidden sm:inline">Upload</span>
              </button>
              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleInlineImageUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => insertFormatting("\n---\n")}
                title="Horizontal Divider"
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Minus className="size-4" />
              </button>
            </div>

            {/* Main Content Textarea */}
            <div className="min-h-[420px] rounded-2xl border border-border/40 bg-card/40 p-4 focus-within:border-primary transition-colors">
              <textarea
                ref={textareaRef}
                placeholder="Tell your story, share code, placement interview questions, or campus insights in markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[420px] bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 outline-none resize-y font-mono"
              />
            </div>
          </div>
        ) : (
          /* ─── Preview Mode ─── */
          <div className="space-y-6">
            {coverImageUrl && (
              <div className="aspect-21/9 w-full overflow-hidden rounded-3xl bg-muted/40 border border-border/40 shadow-sm">
                <img src={coverImageUrl} alt={title} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-primary tracking-wider">{category}</span>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                {title || "Untitled Article"}
              </h1>
              {subtitle && <p className="text-base text-muted-foreground leading-relaxed">{subtitle}</p>}
            </div>

            {/* Article Content Rendered — same renderer the published page uses */}
            <MarkdownContent content={content} />
          </div>
        )}
      </div>

      {/* Branded QR Code Modal after publishing */}
      {publishedSlug && (
        <BrandedQrModal
          isOpen={showQrModal}
          onClose={() => {
            setShowQrModal(false);
            router.push(`/app/articles/${publishedSlug}`);
          }}
          title={title}
          subtitle={`By you • ${readingTime} min read`}
          badgeText="Campus Article"
          shortUrl={`https://campusloop.space/a/${publishedSlug}`}
          category="article"
        />
      )}
    </div>
  );
}
