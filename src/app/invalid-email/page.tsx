import Link from "next/link";
import { ShieldAlertIcon } from "lucide-react";

export default function InvalidEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-6 rounded-[32px] bg-card p-8 shadow-xl border border-white/5">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/15 p-4 text-destructive">
            <ShieldAlertIcon className="h-10 w-10" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-white">College Email Required</h1>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          CampusLoop is a verified student-only network. To join your campus feed, you must sign up using your official college-provided email address.
        </p>

        <div className="rounded-2xl bg-white/5 p-4 text-left border border-white/5">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">How to fix:</h3>
          <ul className="mt-2 list-disc list-inside text-xs text-muted-foreground space-y-1">
            <li>Sign out of this account</li>
            <li>Sign up again using your student email (e.g. <code className="text-white">name@college.edu</code>)</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/handler/sign-out"
            className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary/90"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
