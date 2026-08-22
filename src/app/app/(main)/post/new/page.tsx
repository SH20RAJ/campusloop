import type { Metadata } from "next";
import { PostComposer } from "./post-composer";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Post | CampusLoop",
  description: "Share a confession, start a poll, or ask your campus on CampusLoop.",
};

export default function NewPostPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col min-h-screen pb-24">
      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <Link
          href="/app"
          className="inline-flex size-8 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to feed"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-sm font-black tracking-tight text-foreground">
          Create a <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Post</span>
        </h1>
        <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold text-primary">
          <Sparkles className="size-3" /> +5 LP
        </span>
      </header>

      {/* Subtitle */}
      <div className="px-5 pt-5">
        <p className="text-xs font-medium leading-relaxed text-muted-foreground">
          Share confessions, canteen polls, or start a discussion across your campus or sub-hubs.
        </p>
      </div>

      {/* Composer */}
      <div className="px-4 pt-4">
        <PostComposer />
      </div>
    </main>
  );
}
