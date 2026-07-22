import CollegesDirectoryPage from "@/app/app/(main)/colleges/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colleges Directory & Directory | CampusLoop",
  description: "Browse and search over 1,350+ verified colleges and universities in India on CampusLoop.",
};

export default function PublicCollegesPage() {
  return <CollegesDirectoryPage />;
}
