import type { Metadata } from "next";
import { EventsClient } from "./events-client";

export const metadata: Metadata = {
  title: "Campus Events & Hackathons | CampusLoop",
  description:
    "Discover hackathons, workshops, college fests, competitions, and technical meetups across Indian universities. Register solo or in teams.",
  openGraph: {
    title: "Campus Events & Hackathons | CampusLoop",
    description:
      "Join hackathons, tech bootcamps, and college fests with verified students from your campus and across India.",
  },
};

export default function EventsPage() {
  return <EventsClient />;
}
