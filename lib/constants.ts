export const APP_NAME = "PharmQuiz";
export const APP_DESCRIPTION =
  "MCQ Practice Platform for Diploma in Pharmacy 2nd Year";

export const QUIZ_QUESTION_OPTIONS = [10, 20, 30, 50] as const;

export const QUIZ_TIME_OPTIONS = [
  { label: "No Limit", value: null },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "60 minutes", value: 60 },
] as const;

export const DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "easy" as const, color: "text-green-600 bg-green-50" },
  {
    label: "Medium",
    value: "medium" as const,
    color: "text-yellow-600 bg-yellow-50",
  },
  { label: "Hard", value: "hard" as const, color: "text-red-600 bg-red-50" },
  { label: "Mixed", value: "mixed" as const, color: "text-purple-600 bg-purple-50" },
] as const;

export const NAV_LINKS = [
  { href: "/subjects", label: "Subjects" },
  { href: "/quiz", label: "MCQs" },
  { href: "/leaderboard", label: "Leaderboard" },
] as const;

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/quiz",
  "/bookmarks",
  "/notes",
  "/analytics",
  "/admin",
];
