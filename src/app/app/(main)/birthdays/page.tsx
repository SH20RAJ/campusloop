import { Metadata } from "next";
import { BirthdaysClient } from "@/components/birthdays/birthdays-client";

export const metadata: Metadata = {
  title: "Campus Birthdays & Celebrations | CampusLoop",
  description:
    "Discover today's birthdays in your college campus and across India. Send instant wishes, pop confetti, and check upcoming student birthdays on CampusLoop.",
  robots: { index: false, follow: false },
};

export default function BirthdaysPage() {
  return <BirthdaysClient />;
}
