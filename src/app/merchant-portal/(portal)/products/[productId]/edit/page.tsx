import type { Metadata } from "next";
import { EditProductClient } from "./edit-product-client";

export const metadata: Metadata = {
  title: "Edit Product | Merchant Portal",
  description: "Update menu item details, pricing, availability, and customizations.",
  robots: { index: false, follow: false },
};

interface EditProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params;
  return <EditProductClient productId={productId} />;
}
