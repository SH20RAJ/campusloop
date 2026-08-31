import type { Metadata } from "next";
import { LikesClient } from "./likes-client";

export const metadata: Metadata = {
  title: "Likes You",
  robots: { index: false, follow: false },
};

export default function DatingLikesPage() {
  return <LikesClient />;
}
