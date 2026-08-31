import { FiltersClient } from "@/app/app/(dating)/dating/filters/filters-client";

export const metadata = {
  title: "Matching Preferences · Campus Match",
  description: "Customize your campus match deck filters and privacy in a safe, mutual space.",
};

export default function FiltersPage() {
  return <FiltersClient />;
}
