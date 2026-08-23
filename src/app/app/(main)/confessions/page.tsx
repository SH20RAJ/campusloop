import type { Metadata } from "next";
import { ConfessionsFeed } from "./confessions-feed";

export const metadata: Metadata = {
  title: "Campus Confessions — 100% Anonymous",
  description:
    "Read and share anonymous confessions from your college. Identity-sealed with cryptographic pseudonyms — anonymous to peers, safe for the community.",
  robots: { index: true, follow: true },
};

export default function ConfessionsPage() {
  return <ConfessionsFeed />;
}
