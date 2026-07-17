import { AboutClient } from "./about-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | CampusLoop",
  description: "Learn more about the verified social network built exclusively for college students. Verify domain whitelist eligibility.",
};

export default function AboutPage() {
  return <AboutClient />;
}
