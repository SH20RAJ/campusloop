import { Metadata } from "next";
import { DatingAppClient } from "./dating-app-client";

export const metadata: Metadata = {
  title: "Campus Match | CampusLoop",
  description:
    "Swipe to match with verified college students. Interest-based matching, campus filters, and instant chat on CampusLoop.",
  robots: { index: true, follow: true },
};

export default function DatingPage() {
  return <DatingAppClient />;
}
