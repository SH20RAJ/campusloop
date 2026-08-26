import { HexclaveHandler } from "@hexclave/next";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign In",
	robots: { index: false, follow: false },
};

export default function Handler() {
  return <HexclaveHandler fullPage />;
}
