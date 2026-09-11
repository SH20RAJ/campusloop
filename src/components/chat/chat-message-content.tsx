"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";
import { PostEmbedRenderer } from "@/components/embeds/post-embed-renderer";

interface ChatMessageContentProps {
  content: string;
  isMe: boolean;
}

/**                   
 * Splits text into tokens: @mentions, URLs, and regular text,
 * using industry-standard boundary detection (preventing credentials like mart@password123 from matching).
 */
function renderFormattedMessage(text: string, isMe: boolean) {
  // Industry-standard tokenizer regex:
  // 1. Matches URLs: https?://...
  // 2. Matches username mentions strictly when preceded by start-of-line, whitespace, or open punctuation
  // 3. Negative lookbehind ensures credentials like 'mart@password123' or emails stay untouched
  const tokenRegex = /(https?:\/\/[^\s<>"']+|(?<=^|[\s([{<,;:/])@[a-zA-Z0-9_]{2,32}\b)/gi;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Handle @username mention
    if (part.startsWith("@") && part.length > 1) {
      const username = part.slice(1);
      return (
        <Link
          key={index}
          href={`/@${username}`}
          onClick={(e) => e.stopPropagation()}
          className={
            isMe
              ? "inline-flex items-center font-bold px-1.5 py-0.5 mx-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors underline-offset-2 hover:underline select-text"
              : "inline-flex items-center font-bold px-1.5 py-0.5 mx-0.5 rounded-md bg-primary/15 hover:bg-primary/25 text-primary transition-colors underline-offset-2 hover:underline select-text"
          }
        >
          {part}
        </Link>
      );
    }

    // Handle URLs
    if (/^https?:\/\//i.test(part)) {
      // Clean trailing punctuation that might have been part of sentence
      const cleanUrl = part.replace(/[.,;!?)]+$/, "");
      const trailing = part.slice(cleanUrl.length);

      let isInternal = false;
      let internalHref = cleanUrl;

      try {
        const parsed = new URL(cleanUrl);
        if (
          parsed.hostname === "campusloop.space" ||
          parsed.hostname === "localhost" ||
          parsed.hostname === "127.0.0.1"
        ) {
          isInternal = true;
          internalHref = parsed.pathname + parsed.search + parsed.hash;
        }
      } catch {
        // Ignore parse error
      }

      if (isInternal) {
        return (
          <React.Fragment key={index}>
            <Link
              href={internalHref}
              onClick={(e) => e.stopPropagation()}
              className={
                isMe
                  ? "inline-flex items-center gap-1 font-bold underline decoration-white/80 hover:decoration-white text-white break-all transition-colors bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded-md"
                  : "inline-flex items-center gap-1 font-bold underline decoration-primary/70 hover:decoration-primary text-primary break-all transition-colors bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 rounded-md"
              }
            >
              <span>{cleanUrl}</span>
              <ExternalLink className="size-3 shrink-0 opacity-85" />
            </Link>
            {trailing}
          </React.Fragment>
        );
      }

      return (
        <React.Fragment key={index}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={
              isMe
                ? "inline-flex items-center gap-1 font-bold underline decoration-white/80 hover:decoration-white text-white break-all transition-colors bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded-md"
                : "inline-flex items-center gap-1 font-bold underline decoration-sky-500/70 hover:decoration-sky-500 text-sky-600 dark:text-sky-400 break-all transition-colors bg-sky-500/10 hover:bg-sky-500/20 px-1.5 py-0.5 rounded-md"
            }
          >
            <span>{cleanUrl}</span>
            <ExternalLink className="size-3 shrink-0 opacity-85" />
          </a>
          {trailing}
        </React.Fragment>
      );
    }

    // Normal text
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function ChatMessageContent({ content, isMe }: ChatMessageContentProps) {
  return (
    <div className="space-y-1.5 text-left">
      {/* Formatted body text with left alignment */}
      <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-left">
        {renderFormattedMessage(content, isMe)}
      </p>

      {/* Embedded interactive artifacts (Profiles, Events, Communities, Articles, 9GAG, Music, etc.) */}
      <div className="mt-2 pt-1 border-t border-white/10 dark:border-border/30 text-left">
        <PostEmbedRenderer content={content} limit={2} />
      </div>
    </div>
  );
}
