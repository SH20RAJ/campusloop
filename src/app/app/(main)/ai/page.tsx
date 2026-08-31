import type { Metadata } from "next";
import { CampusAiClient } from "@/components/ai/campus-ai-client";

export const metadata: Metadata = {
  title: "Campus AI",
  description:
    "Ask your campus. Find notes, study tips, marketplace listings, events, and student discussions.",
};

export default function CampusAiPage() {
  return <CampusAiClient />;
}
