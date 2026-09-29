# Bujh (PharmQuiz) — Project Architecture & Context

> **Quick AI Context Reference**: Read this file first. It contains the complete architectural blueprint, conventions, data models, and workflow patterns for Bujh with zero token bloat.

---

## 1. Project Overview & Identity

- **Name**: Bujh (*"Understanding"* in Nepali) / Repo: `amanansarir07/PharmQuiz`.
- **Purpose**: High-performance MCQ preparation, revision, and mock examination platform for Nepal's technical education boards:
  - **CTEVT** diploma/certificate streams (Diploma in Pharmacy, PCL Nursing, Health Assistant [HA], Physiotherapy, CMLT).
  - **+2** Higher Secondary streams (Science [Bio], Computer Science, Management).
- **Current Active Curriculum**: `d-pharm-y2` (Diploma in Pharmacy · Year 2). Other programmes are scaffolded with `hasContent: false` ("Coming Soon").
- **Timezone Standard**: **Asia/Kathmandu (UTC+05:45, no DST)** is the single source of truth for mock exam schedules, daily/weekly leaderboard resets, and timestamp calculations.

---

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router, Server & Client Components) with React 19.
- **Language**: TypeScript 5 (Strict mode, `@/*` alias pointing to root).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`, `tw-animate-css`) + Shadcn UI (`base-nova` style, Base UI `@base-ui/react`, Lucide icons).
- **Backend & Database**: Supabase PostgreSQL (`@supabase/supabase-js`, `@supabase/ssr`) with Row-Level Security (RLS) and PL/pgSQL RPCs.
- **Analytics & Charts**: Recharts, `@vercel/analytics`.
- **State & Storage**: Dual-tier storage (Supabase cloud sync + quota-safe resilient `localStorage`).

---

## 3. Core Architecture & Design Patterns

### A. Content Hierarchy & Registry
`Stream (Faculty)` $\rightarrow$ `Programme` $\rightarrow$ `Subject` $\rightarrow$ `Unit` $\rightarrow$ `Subtopic` $\rightarrow$ `Question`

1. **`data/faculties.ts`**: High-level streams (`ctevt`, `plus-two`).
2. **`data/programs.ts`**: All programmes with `hasContent: boolean`, default `DEFAULT_PROGRAM_SLUG = "d-pharm-y2"`.
3. **`data/registry.ts`**: Central registry querying faculties, programmes, and subjects.
4. **`data/programs/<program-slug>/subjects.ts`**: Complete syllabus breakdown for a programme.
5. **`data/programs/<program-slug>/questions/<subject-slug>.json`**: MCQ question banks.

### B. Lazy Question Bank Loading (Bundle Optimization)
- **Do NOT statically import question banks** in shared components! Question banks total thousands of questions.
- **`lib/content/banks.ts`**: Uses dynamic `import(...)` chunks (`BANK_LOADERS`) and an in-memory `bankCache`. Questions are only fetched over the wire when the user enters that subject's quiz or review mode.
- **Two Question Schemas Supported**:
  - *Unit-attributed*: `{ unit_id, question_text, options: string[], correct_index: number, explanation, difficulty, tags }`
  - *Legacy format*: `{ subject, question_text, options: { a, b, c, d }, correct_option: "a", ... }`
  - Normalized dynamically by `lib/quiz-loader.ts`.

### C. Active Programme State (`lib/program.tsx`)
- Managed via `ProgramProvider` using `useSyncExternalStore` on `localStorage` key `bujh-active-program` (avoids SSR hydration mismatches and syncs across browser tabs).
- When signed in, user's chosen programme syncs to `profiles.program_slug` in Supabase.
- Only programmes with `hasContent: true` can be active.

### D. Safe Storage & Offline Resilience (`lib/storage.ts`)
- LocalStorage has a strict ~5MB browser quota.
- `safeSetItem()` catches quota exhaustion errors and automatically invokes `pruneOldestResults()` to delete stale quiz attempts, preventing silent quiz-save crashes.

### E. Kathmandu-Timezone Leaderboards (`lib/leaderboard.ts`, Supabase RPC)
- **Periods**: `daily` (resets Nepal midnight), `weekly` (resets Monday), `monthly` (1st of month), `all_time`.
- **Fair Qualification Floor**: Minimum quizzes required to rank (`daily`: 1, `weekly`: 5, `monthly`: 10, `all_time`: 20).
- **Programme Scoped**: Filtered by `p_program` (migration 008) so Pharmacy students compete against Pharmacy peers, not Nursing or +2 students.

### F. Mock Exam System (`lib/mock-exams.ts`, `app/mock-test/`)
- Dynamic duration derived from question count (1 min per question: 80 questions = 80 min).
- Strict exam window: joining late caps remaining time to `exam.ends_at`.
- Admin scheduling portal at `/admin/mock-exams`.

### G. Auth & Password Recovery Handling (`lib/supabase/client.ts`, `lib/auth.tsx`)
- Supabase strips URL hash `#access_token` on client initialization.
- `captureRecoveryFromUrl()` runs synchronously before `createClient` to intercept password recovery tokens and forward safely to `/auth/reset-password`.

