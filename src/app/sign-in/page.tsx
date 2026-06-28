import { SignIn } from "@hexclave/next";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | CampusLoop",
};

export default function SignInPage() {
  return <SignIn fullPage />;
}
