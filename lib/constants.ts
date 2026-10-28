export const APP_NAME = "Bujh";

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
  { label: "Mixed", value: "mixed" as const, color: "text-primary bg-secondary" },
] as const;

export const NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/subjects", label: "Study" },
  { href: "/quiz", label: "Practice" },
  { href: "/analytics", label: "Progress" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/more", label: "More" },
] as const;
