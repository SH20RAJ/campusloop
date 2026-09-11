import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { isAllowedAdminEmail } from "../admin/_lib/session";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Portal | CampusLoop",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await hexclaveServerApp.getUser();
  if (user && isAllowedAdminEmail(user.primaryEmail)) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="text-center space-y-1.5">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-xs text-muted-foreground">
            Sign in with an authorized administrator account to access the moderation and management console.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
