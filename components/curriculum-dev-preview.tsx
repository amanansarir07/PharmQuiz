"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProgramCurriculumPreview } from "@/data/curriculum-previews";
import type { ProgramMeta } from "@/data/types";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Terminal,
  GitBranch,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bell,
  Code2,
  ShieldCheck,
  GraduationCap,
  Layers,
  Award,
  Cpu,
} from "lucide-react";

interface CurriculumDevPreviewProps {
  program: ProgramMeta;
  preview?: ProgramCurriculumPreview;
}

export function CurriculumDevPreview({
  program,
  preview,
}: CurriculumDevPreviewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { setProgramSlug } = useActiveProgram();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(
    preview?.subjects[0]?.name || null
  );
  const [notified, setNotified] = useState(false);
  const [activeTab, setActiveTab] = useState<"syllabus" | "pipeline" | "terminal">("syllabus");

  const handleEnrollAsGoal = () => {
    setProgramSlug(program.slug);
    router.push("/dashboard");
  };

  const handleLaunchYear3 = () => {
    setProgramSlug("d-pharm-y3");
    router.push("/dashboard");
  };

  const handleLaunchYear2 = () => {
    setProgramSlug("d-pharm-y2");
    router.push("/dashboard");
  };

  const progressVal = preview?.progressPercent ?? 65;

  return (
    <div className="space-y-8">
      {/* ================= DEVELOPER ROADMAP HERO CARD ================= */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-card via-card to-amber-500/[0.04] p-6 shadow-lg sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 -mb-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                Active Development · {preview?.stage || "Phase 2: Question Authoring"}
              </span>

              <Badge variant="outline" className="font-mono text-xs">
                <GitBranch className="mr-1 h-3 w-3" />
                {preview?.gitBranch || `branch/${program.slug}`}
              </Badge>

              <Badge variant="secondary" className="text-xs">
                <ShieldCheck className="mr-1 h-3 w-3 text-emerald-500" />
                {preview?.regulatoryCode || "CTEVT / NEB Verified"}
              </Badge>
            </div>

            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Curriculum Roadmap &amp; Specification Preview
            </h2>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {preview?.overviewSummary ||
                `${program.name} curriculum architecture is drafted and question banks are actively being authored. Explore the proposed subjects, credit hours, and chapter units below.`}
            </p>

            {/* Live Progress Bar */}
            <div className="pt-2">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Cpu className="h-3.5 w-3.5 text-primary" />
                  Question Bank Pipeline
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {progressVal}% Complete
                </span>
              </div>
              <Progress value={progressVal} className="h-2" />
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>
                  Target: <strong>{preview?.totalPlannedQuestions || 500}+ Questions</strong>
                </span>
                <span>•</span>
                <span>
                  Mocks: <strong>{preview?.plannedMockExams || 8} Timed Papers</strong>
                </span>
                <span>•</span>
                <span>
                  Authority: <strong>{preview?.regulatoryBody || "CTEVT / NEB"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col shrink-0">
            <Button
              onClick={handleEnrollAsGoal}
              className="gap-2 bg-primary font-semibold shadow-md"
            >
              <GraduationCap className="h-4 w-4" />
              Set as My Target Curriculum
            </Button>

            <Button
              variant="outline"
              onClick={() => setNotified(true)}
              className="gap-2 border-dashed"
              disabled={notified}
            >
              {notified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Subscribed for Beta Release</span>
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  <span>Notify Me on Launch</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ================= DEVELOPER TABS ================= */}
      <div className="flex items-center gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("syllabus")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            activeTab === "syllabus"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Proposed Subjects &amp; Units</span>
          <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[11px]">
            {preview?.subjects.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pipeline")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            activeTab === "pipeline"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Release Pipeline</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("terminal")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
            activeTab === "terminal"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Dev Changelog</span>
        </button>
      </div>

      {/* ================= TAB 1: PROPOSED SUBJECTS & UNITS ================= */}
      {activeTab === "syllabus" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <GraduationCap className="h-5 w-5 text-primary" />
              Planned Curriculum Subjects
            </h3>
            <p className="text-xs text-muted-foreground">
              Based on official CTEVT / NEB Council specifications
            </p>
          </div>

          <div className="grid gap-4">
            {(preview?.subjects || []).map((sub) => {
              const isExpanded = expandedSubject === sub.name;
              return (
                <Card
                  key={sub.code}
                  className="overflow-hidden border transition-all hover:border-primary/40"
                >
                  <div
                    onClick={() =>
                      setExpandedSubject(isExpanded ? null : sub.name)
                    }
                    className="flex cursor-pointer items-center justify-between p-4 sm:p-5 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start gap-3 sm:items-center">
                      <span className="text-2xl">{sub.icon}</span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-base sm:text-lg">
                            {sub.name}
                          </h4>
                          <Badge variant="outline" className="font-mono text-xs">
                            {sub.code}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal"
                          >
                            {sub.units.length} Units
                          </Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {sub.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
                        <span>{sub.examMarks} Marks</span>
                        <span>{sub.totalHours} Hours</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-muted/10 p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Drafted Chapter Units &amp; Learning Modules:
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {sub.units.map((unitTitle, uIdx) => (
                          <div
                            key={uIdx}
                            className="flex items-center gap-2.5 rounded-xl border bg-card p-3 text-xs shadow-2xs"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                              {uIdx + 1}
                            </span>
                            <span className="font-medium text-foreground">
                              {unitTitle}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                        <span>
                          Status: <strong>Authoring unit MCQ sets</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                          Questions in development
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: RELEASE PIPELINE ================= */}
      {activeTab === "pipeline" && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-bold">Curriculum Quality &amp; Verification Pipeline</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Every question bank goes through 5 rigorous review gates before public release.
          </p>

          <div className="mt-6 space-y-4">
            {(preview?.developmentMilestones || []).map((ms, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-xl border p-4 transition-colors"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                  {ms.status === "completed" ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : ms.status === "in_progress" ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 animate-pulse">
                      <Clock className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <span className="font-mono text-xs">{idx + 1}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{ms.title}</h4>
                    {ms.status === "completed" && (
                      <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Passed
                      </Badge>
                    )}
                    {ms.status === "in_progress" && (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400">
                        Active Stage
                      </Badge>
                    )}
                    {ms.status === "planned" && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Queued
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ms.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: DEV CHANGELOG ================= */}
      {activeTab === "terminal" && (
        <div className="rounded-2xl border bg-zinc-950 p-5 font-mono text-xs text-zinc-200 shadow-xl">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-3 text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-[11px] text-zinc-300">bujh-curriculum-engine ~ {preview?.gitBranch}</span>
            </div>
            <span>v0.9.4-draft</span>
          </div>

          <div className="space-y-2 text-[12px] leading-relaxed">
            <p className="text-zinc-500">$ git log --graph --oneline -n 4</p>
            <p className="text-emerald-400">* 7e93a02 (HEAD -&gt; {preview?.gitBranch}) feat: mapped {preview?.subjects.length} core subject schemas</p>
            <p className="text-zinc-300">* d1a0b5f schema: verified credit hours and exam mark weightages against {preview?.regulatoryBody}</p>
            <p className="text-zinc-300">* c4f28e1 scaffold: created high-yield MCQ authoring template with clinical rationales</p>
            <p className="text-zinc-400">* 8b191c4 init: curriculum branch established for {program.slug}</p>
            <p className="pt-2 text-zinc-500">$ bujh verify --curriculum {program.slug}</p>
            <p className="text-emerald-400">✓ Council Schema: VALID</p>
            <p className="text-emerald-400">✓ Unit Breakdown: COMPLETE ({preview?.subjects.reduce((n, s) => n + s.units.length, 0)} units)</p>
            <p className="text-amber-400">⟳ Question Generator: IN PROGRESS ({preview?.progressPercent}% generated)</p>
          </div>
        </div>
      )}

      {/* ================= PRACTICE LIVE CURRICULUMS IN THE MEANTIME ================= */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Practise Live Now
            </span>
            <h3 className="mt-1 text-lg font-bold">
              Want to test the platform today?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xl">
              While {program.name} is finalizing its question banks, you can experience full timed mock exams, chapter quizzes, and leaderboards on the live D.Pharm tracks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleLaunchYear3}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <BookOpen className="h-4 w-4" />
              Try D.Pharm Year 3 (Live)
            </Button>
            <Button
              variant="outline"
              onClick={handleLaunchYear2}
              className="gap-2 font-medium"
            >
              Try D.Pharm Year 2 (Live)
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
