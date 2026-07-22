import type { Metadata } from "next";
import { PostComposer } from "./post-composer";

export const metadata: Metadata = {
  title: "Create Post | CampusLoop",
  description: "Share something with your campus.",
};

export default function NewPostPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col min-h-screen px-4 pt-6 pb-24">
      <h1 className="mb-5 text-xl font-bold tracking-tight text-foreground">Create Post</h1>
      <PostComposer />
    </main>
  );
}
