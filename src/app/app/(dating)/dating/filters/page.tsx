import type { Metadata } from "next";
import { FiltersClient } from "./filters-client";

export const metadata: Metadata = {
  title: "Match Preferences",
  robots: { index: false, follow: false },
};

export default function DatingFiltersPage() {
  return <FiltersClient />;
}
