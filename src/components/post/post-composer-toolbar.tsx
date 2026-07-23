"use client";

import { Bold, Italic, List, Heading2 } from "lucide-react";
import { Editor } from "@tiptap/react";

interface PostComposerToolbarProps {
  editor: Editor | null;
}

export function PostComposerToolbar({ editor }: PostComposerToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 border-b border-border/40 pb-2 mb-2 text-muted-foreground">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${
          editor.isActive("bold") ? "bg-muted text-foreground" : ""
        }`}
        title="Bold"
      >
        <Bold className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${
          editor.isActive("italic") ? "bg-muted text-foreground" : ""
        }`}
        title="Italic"
      >
        <Italic className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${
          editor.isActive("heading", { level: 2 }) ? "bg-muted text-foreground" : ""
        }`}
        title="Heading"
      >
        <Heading2 className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg hover:bg-muted transition-colors ${
          editor.isActive("bulletList") ? "bg-muted text-foreground" : ""
        }`}
        title="Bullet List"
      >
        <List className="size-3.5" />
      </button>
    </div>
  );
}
