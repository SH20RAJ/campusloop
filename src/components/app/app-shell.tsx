"use client";

import {
	BubbleChatSparkIcon,
	Chart01Icon,
	Compass01Icon,
	DashboardSquare01Icon,
	Globe02Icon,
	Home01Icon,
	PlusSignIcon,
	Shield01Icon,
	UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AppShellProps = {
	children: React.ReactNode;
	profile: {
		displayName: string;
		username: string;
		role: "STUDENT" | "MODERATOR" | "ADMIN";
	};
	institution: {
		name: string;
		state: string | null;
		district: string | null;
	};
};

const navItems = [
	{ href: "/app/campus", label: "Campus", icon: Home01Icon },
	{ href: "/app/global", label: "Global", icon: Globe02Icon },
	{ href: "/app/confessions", label: "Confess", icon: BubbleChatSparkIcon },
	{ href: "/app/polls", label: "Polls", icon: Chart01Icon },
	{ href: "/app/profile", label: "Profile", icon: UserCircleIcon },
	{ href: "/app/safety", label: "Safety", icon: Shield01Icon },
] as const;

export function AppShell({ children, profile, institution }: AppShellProps) {
	const pathname = usePathname();
	const canModerate = profile.role === "ADMIN" || profile.role === "MODERATOR";
	const desktopNav = canModerate
		? [...navItems, { href: "/app/admin", label: "Admin", icon: DashboardSquare01Icon }]
		: navItems;

	return (
		<div className="min-h-screen bg-[#f6f8fb] text-slate-950">
			<aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-white/90 px-4 py-5 backdrop-blur lg:block">
				<Link href="/app/campus" className="flex items-center gap-3 px-2">
					<div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
						<HugeiconsIcon icon={Compass01Icon} className="size-5" />
					</div>
					<div>
						<p className="text-base font-semibold">CampusLoop</p>
						<p className="text-xs text-muted-foreground">Verified student social</p>
					</div>
				</Link>

				<div className="mt-6 rounded-xl border bg-slate-50 p-3">
					<p className="text-xs font-medium uppercase text-muted-foreground">Current campus</p>
					<p className="mt-1 line-clamp-2 text-sm font-semibold">{institution.name}</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{[institution.district, institution.state].filter(Boolean).join(", ") || "India"}
					</p>
				</div>

				<nav className="mt-6 space-y-1">
					{desktopNav.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-slate-100 hover:text-slate-950",
									isActive && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
								)}
							>
								<HugeiconsIcon icon={item.icon} className="size-5" />
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="absolute inset-x-4 bottom-5">
					<Button asChild className="h-11 w-full rounded-xl">
						<Link href="/app/post/new">
							<HugeiconsIcon icon={PlusSignIcon} className="size-5" />
							Create post
						</Link>
					</Button>
				</div>
			</aside>

			<div className="lg:pl-72">
				<header className="sticky top-0 z-20 border-b bg-white/88 px-4 py-3 backdrop-blur">
					<div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold">{institution.name}</p>
							<p className="text-xs text-muted-foreground">Campus · India · Global</p>
						</div>
						<div className="flex items-center gap-2">
							<Button asChild size="sm" className="hidden rounded-xl sm:inline-flex">
								<Link href="/app/post/new">
									<HugeiconsIcon icon={PlusSignIcon} className="size-4" />
									Post
								</Link>
							</Button>
							<UserButton showUserInfo={false} />
						</div>
					</div>
				</header>

				<div className="pb-24 lg:pb-0">{children}</div>
			</div>

			<Link
				href="/app/post/new"
				className="fixed bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl shadow-slate-950/25 lg:hidden"
				aria-label="Create post"
			>
				<HugeiconsIcon icon={PlusSignIcon} className="size-6" />
			</Link>

			<nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
				<div className="mx-auto grid max-w-md grid-cols-5 gap-1">
					{navItems.slice(0, 5).map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted-foreground",
									isActive && "bg-slate-950 text-white",
								)}
							>
								<HugeiconsIcon icon={item.icon} className="size-5" />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</div>
	);
}
