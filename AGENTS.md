# 🤖 AGENTS.md — CampusLoop Instructions for AI Agents & Developers

Welcome to **CampusLoop**. This project is a verified student-only campus social network.

## 📌 Critical Guidelines & Rules

1. **Hexclave Management**:
   - This project uses Hexclave for user auth, sessions, and management.
   - Documentation & skill reference: https://skill.hexclave.com

2. **Next.js App Router & Metadata Rule**:
   - Never add `"use client"` on `page.tsx` or `layout.tsx` when exporting `metadata`.
   - Delegate interactive UI to client component files (e.g. `feed-client.tsx`, `post-composer.tsx`).

3. **Modularity & Reusability**:
   - Do NOT inline API fetchers or re-implement standard hooks. Use centralized helpers in `@/lib/api.ts` and custom hooks in `@/hooks/`.
   - Use modular hooks like `useProfile`, `useFeed`, `usePostActions`, `useColleges`, `useCommunities`, and `useStories`.

4. **Documentation**:
   - Technical Architecture & Guidelines: [`docs/ARCHITECTURE.md`](campusloop/docs/ARCHITECTURE.md)
   - Design System: [`docs/DESIGN_SYSTEM.md`](campusloop/docs/DESIGN_SYSTEM.md)
   - Product Roadmap: [`docs/ROADMAP_PHASES.md`](campusloop/docs/ROADMAP_PHASES.md)