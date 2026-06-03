import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
	"Campus feed",
	"Anonymous confessions",
	"Polls",
	"Global mode",
	"Safety system",
];

const steps = [
	{ title: "Verify", copy: "Join with your student identity and get mapped to your real campus." },
	{ title: "Join campus", copy: "See the feed, questions, events, clubs, hostel chatter, and lost-and-found." },
	{ title: "Post, confess, poll", copy: "Use your name when it helps, or go anonymous when the topic needs it." },
	{ title: "Discover students", copy: "Find classmates by interests, courses, city, and future match-mode intent." },
];

export default function Home() {
	return (
		<main className="min-h-screen bg-[#f8fafc] text-slate-950">
			<section className="relative min-h-[92vh] overflow-hidden bg-[#101827] text-white">
				<div className="absolute inset-0 opacity-90">
					<div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,24,39,0.96),rgba(16,24,39,0.72)_45%,rgba(20,83,45,0.5))]" />
					<div className="absolute right-[-8rem] top-12 hidden w-[46rem] rotate-[-8deg] gap-4 lg:grid">
						{Array.from({ length: 9 }).map((_, index) => (
							<div
								key={index}
								className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/20 backdrop-blur"
							>
								<div className="mb-3 flex items-center gap-2">
									<div className="size-8 rounded-full bg-emerald-300" />
									<div>
										<div className="h-2.5 w-24 rounded-full bg-white/40" />
										<div className="mt-1.5 h-2 w-16 rounded-full bg-white/20" />
									</div>
								</div>
								<div className="space-y-2">
									<div className="h-2.5 rounded-full bg-white/35" />
									<div className="h-2.5 w-4/5 rounded-full bg-white/25" />
									<div className="h-2.5 w-2/3 rounded-full bg-white/20" />
								</div>
								<div className="mt-4 flex gap-2">
									<div className="h-7 w-16 rounded-full bg-sky-300/60" />
									<div className="h-7 w-20 rounded-full bg-amber-300/60" />
								</div>
							</div>
						))}
					</div>
				</div>

				<header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
					<Link href="/" className="text-lg font-semibold tracking-tight">
						CampusLoop
					</Link>
					<nav className="hidden items-center gap-6 text-sm text-white/74 sm:flex">
						<a href="#features">Features</a>
						<a href="#safety">Safety</a>
						<a href="#ambassadors">Ambassadors</a>
					</nav>
					<Button asChild variant="secondary" className="rounded-full">
						<Link href="/sign-up">Join CampusLoop</Link>
					</Button>
				</header>

				<div className="relative z-10 mx-auto flex min-h-[calc(92vh-5.5rem)] max-w-6xl flex-col justify-center px-4 pb-24 pt-10">
					<div className="max-w-3xl">
						<Badge className="mb-5 rounded-full bg-white/12 text-white hover:bg-white/12">Verified student-only social</Badge>
						<h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">CampusLoop</h1>
						<p className="mt-6 max-w-2xl text-xl leading-8 text-white/78 sm:text-2xl">
							Join your real campus. Speak freely. Stay safe. Meet students like you.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg" className="h-12 rounded-full bg-emerald-300 px-6 text-slate-950 hover:bg-emerald-200">
								<Link href="/sign-up">Join CampusLoop</Link>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="h-12 rounded-full border-white/20 bg-white/8 px-6 text-white hover:bg-white/15 hover:text-white"
							>
								<Link href="/sign-in">Sign in</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
				{steps.map((step) => (
					<div key={step.title} className="rounded-2xl border bg-white p-5 shadow-sm">
						<p className="text-sm font-semibold text-emerald-700">{step.title}</p>
						<p className="mt-3 text-sm leading-6 text-muted-foreground">{step.copy}</p>
					</div>
				))}
			</section>

			<section id="features" className="border-y bg-white">
				<div className="mx-auto max-w-6xl px-4 py-16">
					<div className="max-w-2xl">
						<p className="text-sm font-semibold text-sky-700">Built for campus density</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
							One verified social layer for questions, confessions, polls, and discovery.
						</h2>
					</div>
					<div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
						{features.map((feature) => (
							<div key={feature} className="rounded-2xl border bg-slate-50 p-4 text-sm font-semibold">
								{feature}
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="safety" className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr]">
				<div>
					<p className="text-sm font-semibold text-rose-700">Safety-first anonymity</p>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
						Anonymous to students, accountable to the safety system.
					</h2>
				</div>
				<div className="space-y-4 text-base leading-7 text-muted-foreground">
					<p>
						CampusLoop protects student expression, but anonymous abuse is not allowed. Reports, blocks, rate limits,
						and moderation actions are designed into the product from day one.
					</p>
					<p>
						Normal students never see anonymous author identity. Moderators can act on abuse through private,
						auditable records.
					</p>
				</div>
			</section>

			<section id="ambassadors" className="bg-slate-950 text-white">
				<div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-semibold text-emerald-300">Campus ambassador program</p>
						<h2 className="mt-2 text-3xl font-semibold tracking-tight">Bring CampusLoop to your college.</h2>
					</div>
					<Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
						<Link href="/sign-up">Start your campus</Link>
					</Button>
				</div>
			</section>

			<footer className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
				<p>CampusLoop</p>
				<p>Speak freely. Stay safe. Build campus density.</p>
			</footer>
		</main>
	);
}
