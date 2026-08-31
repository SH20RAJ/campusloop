import type { Metadata } from "next";
import { AdminMerchantEditClient } from "./admin-merchant-edit-client";

interface AdminMerchantEditPageProps {
  params: Promise<{ merchantId: string }>;
}

export const metadata: Metadata = {
  title: "Merchant Management & Menu Editor",
  description: "Manage store details, catalog items, and view live order stream.",
  robots: { index: false, follow: false },
};

export default async function AdminMerchantEditPage({ params }: AdminMerchantEditPageProps) {
  const { merchantId } = await params;
  return <AdminMerchantEditClient merchantId={merchantId} />;
}
