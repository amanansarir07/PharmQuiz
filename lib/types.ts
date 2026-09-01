export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  total_units: number;
  exam_marks: number;
  order_index: number;
  created_at: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
  exam_hours: number;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  unit_id: string;
  name: string;
  description: string;
  order_index: number;
}

export interface Question {
  id: string;
  unit_id: string;
  subtopic_id: string | null;
  question_text: string;
  options: [string, string, string, string];
  correct_index: 0 | 1 | 2 | 3;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  source: string | null;
  tags: string[];
  created_at: string;
}

export interface QuizSession {
  id: string;
  user_id: string;
  subject_id: string;
  config: QuizConfig;
  score: number | null;
  total: number | null;
  time_taken_seconds: number | null;
  completed: boolean;
  created_at: string;
}

export interface QuizConfig {
  unit_ids: string[];
  difficulty: "easy" | "medium" | "hard" | "mixed";
  num_questions: number;
  time_limit_minutes: number | null;
  negative_marking: boolean;
}

export interface QuizAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_index: number | null;
  is_correct: boolean;
  time_spent_seconds: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  question_id: string | null;
  unit_id: string | null;
  subject_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  user_id: string;
  total_quizzes: number;
  total_correct: number;
  total_attempted: number;
  current_streak: number;
  longest_streak: number;
  last_quiz_date: string | null;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_score: number;
  quizzes_taken: number;
  accuracy: number;
  current_streak: number;
}
