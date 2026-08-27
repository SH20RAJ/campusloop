import { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Search Posts, Colleges & Students | CampusLoop",
  description: "Search confessions, polls, verified college campuses, and student profiles on CampusLoop.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-2xl flex-col p-4 space-y-4">
          <div className="h-10 rounded-full bg-muted/40 animate-pulse" />
          <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
