import { DatingClient } from "./dating-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dating & Match | CampusLoop",
  description: "Swipe to match, connect anonymously, and chat privately with students from your campus.",
  robots: { index: true, follow: true },
};

export default function DatingPage() {
  return <DatingClient />;
}
