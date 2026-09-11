"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface DocsShareToolbarProps {
  title: string;
  viralQuote: string;
  url: string;
}

export function DocsShareToolbar({ title, viralQuote, url }: DocsShareToolbarProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    sounds.pop();
    haptics.light();
    navigator.clipboard.writeText(`"${viralQuote}" — ${title} via ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tweetText = encodeURIComponent(
    `"${viralQuote}"\n\nRead the architecture breakdown on CampusLoop:\n${url}`
  );
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-y border-border/40 py-3">
      <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase mr-2">
        Share Essay:
      </span>

      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-muted/20 hover:bg-muted/60 text-foreground font-mono text-xs font-semibold transition-colors"
      >
        <span className="font-bold">𝕏</span>
        <span>Share on X</span>
      </a>

      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-muted/20 hover:bg-muted/60 text-foreground font-mono text-xs font-semibold transition-colors"
      >
        <span className="font-bold text-[#1D9BF0]">in</span>
        <span>Post to LinkedIn</span>
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-muted/20 hover:bg-muted/60 text-foreground font-mono text-xs font-semibold transition-colors cursor-pointer ml-auto"
      >
        {copied ? (
          <>
            <Check className="size-3 text-emerald-500" />
            <span className="text-emerald-500">Quote Copied</span>
          </>
        ) : (
          <>
            <Copy className="size-3 text-muted-foreground" />
            <span>Copy Viral Quote</span>
          </>
        )}
      </button>
    </div>
  );
}
