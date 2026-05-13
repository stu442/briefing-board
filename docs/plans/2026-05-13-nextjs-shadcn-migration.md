# Next.js + TypeScript + shadcn-style Migration Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Replace the current Express/EJS UI with a Next.js + TypeScript app using shadcn-style UI primitives while preserving the existing SQLite/content merge workflow and stable URLs.

**Architecture:** Keep SQLite and canonical JSON files as the source of truth for briefing metadata/content. Migrate the web layer to Next.js App Router with server components reading from local files/SQLite. Preserve `/briefings/YYYY-MM-DD.html` by normalizing slugs in the dynamic route.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, shadcn-style components, better-sqlite3.

---

### Task 1: Replace package/runtime setup for Next.js
**Objective:** Convert the project from Express runtime to Next.js runtime.

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`

**Verification:** `npm install` succeeds and `npm run build` can resolve the new app structure.

### Task 2: Add typed data access layer
**Objective:** Move DB/content access into reusable TypeScript modules.

**Files:**
- Create: `lib/db.ts`
- Create: `lib/briefings.ts`
- Create: `lib/utils.ts`

**Verification:** `npm run build` succeeds with typed imports and SQLite reads.

### Task 3: Add shadcn-style UI primitives and app shell
**Objective:** Create card/badge/button/separator primitives and global dark styling.

**Files:**
- Create: `components/ui/*.tsx`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

**Verification:** Home page compiles and renders styled components.

### Task 4: Build homepage and detail route
**Objective:** Implement board list view and briefing detail route with slug normalization for `.html` links.

**Files:**
- Create: `app/page.tsx`
- Create: `app/briefings/[slug]/page.tsx`
- Create: `app/not-found.tsx`

**Verification:** Home page and `/briefings/2026-05-13.html` render correctly.

### Task 5: Keep cron merge flow compatible
**Objective:** Update merge/generate scripts to keep canonical JSON and SQLite metadata consistent with Next.js routes.

**Files:**
- Modify: `scripts/generate-briefing.js`
- Modify: `scripts/merge-briefing.js`
- Optional cleanup: old Express/EJS files

**Verification:** `npm run merge -- <patch.json>` succeeds, then the detail page shows updated content.

### Task 6: Update production service and docs
**Objective:** Build and run the Next.js app under systemd and document the workflow.

**Files:**
- Modify: `README.md`
- Modify: `~/.config/systemd/user/briefing-board.service`

**Verification:** `systemctl --user restart briefing-board.service` succeeds and `/health` or homepage responds.
