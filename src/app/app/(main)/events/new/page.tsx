import { Metadata } from "next";
import { NewEventClient } from "./new-event-client";

export const metadata: Metadata = {
  title: "Host a Campus Event or Hackathon | CampusLoop",
  description:
    "Host hackathons, workshops, cultural fests, and student competitions for your college club or national campus audience.",
};

export default function NewEventPage() {
  return <NewEventClient />;
}
