"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Code, Heading2, Italic, List, Quote, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostComposerToolbarProps {
  editor: Editor | null;
  onOpenGifPicker?: () => void;
  onOpenStickerPicker?: () => void;
}

export function PostComposerToolbar({
  editor,
  onOpenGifPicker,
  onOpenStickerPicker,
}: PostComposerToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-muted/30 p-1.5 backdrop-blur-xs overflow-x-auto no-scrollbar">
      <ToolbarChip
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-3.5" />
      </ToolbarChip>

      <ToolbarChip
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-3.5" />
      </ToolbarChip>

      <ToolbarChip
        label="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-3.5" />
      </ToolbarChip>

      <div className="mx-1 h-4 w-px bg-border/40 shrink-0" />

      <ToolbarChip
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-3.5" />
      </ToolbarChip>

      <ToolbarChip
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="size-3.5" />
      </ToolbarChip>

      <ToolbarChip
        label="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-3.5" />
      </ToolbarChip>

      {onOpenStickerPicker && (
        <>
          <div className="mx-1 h-4 w-px bg-border/40 shrink-0" />
          <button
            type="button"
            onClick={onOpenStickerPicker}
            aria-label="Add Sticker"
            title="Add Campus Sticker"
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer select-none active:scale-95 shrink-0"
          >
            <Smile className="size-3" />
            <span>Sticker</span>
          </button>
        </>
      )}

      {onOpenGifPicker && (
        <>
          <div className="mx-1 h-4 w-px bg-border/40 shrink-0" />
          <button
            type="button"
            onClick={onOpenGifPicker}
            aria-label="Add GIF"
            title="Add Reaction GIF (GIPHY)"
            className="flex items-center justify-center rounded-xl px-2.5 py-1 text-[10px] font-black tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer select-none active:scale-95 shrink-0"
          >
            GIF
          </button>
        </>
      )}
    </div>
  );
}

function ToolbarChip({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center justify-center rounded-xl p-2 transition-all cursor-pointer select-none active:scale-95 shrink-0",
        active
          ? "bg-primary text-primary-foreground font-bold shadow-xs"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
