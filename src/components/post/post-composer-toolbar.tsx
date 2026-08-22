"use client";

import { Bold, Italic, List, Heading2, Code, Quote } from "lucide-react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface PostComposerToolbarProps {
  editor: Editor | null;
}

export function PostComposerToolbar({ editor }: PostComposerToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-border/50 bg-muted/30 p-1.5 backdrop-blur-xs overflow-x-auto no-scrollbar">
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

      <div className="mx-1 h-4 w-px bg-border/60 shrink-0" />

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
