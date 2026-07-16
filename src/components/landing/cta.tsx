import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaProps {
  isAuthenticated: boolean;
}

export function CTA({ isAuthenticated }: CtaProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-8">
      <div className="rounded-xl border border-border bg-card px-8 py-12 text-center shadow-sm md:px-16 md:py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Stop lurking, start posting.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Verify with your college email and join the loop. Connect with
          classmates, share confessions, and find your people — all in a
          space built for students.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {isAuthenticated ? (
            <Link href="/app/campus">
              <Button size="lg" className="h-11 gap-2 px-6 text-sm">
                Enter CampusLoop
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up">
                <Button size="lg" className="h-11 gap-2 px-6 text-sm">
                  Sign Up with Student Email
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg" className="h-11 px-6 text-sm">
                  I already have an account
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
