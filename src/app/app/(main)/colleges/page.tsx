import { Metadata } from "next";
import CollegesClient from "./colleges-client";

export const metadata: Metadata = {
  title: "Campus Directory & Colleges | CampusLoop",
  description: "Browse and search over 1,350+ verified colleges and universities in India on CampusLoop.",
};

export default function CollegesPage() {
  return <CollegesClient />;
}
