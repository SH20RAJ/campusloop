import type { Metadata } from "next";
import { CrushClient } from "./crush-client";

export const metadata: Metadata = {
  title: "Secret Crush Vault | CampusLoop",
  description:
    "Manage your 5-slot secret crush vault on CampusLoop with 100% intent-hidden campus matchmaking.",
};

export default function SecretCrushPage() {
  return <CrushClient />;
}
