import { DatingClient } from "./dating-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dating & Match | CampusLoop",
  description: "Swipe to match, connect anonymously, and chat privately with students from your campus.",
};

export default function DatingPage() {
  return <DatingClient />;
}
