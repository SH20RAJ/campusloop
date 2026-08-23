import { redirect } from "next/navigation";

export default function SignInRedirect() {
  redirect("/join?mode=signin");
}
