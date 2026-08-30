import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleEditorClient } from "./article-editor-client";

export const metadata: Metadata = {
  title: "Write Article | CampusLoop",
  description: "Write and publish long-form student articles, guides, and stories on CampusLoop.",
};

export default function NewArticlePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading editor...</div>}>
      <ArticleEditorClient />
    </Suspense>
  );
}
