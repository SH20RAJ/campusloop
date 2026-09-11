"use client";

import { ExternalLink, Video } from "lucide-react";

interface LoomEmbedProps {
  embedUrl: string;
  rawUrl?: string;
}

export function LoomEmbed({ embedUrl, rawUrl }: LoomEmbedProps) {
  return (
    <div
      className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs transition-all hover:border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border/30 bg-[#625df5]/10 px-3.5 py-1.5 dark:bg-[#625df5]/15">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#625df5]">
          <Video className="size-3.5" />
          <span>Loom Recording</span>
        </div>
        {rawUrl && (
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Watch on Loom</span>
            <ExternalLink className="size-3 opacity-70" />
          </a>
        )}
      </div>

      <div className="relative aspect-video w-full bg-black/90">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          loading="lazy"
          className="size-full"
        />
      </div>
    </div>
  );
}
