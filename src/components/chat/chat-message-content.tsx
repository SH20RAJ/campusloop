"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { extractEmbedsFromText } from "@/lib/embeds";
import { ArticleEmbed } from "@/components/embeds/article-embed";
import { CommunityEmbed } from "@/components/embeds/community-embed";
import { EventEmbed } from "@/components/embeds/event-embed";
import { LinkPreviewEmbed } from "@/components/embeds/link-preview-embed";
import { SpotifyEmbed } from "@/components/embeds/spotify-embed";
import { UserProfileEmbed } from "@/components/embeds/user-profile-embed";
import { YouTubeEmbed } from "@/components/embeds/youtube-embed";

interface ChatMessageContentProps {
  content: string;
  isMe: boolean;
}

/**
 * Splits text into tokens: @mentions, URLs, and regular text,
 * rendering links and mentions interactively.
 */
function renderFormattedMessage(text: string, isMe: boolean) {
  // Regex matches URLs OR @mentions
  const tokenRegex = /(https?:\/\/[^\s<>"']+|@[a-zA-Z0-9_]+)/gi;
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
              ? "inline-flex items-center font-bold px-1.5 py-0.5 mx-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors underline-offset-2 hover:underline"
              : "inline-flex items-center font-bold px-1.5 py-0.5 mx-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors underline-offset-2 hover:underline"
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
                  ? "font-semibold underline decoration-white/60 hover:decoration-white text-white break-all transition-colors"
                  : "font-semibold underline decoration-primary/50 hover:decoration-primary text-primary break-all transition-colors"
              }
            >
              {cleanUrl}
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
                ? "inline-flex items-center gap-0.5 font-medium underline decoration-white/60 hover:decoration-white text-white/95 break-all transition-colors"
                : "inline-flex items-center gap-0.5 font-medium underline decoration-primary/50 hover:decoration-primary text-primary break-all transition-colors"
            }
          >
            <span>{cleanUrl}</span>
            <ExternalLink className="size-3 shrink-0 opacity-75" />
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
  const embeds = useMemo(() => {
    if (!content) return [];
    return extractEmbedsFromText(content);
  }, [content]);

  // Render at most 2 embeds per chat bubble to keep messages compact
  const topEmbeds = embeds.slice(0, 2);

  return (
    <div className="space-y-1.5 text-left">
      {/* Formatted body text with left alignment */}
      <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-left">
        {renderFormattedMessage(content, isMe)}
      </p>

      {/* Embedded interactive artifacts (Profiles, Events, Communities, Articles, etc.) */}
      {topEmbeds.length > 0 && (
        <div className="mt-2 space-y-2 pt-1 border-t border-white/10 dark:border-border/30 text-left">
          {topEmbeds.map((embed, idx) => {
            const key = `${embed.type}-${embed.rawUrl}-${idx}`;

            switch (embed.type) {
              case "internal_profile":
                return embed.username ? (
                  <UserProfileEmbed key={key} username={embed.username} />
                ) : null;

              case "internal_event":
                return embed.id ? <EventEmbed key={key} eventId={embed.id} /> : null;

              case "internal_community":
                return embed.slug ? <CommunityEmbed key={key} slugOrId={embed.slug} /> : null;

              case "internal_article":
                return embed.slug ? <ArticleEmbed key={key} slug={embed.slug} /> : null;

              case "youtube":
                return embed.id ? (
                  <YouTubeEmbed key={key} videoId={embed.id} rawUrl={embed.rawUrl} />
                ) : null;

              case "spotify":
                return embed.embedUrl ? <SpotifyEmbed key={key} embedUrl={embed.embedUrl} /> : null;

              case "opengraph":
                return <LinkPreviewEmbed key={key} url={embed.rawUrl} />;

              default:
                return null;
            }
          })}
        </div>
      )}
    </div>
  );
}
