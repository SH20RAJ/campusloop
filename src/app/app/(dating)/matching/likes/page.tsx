import { LikesClient } from "@/app/app/(dating)/dating/likes/likes-client";

export const metadata = {
  title: "Likes You · Campus Match",
  description: "See verified students who matched with your vibe in a safe, mutual opt-in space.",
};

export default function LikesPage() {
  return <LikesClient />;
}
