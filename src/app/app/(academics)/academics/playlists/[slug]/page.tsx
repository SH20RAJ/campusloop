import type { Metadata } from "next";
import { getDb } from "@/db";
import { PlaylistDetailClient } from "./playlist-detail-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();

  const playlist = await db.query.academicPlaylists.findFirst({
    where: (pl, { or, eq }) => or(eq(pl.slug, slug), eq(pl.id, slug)),
    with: {
      creator: true,
      institution: true,
    },
  });

  if (!playlist) {
    return {
      title: "Study Playlist | CampusLoop Academics",
    };
  }

  const college = playlist.institution?.name ? ` • ${playlist.institution.name}` : "";
  const branchInfo = playlist.branch ? ` (${playlist.branch})` : "";

  return {
    title: `${playlist.title}${branchInfo} | CampusLoop Study Playlists`,
    description:
      playlist.description ||
      `Curated bundle of ${playlist.itemsCount} exam papers, handwritten notes, and formulas for ${playlist.branch} on CampusLoop.${college}`,
    openGraph: {
      title: playlist.title,
      description:
        playlist.description ||
        `Curated study playlist for ${playlist.branch} on CampusLoop. Free zero-login reading & download.`,
    },
  };
}

export default async function PlaylistDetailPage({ params }: Props) {
  const { slug } = await params;
  return <PlaylistDetailClient slugOrId={slug} />;
}
