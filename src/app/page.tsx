import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 lg:px-12 backdrop-blur-md bg-background/80 fixed w-full z-50">
        <div className="text-xl font-bold tracking-tight text-primary">CampusLoop</div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Join Waitlist
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center mt-20 md:mt-0">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Join your real campus. <br />
            <span className="text-primary">Speak freely. Stay safe.</span>
          </h1>
          <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            CampusLoop is the verified social layer for college life: campus feed, confessions, polls, stories, chat, and student discovery — built for safety from day one.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-white shadow-lg transition-colors hover:bg-primary/90"
            >
              Verify with Student Email
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="mt-12 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Verified Students Only
            </span>
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              100% Safe Anonymity
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
