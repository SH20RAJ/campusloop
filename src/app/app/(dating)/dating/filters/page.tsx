import { Metadata } from "next";
import { FiltersClient } from "./filters-client";

export const metadata: Metadata = {
  title: "Match Preferences | CampusLoop",
  robots: { index: false, follow: false },
};

export default function DatingFiltersPage() {
  return <FiltersClient />;
}
