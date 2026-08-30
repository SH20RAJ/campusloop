"use client";

import { fetcher } from "@/lib/api";
import { ExternalLink, Globe } from "lucide-react";
import useSWR from "swr";

interface LinkPreviewEmbedProps {
  url: string;
}

interface OgData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

export function LinkPreviewEmbed({ url }: LinkPreviewEmbedProps) {
  const { data, isLoading } = useSWR<OgData>(
    `/api/embed/preview?url=${encodeURIComponent(url)}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 86400000 }
  );

  if (isLoading) {
    return (
      <div className="mt-3 p-3 rounded-2xl border border-border/40 bg-card/40 animate-pulse flex items-center gap-3">
        <div className="size-12 rounded-xl bg-muted/60" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-muted/60 rounded-md w-3/4" />
          <div className="h-3 bg-muted/40 rounded-md w-1/2" />
        </div>
      </div>
    );
  }

  if (!data || (!data.title && !data.description && !data.image)) {
    return null;
  }

  let domain = "";
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    domain = url;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="mt-3 block overflow-hidden rounded-2xl border border-border/40 bg-card hover:bg-muted/20 transition-all shadow-xs group"
    >
      {data.image && (
        <div className="relative aspect-[1.91/1] max-h-52 w-full overflow-hidden bg-muted/30">
          <img
            src={data.image}
            alt={data.title || "Link Preview"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="p-3.5 space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
          {data.favicon ? (
            <img
              src={data.favicon}
              alt=""
              className="size-3.5 rounded-xs"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Globe className="size-3.5 opacity-70" />
          )}
          <span className="truncate">{data.siteName || domain}</span>
          <ExternalLink className="size-3 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>

        {data.title && (
          <h4 className="font-bold text-xs text-foreground line-clamp-1 group-hover:underline">
            {data.title}
          </h4>
        )}

        {data.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {data.description}
          </p>
        )}
      </div>
    </a>
  );
}
