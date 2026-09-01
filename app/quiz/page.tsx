"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { subjects } from "@/data/subjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  QUIZ_QUESTION_OPTIONS,
  QUIZ_TIME_OPTIONS,
  DIFFICULTY_OPTIONS,
} from "@/lib/constants";
import {
  Settings,
  Play,
  Clock,
  Hash,
  Gauge,
  CheckSquare,
} from "lucide-react";

function QuizSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("mixed");
  const [numQuestions, setNumQuestions] = useState<number>(20);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [negativeMarking, setNegativeMarking] = useState(false);

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam && subjects.find((s) => s.slug === subjectParam)) {
      setSelectedSubject(subjectParam);
    }
  }, [searchParams]);

  const subject = subjects.find((s) => s.slug === selectedSubject);

  const handleSubjectChange = (slug: string) => {
    setSelectedSubject(slug);
    setSelectedUnits([]);
  };

  const toggleUnit = (unitId: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const selectAllUnits = () => {
    if (subject) {
      setSelectedUnits(subject.units.map((u) => u.id));
    }
  };

  const startQuiz = () => {
    if (!subject) return;
    const config = {
      subject: subject.slug,
      subjectId: subject.id,
      units: selectedUnits.length > 0 ? selectedUnits : subject.units.map((u) => u.id),
      difficulty,
      numQuestions,
      timeLimit,
      negativeMarking,
    };
    const sessionId = crypto.randomUUID();
    localStorage.setItem(
      `quiz-config-${sessionId}`,
      JSON.stringify(config)
    );
    router.push(`/quiz/${sessionId}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          MCQ Setup
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configure your MCQ settings and start practicing
        </p>
      </div>

      <div className="space-y-6">
        {/* Subject Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">📚</span>
              Select Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSubjectChange(s.slug)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    selectedSubject === s.slug
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.units.length} units • {s.examMarks} marks
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unit Selection */}
        {subject && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Select Units
                </CardTitle>
                <Button variant="outline" size="sm" onClick={selectAllUnits}>
                  Select All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subject.units.map((unit) => (
                  <label
                    key={unit.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      selectedUnits.includes(unit.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={selectedUnits.includes(unit.id)}
                      onCheckedChange={() => toggleUnit(unit.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{unit.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {unit.subtopics.length} subtopics • {unit.examHours}h
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {unit.examMarks}m
                    </Badge>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {selectedUnits.length === 0
                  ? "No units selected — all units will be included"
                  : `${selectedUnits.length} unit(s) selected`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    difficulty === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Number of Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Number of Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {QUIZ_QUESTION_OPTIONS.map((num) => (
                <button
                  key={num}
                  onClick={() => setNumQuestions(num)}
                  className={`flex-1 rounded-lg border p-3 text-center transition-all ${
                    numQuestions === num
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="text-lg font-bold">{num}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Limit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUIZ_TIME_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setTimeLimit(opt.value)}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    timeLimit === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Negative Marking */}
        <Card>
          <CardContent className="pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={negativeMarking}
                onCheckedChange={(v) => setNegativeMarking(v === true)}
              />
              <div>
                <p className="text-sm font-medium">Negative Marking</p>
                <p className="text-xs text-muted-foreground">
                  Deduct 1 mark for each wrong answer
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Start Quiz Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={startQuiz}
          disabled={!selectedSubject}
        >
          <Play className="mr-2 h-5 w-5" />
          Start MCQs
        </Button>
      </div>
    </div>
  );
}

export default function QuizSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <QuizSetupInner />
    </Suspense>
  );
}
