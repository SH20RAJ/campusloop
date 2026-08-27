import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { isViewerProfile } from "@/lib/viewer";
import { eq } from "drizzle-orm";
import {
ArrowLeft,
Zap
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PostComposer } from "./post-composer";

export const metadata: Metadata = {
  title: "Create Post | CampusLoop",
  description: "Share a confession, start a poll, or ask your campus on CampusLoop.",
};

export default async function NewPostPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/join");
  }

  const profile = await getDb().query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });
  if (profile && (await isViewerProfile(profile))) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col min-h-screen pb-24">
      {/* Sticky App Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3.5 backdrop-blur-xl">
        <Link
          href="/app"
          className="inline-flex size-9 items-center justify-center rounded-2xl border border-border/60 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95 shadow-xs"
          aria-label="Back to feed"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-sm font-black tracking-tight text-foreground flex items-center gap-1.5">
          <span>Create a</span>
          <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Post</span>
        </h1>
        <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-extrabold text-primary shadow-xs">
          <Zap className="size-3" /> +5 LP
        </span>
      </header>

      {/* Hero Subtitle */}
      <div className="px-5 pt-4">
        <p className="text-xs font-medium leading-relaxed text-muted-foreground">
          Share confessions, canteen polls, or start a discussion across your campus or sub-hubs.
        </p>
      </div>

      {/* Composer Container */}
      <div className="px-4 pt-4">
        <PostComposer />
      </div>
    </main>
  );
}
