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
    <main className="mx-auto flex w-full max-w-xl flex-col min-h-screen px-4 pt-4 pb-24 space-y-5">
      {/* Header Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Feed
        </Link>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
          <Sparkles className="size-3" /> Earn +5 LP
        </span>
      </div>

      {/* Hero Header */}
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Create a Campus Post</h1>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          Share confessions, canteen polls, or start a discussion across your campus or sub-hubs.
        </p>
      </div>

      <PostComposer />
    </main>
  );
}