### H. 3-Pillar Personal Dashboard & Mistakes Bank (`app/dashboard/`, `lib/mistakes.ts`)
- **Study**: Subject $\rightarrow$ Chapter (Unit) $\rightarrow$ Topic (Subtopic) breakdown with 1-click unit practice.
- **Practice**: Custom Quiz, Board Mock Test, and dedicated **Mistakes Bank** (pulls previously missed questions for targeted re-drilling).
- **Progress**: Accuracy trends, streak counter, Kathmandu-timezone leaderboard, and quiz history.

### I. Adaptive Next-Practice Feedback Loop (`app/quiz/[sessionId]/results/`)
- Analyzes session performance:
  - Missed questions trigger an immediate 1-click **"Retry Missed Questions"** session.
  - Lowest-scoring unit triggers **"Practice Weakest Unit"** (10 MCQs on that chapter).
  - High scores ($\ge 70\%$) prompt the full **Board Mock Exam**.
- Closes the learning loop directly back into Practice ($\circlearrowleft$).

---

## 4. Directory Structure Map

```
/
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Landing page (Hero, Program preview, Features)
│   ├── layout.tsx                 # Root layout (Theme, Providers, Navbar, Footer)
│   ├── programs/                  # Streams and Programmes catalogue
│   │   └── [programSlug]/         # Programme overview & syllabus details
│   ├── subjects/                  # Subject directory for active programme
│   │   └── [slug]/                # Subject syllabus & unit quiz launcher
│   ├── quiz/                      # Custom quiz configuration
│   │   └── [sessionId]/           # Active quiz execution & scoring engine
│   ├── review/                    # Question bank browser & study mode
│   ├── mock-test/                 # Timed & scheduled mock exams
│   ├── leaderboard/               # Nepal-time reset leaderboards
│   ├── analytics/                 # Streaks, accuracy trends & weakness breakdown
│   ├── dashboard/                 # Student home dashboard
│   ├── history/                   # Quiz attempt history
│   ├── bookmarks/                 # Saved revision questions
│   ├── notes/                     # User study notes
│   ├── profile/                   # Account & programme switcher
│   ├── admin/mock-exams/          # Admin portal for scheduled exams
│   └── auth/                      # Login, register, reset-password
├── components/
│   ├── layout/                    # Navbar, Footer
│   ├── ui/                        # Shadcn UI primitives (button, dialog, card, etc.)
│   ├── study-funnel.tsx           # Multi-step 'What do you study?' onboarding funnel
│   ├── choose-program.tsx         # First-run modal to pick curriculum
│   ├── program-home.tsx           # Home screen syllabus & stats component
│   └── share-result-dialog.tsx    # Canvas social share card generator
├── data/
│   ├── faculties.ts               # Streams (CTEVT, +2)
│   ├── programs.ts                # Program list & metadata
│   ├── registry.ts                # Lookup helpers (getProgram, getSubject, totals)
│   ├── types.ts                   # Types: UnitData, SubjectData, ProgramMeta
│   └── programs/
│       └── d-pharm-y2/            # Active D.Pharm Year 2 syllabus & JSON banks
├── lib/
│   ├── auth.tsx                   # Supabase authentication context
│   ├── program.tsx                # ProgramProvider & sync store
│   ├── mistakes.ts                # Mistake bank tracking & targeted revision
│   ├── quiz-loader.ts             # Bank loader, shuffling & normalization
│   ├── storage.ts                 # Quota-safe localStorage helpers
│   ├── stats.ts                   # Streak & accuracy calculations
│   ├── leaderboard.ts             # Supabase RPC leaderboard bindings
│   ├── mock-exams.ts              # Scheduled mock exam utilities
│   ├── share-card.ts              # Result card rendering on HTML Canvas
│   ├── content/banks.ts           # Dynamic code-split bank loaders
│   └── supabase/                  # Supabase client, server & middleware helpers
└── supabase/migrations/           # SQL schemas, RLS policies, RPCs (001 to 008)
```

---

## 5. Key Conventions & Rules for AI Agents

1. **Adding a New Subject / Program**:
   - Do NOT modify existing `d-pharm-y2` subject slugs (persisted in user DB rows).
   - For new programmes: prefix subject slugs with the programme slug (e.g. `d-pharm-y1-anatomy`).
   - Register in `data/programs.ts`, then link subject definition in `data/registry.ts`, and add lazy bank loader to `lib/content/banks.ts`.
2. **Next.js & React 19 Considerations**:
   - `params` and `searchParams` in Next.js page props are Promises: `const { slug } = await params;`.
   - Never import large JSON question files in standard server or client components; use `loadBank()` or `getQuestionsForQuiz()` from `lib/quiz-loader.ts`.
3. **Database & Migrations**:
   - All leaderboard and score updates must use the Supabase stored procedures (`save_quiz_result`) to ensure atomic stats and streak updates.
   - Leaderboard calculations always pass the active `programSlug`.
