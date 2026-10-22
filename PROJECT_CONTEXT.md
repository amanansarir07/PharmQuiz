# Bujh (PharmQuiz) — Project Architecture & Context

> **Quick AI Context Reference**: Read this file first. It contains the complete architectural blueprint, conventions, data models, and workflow patterns for Bujh with zero token bloat.

---

## 1. Project Overview & Identity

- **Name**: Bujh (*"Understanding"* in Nepali) / Repo: `amanansarir07/PharmQuiz`.
- **Purpose**: High-performance MCQ preparation, revision, and mock examination platform for Nepal's technical education boards:
  - **CTEVT** diploma/certificate streams (Diploma in Pharmacy, PCL Nursing, Health Assistant [HA], Physiotherapy, CMLT).
  - **+2** Higher Secondary streams (Science [Bio], Computer Science, Management).
- **Live curricula**: `d-pharm-y2` and `d-pharm-y3` (Diploma in Pharmacy · Years 2 and 3). Availability comes from `data/programs.ts` (`hasContent`) and `data/registry.ts`; other programmes are marked "Coming Soon".
- **Post-diploma exam**: The Nepal Pharmacy Council Pharmacy Assistant Name Registration Exam is one exam after the three-year D.Pharm course. Catalogue slug `c-pharm` is retained for link continuity. The supplied Council past-question collection is browsable at `/programs/c-pharm/questions`; it combines pharmacist and assistant questions and has no answer key, so it is deliberately excluded from scored quiz banks until answers are individually verified.
- **Timezone Standard**: **Asia/Kathmandu (UTC+05:45, no DST)** is the single source of truth for mock exam schedules, daily/weekly leaderboard resets, and timestamp calculations.

---

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router, Server & Client Components) with React 19.
- **Language**: TypeScript 5 (Strict mode, `@/*` alias pointing to root).
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`, `tw-animate-css`) + Shadcn UI (`base-nova` style, Base UI `@base-ui/react`, Lucide icons).
- **Backend & Database**: Supabase PostgreSQL (`@supabase/supabase-js`) with Row-Level Security (RLS) and PL/pgSQL RPCs.
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

### J. Guest Mode and Navigation
- Mobile navigation: **Home** (`/dashboard`), **Study** (`/subjects`), **Practice** (`/quiz`), **Progress** (`/analytics`), **More** (`/more`). Desktop also exposes Leaderboard.
- `/dashboard` renders `GuestHome` after auth restoration confirms there is no session. Guests can choose either live programme, browse subjects, take short practice sessions (at most 10 questions), review their current result, and preview 20 questions per subject in `/review`.
- Analytics, leaderboard, scheduled mocks, saved questions, notes, mistakes, history and profile use `AccountRequiredState`. The state links to registration and login; guest-to-account conversion keeps the chosen programme.
- `components/learning-ui.tsx` defines `LearningPage`, `PageHeading`, `SectionHeading`, `StatTile` and `LinkRow`; `components/account-required-state.tsx` defines the shared guest gate.
- Account deletion uses `DELETE /api/account`: the route verifies the bearer token and password for email accounts, then uses a server-only secret key to delete the requesting Auth user. Foreign-key cascades remove profile-linked data. Deployment requires `SUPABASE_SECRET_KEY` (or the legacy `SUPABASE_SERVICE_ROLE_KEY`) in the server environment only. Migration 009 secures profile, scoring and leaderboard RPC grants; migration 010 restricts profile column updates and aligns the study library schema with JSON question banks.

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
│   ├── more/                      # Secondary study tools and account links
│   ├── settings/                  # Appearance, programme and account actions
│   ├── mistakes/                  # Previously missed questions
│   ├── dashboard/                 # Student home dashboard
│   ├── history/                   # Quiz attempt history
│   ├── bookmarks/                 # Saved revision questions
│   ├── notes/                     # User study notes
│   ├── profile/                   # Account & programme switcher
│   ├── api/account/               # Verified server-side Auth account deletion
│   ├── admin/mock-exams/          # Admin portal for scheduled exams
│   └── auth/                      # Login, register, reset-password
├── components/
│   ├── layout/                    # Navbar, Footer
│   ├── ui/                        # Shadcn UI primitives (button, dialog, card, etc.)
│   ├── learning-ui.tsx            # Shared learning screen components
│   ├── student-dashboard.tsx      # Authenticated student home
│   ├── guest-home.tsx             # Guest home
│   └── share-result-dialog.tsx    # Canvas social share card generator
├── data/
│   ├── faculties.ts               # Streams (CTEVT, +2)
│   ├── programs.ts                # Program list & metadata
│   ├── registry.ts                # Lookup helpers (getProgram, getSubject, totals)
│   ├── types.ts                   # Types: UnitData, SubjectData, ProgramMeta
│   └── programs/
│       ├── d-pharm-y2/            # Live D.Pharm Year 2 syllabus & JSON banks
│       └── d-pharm-y3/            # Live D.Pharm Year 3 syllabus & JSON banks
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
│   └── supabase/client.ts         # Supabase browser client
└── supabase/migrations/           # SQL schemas, RLS policies, RPCs (001 to 010)
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
