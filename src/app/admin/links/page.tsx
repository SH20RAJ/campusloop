import type { Metadata } from "next";
import { AdminLinksClient } from "./links-table";

export const metadata: Metadata = {
  title: "Short Links & Referrals",
  description: "Track campaigns, short links, and referral traffic in real time.",
};

export default function AdminLinksPage() {
  return <AdminLinksClient />;
}
