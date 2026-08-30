"use client";

import { MarkdownContent } from "@/components/common/markdown-content";
import { haptics } from "@/lib/haptics";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";
import {
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
  PenLine,
  Quote,
  Strikethrough,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Shared markdown authoring surface used by the article editor and the event
 * composer, so both get the same toolbar, image upload and live preview.
 */

interface MarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Textarea rows in the write tab. */
  rows?: number;
  /** Sticky offset for the toolbar, matching the host page's header height. */
  stickyTopClass?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

type ToolbarAction =
  | { kind: "wrap"; icon: typeof Bold; title: string; prefix: string; suffix?: string }
  | { kind: "divider" };

const TOOLBAR: ToolbarAction[] = [
  { kind: "wrap", icon: Heading1, title: "Heading 1", prefix: "# " },
  { kind: "wrap", icon: Heading2, title: "Heading 2", prefix: "## " },
  { kind: "wrap", icon: Heading3, title: "Heading 3", prefix: "### " },
  { kind: "divider" },
  { kind: "wrap", icon: Bold, title: "Bold", prefix: "**", suffix: "**" },
  { kind: "wrap", icon: Italic, title: "Italic", prefix: "*", suffix: "*" },
  { kind: "wrap", icon: Strikethrough, title: "Strikethrough", prefix: "~~", suffix: "~~" },
  { kind: "divider" },
  { kind: "wrap", icon: Quote, title: "Quote", prefix: "> " },
  { kind: "wrap", icon: Code, title: "Code block", prefix: "```\n", suffix: "\n```" },
  { kind: "wrap", icon: List, title: "Bullet list", prefix: "- " },
  { kind: "wrap", icon: ListOrdered, title: "Numbered list", prefix: "1. " },
  { kind: "divider" },
  { kind: "wrap", icon: LinkIcon, title: "Link", prefix: "[", suffix: "](https://)" },
  { kind: "wrap", icon: Minus, title: "Divider", prefix: "\n---\n" },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write in markdown — headings, **bold**, lists, code and images all work...",
  rows = 14,
  stickyTopClass = "top-0",
  className,
  id,
  required = false,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  /** Wraps the current selection, or inserts a placeholder when nothing is selected. */
  function insertFormatting(prefix: string, suffix = "") {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${prefix}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const inner = selected || "text";

    onChange(value.substring(0, start) + prefix + inner + suffix + value.substring(end));

    // Restore focus and select the inner text so typing replaces the placeholder.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + inner.length);
    });
  }

  /** Appends markdown at the caret without disturbing the surrounding text. */
  function insertAtCaret(snippet: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${snippet}`);
      return;
    }
    const start = textarea.selectionStart;
    onChange(value.substring(0, start) + snippet + value.substring(textarea.selectionEnd));
    requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + snippet.length;
      textarea.setSelectionRange(caret, caret);
    });
  }

  async function handleUpload(file: File) {
    if (!file) return;
    setIsUploading(true);
    haptics.light();
    const toastId = toast.loading("Uploading image...");

    try {
      const { displayUrl } = await uploadImageToImgBB(file);
      insertAtCaret(`\n\n![${file.name.replace(/\.[^.]+$/, "")}](${displayUrl})\n\n`);
      toast.success("Image added", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /** Lets students drop or paste screenshots straight into the editor. */
  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      void handleUpload(file);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      void handleUpload(file);
    }
  }

  /** Tab indents instead of leaving the editor, which matters for code blocks. */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      insertAtCaret("  ");
      return;
    }
    // Cmd/Ctrl+B and Cmd/Ctrl+I, as in every other editor students use.
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b") {
        e.preventDefault();
        insertFormatting("**", "**");
      } else if (e.key === "i") {
        e.preventDefault();
        insertFormatting("*", "*");
      }
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Write / Preview switch */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-full border border-border/40 bg-muted/30 p-0.5">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition-all",
                tab === t
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "write" ? <PenLine className="size-3.5" /> : <Eye className="size-3.5" />}
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>

        <span className="text-[10px] font-bold text-muted-foreground">
          {wordCount} {wordCount === 1 ? "word" : "words"} · Markdown
        </span>
      </div>

      {tab === "write" ? (
        <>
          {/* Formatting toolbar */}
          <div
            className={cn(
              "sticky z-20 flex flex-wrap items-center gap-0.5 rounded-2xl border border-border/40 bg-card/95 p-1.5 shadow-sm backdrop-blur-md",
              stickyTopClass
            )}
          >
            {TOOLBAR.map((action, i) =>
              action.kind === "divider" ? (
                <div key={`d-${i}`} className="mx-1 h-4 w-px bg-border/60" />
              ) : (
                <button
                  key={action.title}
                  type="button"
                  title={action.title}
                  aria-label={action.title}
                  onClick={() => insertFormatting(action.prefix, action.suffix)}
                  className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                >
                  <action.icon className="size-4" />
                </button>
              )
            )}

            <div className="mx-1 h-4 w-px bg-border/60" />

            {/* Image upload */}
            <button
              type="button"
              title="Upload image"
              aria-label="Upload image"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-black text-primary transition-colors hover:bg-primary/10 active:scale-95 disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImageIcon className="size-4" />
              )}
              <span className="hidden sm:inline">{isUploading ? "Uploading" : "Image"}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
          </div>

          <textarea
            id={id}
            ref={textareaRef}
            required={required}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-y rounded-2xl border border-border/40 bg-muted/20 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background"
          />

          <p className="px-1 text-[10px] text-muted-foreground">
            Paste or drop a screenshot to upload it inline. ⌘B bold · ⌘I italic.
          </p>
        </>
      ) : (
        <div className="min-h-[16rem] rounded-2xl border border-border/40 bg-muted/10 p-4 md:p-6">
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-xs font-medium text-muted-foreground">
              Nothing to preview yet — switch back to Write and start typing.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
