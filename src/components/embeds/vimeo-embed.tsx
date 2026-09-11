"use client";

import { ExternalLink, Video } from "lucide-react";

interface VimeoEmbedProps {
  embedUrl: string;
  rawUrl?: string;
  id?: string;
}

export function VimeoEmbed({ embedUrl, rawUrl, id }: VimeoEmbedProps) {
  return (
    <div
      className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs transition-all hover:border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border/30 bg-[#1ab7ea]/10 px-3.5 py-1.5 dark:bg-[#1ab7ea]/15">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#1ab7ea]">
          <Video className="size-3.5" />
          <span>Vimeo</span>
          {id && <span className="text-[11px] font-mono text-muted-foreground">#{id}</span>}
        </div>
        {rawUrl && (
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Watch on Vimeo</span>
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
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="size-full"
        />
      </div>
    </div>
  );
}
