"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { subjects } from "@/data/subjects";
import { getSubjectForUnit } from "@/lib/quiz-helpers";
import { getAllQuestions, type QuizQuestion } from "@/lib/quiz-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, ChevronLeft } from "lucide-react";

export default function AdminQuestionsPage() {
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setQuestions(getAllQuestions());
  }, []);

  const filtered = questions.filter((q) => {
    const matchesSearch =
      !search || q.question.toLowerCase().includes(search.toLowerCase());
    const subjectSlug = getSubjectForUnit(q.unitId);
    const matchesSubject =
      filterSubject === "all" || subjectSlug === filterSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
          <p className="mt-2 text-muted-foreground">
            {questions.length} total questions in the bank
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSubject} onValueChange={(v) => setFilterSubject(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.slug}>
                {s.icon} {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filtered.length} of {questions.length} questions
      </p>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Answer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q, i) => {
                const subjectSlug = getSubjectForUnit(q.unitId);
                const subjectName = subjects.find((s) => s.slug === subjectSlug)?.name || "—";
                return (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell className="max-w-[350px] truncate">
                      {q.question}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{subjectName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          q.difficulty === "easy"
                            ? "default"
                            : q.difficulty === "hard"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {q.options[q.correctIndex]}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No questions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
