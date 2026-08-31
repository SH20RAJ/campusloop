import type { Metadata } from "next";
import { MoreClient } from "./more-client";

export const metadata: Metadata = {
  title: "More",
  description:
    "Explore all campus directories, secret crush vault, match mode, confessions, and settings on CampusLoop.",
};

export default function MorePage() {
  return <MoreClient />;
}
