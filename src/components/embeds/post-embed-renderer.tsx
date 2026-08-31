"use client";

import { useMemo } from "react";
import { extractEmbedsFromText } from "@/lib/embeds";
import { ArticleEmbed } from "./article-embed";
import { CommunityEmbed } from "./community-embed";
import { EventEmbed } from "./event-embed";
import { LinkPreviewEmbed } from "./link-preview-embed";
import { SpotifyEmbed } from "./spotify-embed";
import { UserProfileEmbed } from "./user-profile-embed";
import { YouTubeEmbed } from "./youtube-embed";

interface PostEmbedRendererProps {
  content: string;
}

export function PostEmbedRenderer({ content }: PostEmbedRendererProps) {
  const embeds = useMemo(() => {
    if (!content) return [];
    return extractEmbedsFromText(content);
  }, [content]);

  if (embeds.length === 0) return null;

  // Render at most 2 rich embeds per post to keep feed clean
  const limitedEmbeds = embeds.slice(0, 2);

  return (
    <div className="mt-1 space-y-2.5">
      {limitedEmbeds.map((embed, idx) => {
        const key = `${embed.type}-${embed.rawUrl}-${idx}`;

        switch (embed.type) {
          case "youtube":
            return embed.id ? <YouTubeEmbed key={key} videoId={embed.id} rawUrl={embed.rawUrl} /> : null;

          case "spotify":
            return embed.embedUrl ? <SpotifyEmbed key={key} embedUrl={embed.embedUrl} /> : null;

          case "internal_profile":
            return embed.username ? <UserProfileEmbed key={key} username={embed.username} /> : null;

          case "internal_community":
            return embed.slug ? <CommunityEmbed key={key} slugOrId={embed.slug} /> : null;

          case "internal_event":
            return embed.id ? <EventEmbed key={key} eventId={embed.id} /> : null;

          case "internal_article":
            return embed.slug ? <ArticleEmbed key={key} slug={embed.slug} /> : null;

          case "opengraph":
            return <LinkPreviewEmbed key={key} url={embed.rawUrl} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
