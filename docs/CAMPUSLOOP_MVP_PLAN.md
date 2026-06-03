# CampusLoop MVP Implementation Plan

## Current Stack Detected

- Framework: Next.js 16 App Router with React 19 and TypeScript.
- Runtime/deploy target: OpenNext for Cloudflare Workers, configured through `wrangler.jsonc`.
- Package manager: Bun, with `bun.lock` present.
- Styling/UI: Tailwind CSS 4, shadcn/ui components, Radix/Base UI primitives, Hugeicons.
- Auth: Stack Auth is already installed and wired with `StackProvider`, `StackTheme`, `StackClientApp`, and `StackServerApp`.
- Data source: `src/lib/colleges.csv` with Aishe code, name, state, district, website, establishment year, location, and slug.
- Database/ORM: no ORM or database client currently exists in the repo.

## Database Approach Chosen

Use Prisma ORM because the project has no existing ORM and the MVP needs a broad relational schema, migrations, idempotent seeding, typed queries, and Studio for inspection.

Implementation details:

- Add Prisma schema under `prisma/schema.prisma`.
- Add a generated Prisma client helper under `src/lib/db.ts`.
- Read the existing `DATABASE_URL` when present, with local compatibility for the currently detected `DB_URL` key.
- Add seed logic that parses `src/lib/colleges.csv`, normalizes website domains, inserts institutions, and inserts imported website domains idempotently.
- Add scripts for `db:generate`, `db:migrate`, `db:push`, `db:studio`, and `db:seed`.

## Pages And Routes To Create

Public:

- `/` landing page
- `/sign-in`
- `/sign-up`

Protected:

- `/app`
- `/app/onboarding`
- `/app/campus`
- `/app/global`
- `/app/confessions`
- `/app/polls`
- `/app/post/new`
- `/app/post/[id]`
- `/app/profile`
- `/app/settings`
- `/app/safety`
- `/app/admin`

Protected route behavior:

- Unauthenticated users redirect to `/sign-in`.
- Authenticated users without a completed `UserProfile` redirect to `/app/onboarding`.
- Authenticated users with completed onboarding redirect from `/app` to `/app/campus`.
- Admin routes require `ADMIN` or `MODERATOR` role.

## Schema/Tables

- `UserProfile`
- `Institution`
- `InstitutionDomain`
- `Post`
- `Comment`
- `PollOption`
- `PollVote`
- `Vote`
- `Report`
- `Block`
- `ModerationAction`
- `InstitutionRequest`

Enums:

- `UserRole`
- `UserStatus`
- `InstitutionDomainType`
- `DomainVerificationStatus`
- `PostType`
- `PostScope`
- `ContentStatus`
- `ReportTargetType`
- `ReportStatus`
- `InstitutionRequestStatus`

## MVP Limitations

- Match mode is a placeholder only.
- Chat is represented only through navigation/settings placeholders.
- Stories are category filters, not expiring media.
- Moderation is rule-based for MVP, not ML-based.
- Email-domain verification uses imported website domains only as suggestions; website domains are not treated as guaranteed student email domains.
- Admin tooling is intentionally simple and role-based.
- Payments are out of scope.

## Safety Rules

- Anonymous posts and comments never expose author identity in normal user UI.
- Every anonymous content record still stores the real `authorId` privately for moderation and abuse prevention.
- Public UI shows anonymous content as “Anonymous student.”
- Safety pre-check blocks or routes high-risk content to review for phone numbers, emails, doxxing-like patterns, threats, severe abuse, obvious addresses, and repeated slurs.
- Reports support post, comment, and user targets with clear reason categories.
- Admin/moderator screens are the only place where private author identity can be shown, and actions are written to `ModerationAction`.
- User blocking prevents future interaction surfaces from showing blocked users where practical in the MVP.
