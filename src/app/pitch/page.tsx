import { PitchClient } from "./pitch-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Pitch Deck | CampusLoop",
  description: "Explore CampusLoop's market size, problem statements, business model, and interactive valuation metrics.",
};

export default function PitchPage() {
  return <PitchClient />;
}
