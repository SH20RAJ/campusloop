/**
 * Backwards compatibility re-export.
 * All canonical gamification constants are maintained in `@/constants/gamification`.
 *
 * Keep this module free of database imports: it is pulled into client
 * components for the clout tier constants, and importing `@/db` here drags
 * `node:crypto` into the browser bundle and breaks the build.
 * Server-side point mutations live in `@/lib/gamification-server`.
 */

export * from "@/constants/gamification";
