# CampusLoop

CampusLoop is a campus-first social app built with Next.js App Router, Stack Auth, Drizzle ORM, and PostgreSQL. The MVP includes authenticated onboarding, institution matching from the imported colleges dataset, campus/global/confession/poll feeds, post detail interactions, reporting, blocking, moderator review tools, and a public landing page.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Stack Auth for sign-in, sign-up, sessions, and user account UI
- Drizzle ORM with PostgreSQL via `postgres`
- Bun for package scripts
- OpenNext for Cloudflare deployment

## Setup

Install dependencies:

```bash
bun install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Fill in the Stack Auth keys and database URL. `DATABASE_URL` is preferred, while `DB_URL` is supported for compatibility with existing local config.

Push the schema and seed the colleges dataset:

```bash
bun run db:push
bun run db:seed
```

Start the app:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Scripts

- `bun run dev` - run Next.js locally
- `bun run build` - production Next.js build
- `bun run lint` - ESLint flat-config check
- `bunx tsc --noEmit` - TypeScript check
- `bun run db:generate` - generate Drizzle migrations
- `bun run db:migrate` - run Drizzle migrations
- `bun run db:push` - push schema directly to the database
- `bun run db:seed` - import `src/lib/colleges.csv`
- `bun run db:studio` - open Drizzle Studio
- `bun run preview` - build and preview on the OpenNext Cloudflare runtime
- `bun run deploy` - build and deploy through OpenNext Cloudflare

## Auth Flow

- Public routes: `/`, `/sign-in`, `/sign-up`, `/handler/[...stack]`
- App routes require a Stack Auth user.
- New authenticated users are sent to `/app/onboarding`.
- Completed users land on `/app/campus`.
- Moderator routes require a `MODERATOR` or `ADMIN` profile role.

Server auth redirects are handled locally with Next `redirect()` so OAuth callbacks are not invoked from a non-browser server context.

## Data Model

The Drizzle schema lives in `src/db/schema.ts`. Core tables include:

- `userProfiles`
- `institutions`
- `institutionDomains`
- `posts`
- `comments`
- `pollOptions`
- `pollVotes`
- `votes`
- `reports`
- `blocks`
- `moderationActions`
- `institutionRequests`

The seed script is idempotent and imports college records plus normalized website domains from `src/lib/colleges.csv`.

## Safety Model

Anonymous posts and comments hide public identity while retaining the private author profile ID for moderation. Rule-based pre-checks can block or route risky content for review. Users can report posts, comments, and profiles, block other users, and moderators can review reports in `/app/admin`.

## Verification

Current repo checks:

```bash
bun run lint
bunx tsc --noEmit
bun run build
```
