export function usernameFromEmail(email?: string | null) {
	const base = email?.split("@")[0] ?? "student";
	return normalizeUsername(base);
}

export function normalizeUsername(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_+|_+$/g, "")
		.slice(0, 24);
}

export function parseInterests(value: string) {
	return value
		.split(",")
		.map((interest) => interest.trim())
		.filter(Boolean)
		.slice(0, 12);
}
