import { Metadata } from "next";
import { OverviewClient } from "./overview-client";

export const metadata: Metadata = {
  title: "Platform Overview & Strategic Brief | CampusLoop",
  description:
    "Comprehensive overview of CampusLoop's verified campus architecture, market sizing, network density moats, and product layers.",
};

export default function OverviewPage() {
  return <OverviewClient />;
}
