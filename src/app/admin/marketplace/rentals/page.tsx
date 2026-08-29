import { Metadata } from "next";
import { AdminRentalsClient } from "./admin-rentals-client";

export const metadata: Metadata = {
  title: "Bike Fleet & Rentals Oversight | CampusLoop Admin",
  description: "Admin oversight for campus bike fleets, bookings, and deposit dispute resolution.",
  robots: { index: false, follow: false },
};

export default function AdminRentalsPage() {
  return <AdminRentalsClient />;
}
