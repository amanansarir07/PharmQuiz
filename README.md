# Bujh

> **A focused MCQ preparation and revision platform for students in Nepal's technical and higher-secondary education system.**

**Bujh** (Nepali: *बुझ*, meaning “understand”) is an education platform built around one simple idea: **practice should help you understand, not just memorize.**

It provides curriculum-aware MCQ practice, revision, mock exams, mistake-based practice, progress analytics, bookmarks, notes, and programme-specific leaderboards.

The project started as **PharmQuiz**, focused on Diploma in Pharmacy students, and is being expanded into a broader learning platform for CTEVT and +2 programmes.

---

## ✨ Features

### 🎯 Curriculum-based practice

* Choose your faculty and programme.
* Browse subjects, units, and topics according to the selected curriculum.
* Questions are organized by subject and syllabus unit.

### 🧠 Custom quizzes

Create practice sessions based on:

* Subject or unit
* Number of questions
* Difficulty
* Time limit
* Negative-marking preferences

### 📚 Review mode

Browse the question bank outside a quiz and revise questions at your own pace.

### ❌ Mistakes Bank

Questions answered incorrectly can be collected into a dedicated **Mistakes Bank**, allowing students to focus their revision on areas they actually struggle with.

### 📝 Bookmarks & Notes

* Save important questions for later.
* Keep personal study notes alongside your preparation.

### 🧪 Mock examinations

* Full-programme mock tests
* Timed examination experience
* Exam windows and scheduled mock exams
* Automatic scoring and result tracking

### 📊 Progress & analytics

Track:

* Accuracy
* Quiz history
* Study streaks
* Performance trends
* Weak areas
* Overall progress

### 🏆 Programme-based leaderboards

Leaderboards are separated by programme so students compare their progress with peers following the same curriculum.

Leaderboard periods include:

* Daily
* Weekly
* Monthly
* All-time

The application uses **Asia/Kathmandu (UTC+05:45)** as its standard timezone for leaderboard and exam timing.

### 🔐 Authentication

* Email/password authentication
* Google sign-in
* Password recovery
* Profile management
* Programme selection
* Account/session handling through Supabase

### ⚡ Performance-focused architecture

Large MCQ banks are **loaded lazily** instead of being bundled into every page. This keeps the initial application smaller and loads question data when it is actually needed.

The app also uses resilient local storage so quiz activity can continue to work even when cloud synchronization is unavailable.

---

## 🎓 Current & Planned Programmes

Bujh is designed around a multi-faculty architecture.

### CTEVT

| Programme                | Status         |
| ------------------------ | -------------- |
| D. Pharmacy — Year 1     | 🚧 Coming Soon |
| D. Pharmacy — Year 2     | ✅ Available    |
| D. Pharmacy — Year 3     | ✅ Available    |
| Certificate in Pharmacy  | 🚧 Coming Soon |
| PCL Nursing              | 🚧 Coming Soon |
| Health Assistant (HA)    | 🚧 Coming Soon |
| Diploma in Physiotherapy | 🚧 Coming Soon |
| CMLT                     | 🚧 Coming Soon |

### +2

| Programme            | Status         |
| -------------------- | -------------- |
| +2 Science (Biology) | 🚧 Coming Soon |
| +2 Computer Science  | 🚧 Coming Soon |
| +2 Management        | 🚧 Coming Soon |

The architecture is intentionally built so additional programmes can be added without rewriting the core quiz system.

---

## 🏗️ Tech Stack

| Layer          | Technology                 |
| -------------- | -------------------------- |
| Framework      | Next.js 16                 |
| UI             | React 19                   |
| Language       | TypeScript                 |
| Styling        | Tailwind CSS v4            |
| Components     | Shadcn UI / Base UI        |
| Icons          | Lucide React               |
| Database       | Supabase PostgreSQL        |
| Authentication | Supabase Auth              |
| Backend        | Supabase + PostgreSQL RPCs |
| Charts         | Recharts                   |
| Analytics      | Vercel Analytics           |
| Deployment     | Next.js-compatible hosting |

---

## 🧩 Architecture

The content model follows:

```text
Faculty
  └── Programme
       └── Subject
            └── Unit
                 └── Subtopic
                      └── Question
```

For example:

