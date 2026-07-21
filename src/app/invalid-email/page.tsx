import { ShieldAlertIcon } from "lucide-react";
import Link from "next/link";

export default function InvalidEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md w-full space-y-6 rounded-xl bg-card p-8 shadow-sm border border-border">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive border border-destructive/20 animate-pulse">
            <ShieldAlertIcon className="h-6 w-6" />
          </div>
        </div>
        
        <h1 className="text-xl font-bold tracking-tight text-foreground">College Email Required</h1>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          CampusLoop is a verified student-only network. To join your campus feed, you must sign up using your official college-provided email address.
        </p>

        <div className="rounded-lg bg-muted p-4 text-left border border-border">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">How to fix:</h3>
          <ul className="mt-2 list-disc list-inside text-xs text-muted-foreground space-y-1">
            <li>Sign out of this account</li>
            <li>Sign up again using your student email (e.g. <code className="font-semibold text-foreground">name@college.edu</code>)</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="/handler/sign-out"
            className="flex w-full items-center justify-center rounded-lg bg-primary h-10 px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/95 transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}
