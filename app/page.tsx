import Link from "next/link";
import { subjects, getTotalUnits, getTotalSubtopics } from "@/data/subjects";
import { HeroSection } from "@/components/hero-section";
import {
  GraduationCap,
  BookOpen,
  Trophy,
  BarChart3,
  Brain,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { getQuestionCount } from "@/lib/quiz-loader";

export default function HomePage() {
  const questionCount = getQuestionCount();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Bar */}
      <section className="border-y bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Subjects", value: subjects.length, icon: BookOpen },
              { label: "Units", value: getTotalUnits(), icon: GraduationCap },
              { label: "Subtopics", value: getTotalSubtopics(), icon: Brain },
              { label: "Questions", value: questionCount, icon: Trophy },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Every Subject You Need
            </h2>
            <p className="mt-3 text-muted-foreground">
              Comprehensive coverage of the CTEVT 2nd year pharmacy syllabus
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.slug}`}
                className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{subject.icon}</span>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {subject.description}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{subject.units.length} units</span>
                      <span>•</span>
                      <span>{subject.examMarks} marks</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Why Students Choose Bujh
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "Custom MCQs",
                desc: "Pick your subject, select units, set difficulty and timer. Every session is different.",
              },
              {
                icon: BookOpen,
                title: "Full Question Bank",
                desc: "Search and filter through the full question bank. Study mode shows explanations for every answer.",
              },
              {
                icon: Trophy,
                title: "Leaderboard",
                desc: "See how you rank against other pharmacy students. Daily, weekly, and all-time rankings.",
              },
              {
                icon: BarChart3,
                title: "Performance Analytics",
                desc: "Subject-wise accuracy, progress charts, and weak area detection — know exactly where to focus.",
              },
              {
                icon: CheckCircle,
                title: "Bookmarks & Notes",
                desc: "Bookmark tough questions and jot down notes. Everything in one place for last-minute revision.",
              },
              {
                icon: Clock,
                title: "Timed Practice",
                desc: "Practice under pressure with countdown timers — just like the real exam.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6"
              >
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Your Pharmacy Exam Prep Starts Here
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join students who are already using Bujh to ace their exams
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
            >
              Get Started — It's Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