```text
CTEVT
└── D. Pharmacy · Year 2
    ├── Pharmaceutics
    │   ├── Unit 1
    │   └── Unit 2
    ├── Pharmacology
    ├── Pharmaceutical Chemistry
    ├── Pharmacognosy
    ├── Biochemistry & Microbiology
    ├── Pharmacotherapeutics
    ├── Management
    └── Public Health
```

### Question-bank loading

Question banks are stored separately and loaded dynamically.

This avoids importing thousands of MCQs into shared application bundles. Only the required subject banks are loaded when a student enters quiz or review mode.

---

## 📁 Project Structure

```text
.
├── app/
│   ├── programs/          # Faculty & programme catalogue
│   ├── subjects/          # Subject and syllabus pages
│   ├── quiz/              # Quiz configuration, execution & results
│   ├── review/            # Question-bank review
│   ├── mock-test/         # Mock examinations
│   ├── leaderboard/       # Programme leaderboards
│   ├── analytics/         # Performance analytics
│   ├── dashboard/         # Student dashboard
│   ├── history/           # Quiz history
│   ├── bookmarks/         # Saved questions
│   ├── notes/             # Study notes
│   ├── profile/           # User profile & programme
│   ├── admin/             # Admin functionality
│   └── auth/              # Authentication pages
│
├── components/
│   ├── layout/            # Navbar, footer, etc.
│   ├── ui/                # Reusable UI components
│   └── ...                # Feature components
│
├── data/
│   ├── faculties.ts       # Faculty definitions
│   ├── programs.ts        # Programme catalogue
│   ├── registry.ts        # Content registry
│   └── programs/          # Programme-specific syllabus & questions
│
├── lib/
│   ├── auth.tsx           # Authentication state
│   ├── program.tsx        # Programme state
│   ├── quiz-loader.ts     # Question normalization & quiz loading
│   ├── storage.ts         # Local storage utilities
│   ├── mistakes.ts        # Mistakes Bank
│   ├── stats.ts           # Progress calculations
│   ├── leaderboard.ts     # Leaderboard logic
│   ├── mock-exams.ts      # Mock-exam utilities
│   └── supabase/          # Supabase clients
│
└── supabase/
    └── migrations/        # Database schema, RLS & RPC migrations
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/amanansarir07/PharmQuiz.git
cd PharmQuiz
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These values come from your Supabase project settings.

### 4. Set up the database

Apply the SQL migrations in:

```text
supabase/migrations/
```

The migrations define the application's database tables, Row Level Security policies, functions, and other database-side logic.

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Create production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

---

## 🔒 Security

Bujh uses Supabase's authentication and PostgreSQL security features.

Key security practices include:

* Row Level Security (RLS)
* Server-side Supabase access where required
* Client sessions managed through Supabase Auth
* Programme-scoped leaderboard queries
* Database functions/RPCs for important score and statistics updates
* No secrets committed to the repository
* Environment variables for Supabase configuration

> **Never commit your Supabase service-role key or other private credentials to the repository.**

---

## 📖 Adding a New Programme

The platform is designed to make curriculum expansion straightforward.

A new programme generally requires:

1. Add programme metadata in `data/programs.ts`.
2. Create its syllabus structure under `data/programs/<program-slug>/`.
3. Add subject question banks.
4. Register the programme's content in `data/registry.ts`.
5. Add lazy question-bank loaders.
6. Set the programme's content availability flag.
7. Add/update database migrations if the programme requires new persisted data.

Existing subject slugs should not be changed casually because quiz results, bookmarks, analytics, and other persisted records may reference them.

---

## 🎯 Project Goal

Bujh is being built to make exam preparation more structured and accessible for students who often rely on scattered notes, PDFs, old question collections, and informal resources.

The long-term direction is to bring multiple Nepalese education programmes into one platform while keeping each student's experience focused on their own curriculum.

**From random MCQs to structured preparation.**


---



## 👨‍💻 Author

**Aman Ansari**

Built with the goal of making exam preparation more practical for students in Nepal.

* GitHub: [@amanansarir07](https://github.com/amanansarir07)
* Repository: [amanansarir07/PharmQuiz](https://github.com/amanansarir07/PharmQuiz)

---

<p align="center">
  <strong>Bujh — Learn. Practice. Understand.</strong>
</p>
