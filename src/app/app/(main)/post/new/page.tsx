import type { Metadata } from "next";
import { PostComposer } from "./post-composer";

export const metadata: Metadata = {
  title: "Create Post | CampusLoop",
  description: "Share something with your campus.",
};

export default function NewPostPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col min-h-screen px-4 pt-6 pb-32">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Create Post</h1>
      <PostComposer />
    </main>
  );
}
