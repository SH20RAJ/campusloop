import { Metadata } from "next";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Search Posts, Colleges & Students | CampusLoop",
  description: "Search confessions, polls, verified college campuses, and student profiles on CampusLoop.",
};

export default function SearchPage() {
  return <SearchClient />;
}
