<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bujh / PharmQuiz Agent Guidelines

Before performing work on this repository, read **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)**.
It details:
- Project architecture and domain model (CTEVT & +2 streams)
- Content hierarchy (`data/faculties.ts` -> `data/programs.ts` -> `data/registry.ts`)
- Lazy dynamic question loading patterns (`lib/content/banks.ts` / `lib/quiz-loader.ts`)
- Supabase schema, Kathmandu-timezone leaderboards, and safe storage rules
