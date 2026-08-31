import type { Metadata } from "next";
import { NewProductClient } from "./new-product-client";

export const metadata: Metadata = {
  title: "Add Product | Merchant Portal",
  description: "Add a new menu item or rental to your store catalog.",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return <NewProductClient />;
}
