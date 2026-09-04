import type { Metadata } from "next";
import { DemoClient } from "./demo-client";

export const metadata: Metadata = {
  title: "Public Investor & Tester Demo Access | CampusLoop",
  description:
    "Instant testing credentials and all-access demo account for investors, evaluators, and public testers to experience CampusLoop with all verified features unlocked.",
  openGraph: {
    title: "Public Investor & Tester Demo Access | CampusLoop",
    description:
      "Instant testing credentials and all-access demo account for investors, evaluators, and public testers to experience CampusLoop.",
  },
};

export default function DemoPage() {
  return <DemoClient />;
}
