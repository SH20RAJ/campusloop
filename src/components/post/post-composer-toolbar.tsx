"use client";

import { Bold, Italic, List, Heading2 } from "lucide-react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface PostComposerToolbarProps {
  editor: Editor | null;
}

export function PostComposerToolbar({ editor }: PostComposerToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/30 p-1">
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
      <div className="mx-1 h-4 w-px bg-border/60" />
      <ToolbarChip
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-3.5" />
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
        "rounded-lg p-1.5 transition-all cursor-pointer",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
