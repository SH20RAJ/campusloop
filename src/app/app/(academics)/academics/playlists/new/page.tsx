import type { Metadata } from "next";
import { NewPlaylistClient } from "./new-playlist-client";

export const metadata: Metadata = {
  title: "Create Study Playlist | CampusLoop Academics",
  description:
    "Assemble and curate custom study playlists of engineering notes, 5-year PYQs, and cheat sheets for your college and semester on CampusLoop.",
};

export default function NewPlaylistPage() {
  return <NewPlaylistClient />;
}
