import { Metadata } from "next";
import { JoinForm } from "@/components/ui/join-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Join CampusLoop | Verified Student Network",
  description: "Sign in or register for your verified campus social network.",
};

export default function JoinPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid-pattern px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[10%] right-[10%] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground font-semibold">Loading loop...</span>
        </div>
      }>
        <JoinForm />
      </Suspense>
    </div>
  );
}
