import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CollegeForm } from "./college-form";

export const metadata = {
  title: "Add New College",
};

export default function NewCollegePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/colleges"
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Colleges
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Add New College</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Register a new institution and configure its allowed email domains.
        </p>
      </div>

      <CollegeForm />
    </div>
  );
}
