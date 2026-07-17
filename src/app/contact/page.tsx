import { ContactClient } from "./contact-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support | CampusLoop",
  description: "Get in touch with the CampusLoop support, safety, and campus partnership team.",
};

export default function ContactPage() {
  return <ContactClient />;
}
