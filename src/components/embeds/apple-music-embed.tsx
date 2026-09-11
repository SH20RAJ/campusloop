"use client";

import { ExternalLink, Music } from "lucide-react";

interface AppleMusicEmbedProps {
  embedUrl: string;
  rawUrl?: string;
}

export function AppleMusicEmbed({ embedUrl, rawUrl }: AppleMusicEmbedProps) {
  const isMultiTrack =
    embedUrl.includes("/album/") ||
    embedUrl.includes("/playlist/") ||
    (rawUrl && (rawUrl.includes("/album/") || rawUrl.includes("/playlist/")));
  const height = isMultiTrack ? 450 : 175;

  return (
    <div
      className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs transition-all hover:border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border/30 bg-rose-500/10 px-3.5 py-1.5 dark:bg-rose-500/15">
        <div className="flex items-center gap-1.5 text-xs font-black text-rose-500">
          <Music className="size-3.5" />
          <span>Apple Music</span>
        </div>
        {rawUrl && (
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Open in Music</span>
            <ExternalLink className="size-3 opacity-70" />
          </a>
        )}
      </div>

      <div className="w-full bg-muted/20">
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          frameBorder="0"
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
          loading="lazy"
          className="w-full"
        />
      </div>
    </div>
  );
}
