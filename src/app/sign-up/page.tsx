import { SignUp } from "@hexclave/next";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | CampusLoop",
};

export default function SignUpPage() {
  return <SignUp fullPage />;
}
