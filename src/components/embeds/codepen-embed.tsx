"use client";

import { Code2, ExternalLink } from "lucide-react";

interface CodePenEmbedProps {
  embedUrl: string;
  penId?: string;
  author?: string;
  rawUrl?: string;
}

export function CodePenEmbed({ embedUrl, penId, author, rawUrl }: CodePenEmbedProps) {
  return (
    <div
      className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs transition-all hover:border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border/30 bg-muted/40 px-3.5 py-1.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
          <Code2 className="size-3.5 text-primary" />
          <span>CodePen</span>
          {author && <span className="text-[11px] font-normal text-muted-foreground">by @{author}</span>}
        </div>
        {rawUrl && (
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Edit on CodePen</span>
            <ExternalLink className="size-3 opacity-70" />
          </a>
        )}
      </div>

      <iframe
        src={embedUrl}
        height="320"
        width="100%"
        scrolling="no"
        frameBorder="no"
        loading="lazy"
        allowTransparency
        allowFullScreen
        className="w-full bg-card"
      />
    </div>
  );
}
