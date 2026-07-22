import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Directory & Colleges | CampusLoop",
  description: "Browse and search over 1,350+ verified colleges and universities in India on CampusLoop.",
};

export default function RootCollegesRedirectPage() {
  redirect("/app/colleges");
}
