export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Practice is intentionally available to guests. Quiz attempts are saved
  // locally, while authenticated users additionally sync results to Supabase.
  return children;
}
