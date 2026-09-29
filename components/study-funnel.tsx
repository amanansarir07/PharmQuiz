"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useActiveProgram } from "@/lib/program";
import { useAuth } from "@/lib/auth";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Stethoscope,
  Wrench,
  Sprout,
  Atom,
  Laptop,
  Briefcase,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type BoardType = "ctevt" | "plus-two";

interface FunnelState {
  board: BoardType | null;
  // CTEVT branch
  ctevtCategory: string | null;
  ctevtProgram: string | null;
  ctevtYear: string | null;
  // +2 branch
  plusTwoStream: string | null;
  plusTwoGrade: string | null;
  plusTwoSubject: string | null;
}

const CTEVT_CATEGORIES = [
  {
    id: "health",
    title: "Health Sciences",
    description: "Pharmacy, Nursing, Health Assistant (HA), CMLT, Physiotherapy",
    icon: Stethoscope,
    available: true,
  },
  {
    id: "engineering",
    title: "Engineering",
    description: "Civil, Electrical, Computer, Mechanical Diploma",
    icon: Wrench,
    available: false,
  },
  {
    id: "agriculture",
    title: "Agriculture & Forestry",
    description: "Plant Science, Animal Science & Veterinary",
    icon: Sprout,
    available: false,
  },
];

const CTEVT_HEALTH_PROGRAMS = [
  {
    id: "d-pharm",
    title: "Diploma in Pharmacy (D.Pharm)",
    description: "3-year diploma curriculum in pharmaceutical sciences",
    icon: "💊",
    hasActiveYear: true,
  },
  {
    id: "pcl-nursing",
    title: "PCL Nursing",
    description: "3-year proficiency certificate in general nursing & midwifery",
    icon: "🩺",
    hasActiveYear: false,
  },
  {
    id: "health-assistant",
    title: "Health Assistant (HA)",
    description: "General medicine, primary healthcare & clinical diagnostics",
    icon: "🌍",
    hasActiveYear: false,
  },
  {
    id: "cmlt",
    title: "Certificate in Med. Lab Tech (CMLT)",
    description: "Haematology, clinical microbiology & biochemical testing",
    icon: "🔬",
    hasActiveYear: false,
  },
  {
    id: "d-physiotherapy",
    title: "Diploma in Physiotherapy",
    description: "Musculoskeletal therapy, kinesiology & rehabilitation",
    icon: "🦴",
    hasActiveYear: false,
  },
];

const CTEVT_YEARS = [
  { id: "y1", label: "Year 1", slugSuffix: "y1", available: false },
  { id: "y2", label: "Year 2", slugSuffix: "y2", available: true },
  { id: "y3", label: "Year 3", slugSuffix: "y3", available: false },
];

const PLUS_TWO_STREAMS = [
  {
    id: "science",
    title: "+2 Science (Biology / Physical)",
    description: "Pre-medical, pharmacy, engineering and applied sciences",
    icon: Atom,
    available: false,
  },
  {
    id: "computer",
    title: "+2 Computer Science",
    description: "Programming fundamentals, web tech and computer systems",
    icon: Laptop,
    available: false,
  },
  {
    id: "management",
    title: "+2 Management",
    description: "Accountancy, economics, business studies and marketing",
    icon: Briefcase,
    available: false,
  },
];

const PLUS_TWO_GRADES = [
  { id: "11", label: "Grade 11" },
  { id: "12", label: "Grade 12" },
];

const PLUS_TWO_SUBJECTS: Record<string, string[]> = {
  science: ["Physics", "Chemistry", "Biology", "Mathematics", "English"],
  computer: ["Computer Science", "Physics", "Mathematics", "English"],
  management: ["Accountancy", "Economics", "Business Studies", "Marketing"],
};

export function StudyFunnel({ id }: { id?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { setProgramSlug } = useActiveProgram();

  const [state, setState] = useState<FunnelState>({
    board: null,
    ctevtCategory: null,
    ctevtProgram: null,
    ctevtYear: null,
    plusTwoStream: null,
    plusTwoGrade: null,
    plusTwoSubject: null,
  });

  // Calculate current active step (1 to 4)
  let currentStep = 1;
  if (!state.board) {
    currentStep = 1;
  } else if (state.board === "ctevt") {
    if (!state.ctevtCategory) currentStep = 2;
    else if (!state.ctevtProgram) currentStep = 3;
    else currentStep = 4;
  } else if (state.board === "plus-two") {
    if (!state.plusTwoStream) currentStep = 2;
    else if (!state.plusTwoGrade) currentStep = 3;
    else currentStep = 4;
  }

  const handleReset = () => {
    setState({
      board: null,
      ctevtCategory: null,
      ctevtProgram: null,
      ctevtYear: null,
      plusTwoStream: null,
      plusTwoGrade: null,
      plusTwoSubject: null,
    });
  };

  const handleBack = () => {
    if (state.board === "ctevt") {
      if (state.ctevtYear) setState((s) => ({ ...s, ctevtYear: null }));
      else if (state.ctevtProgram) setState((s) => ({ ...s, ctevtProgram: null }));
      else if (state.ctevtCategory) setState((s) => ({ ...s, ctevtCategory: null }));
      else setState((s) => ({ ...s, board: null }));
    } else if (state.board === "plus-two") {
      if (state.plusTwoSubject) setState((s) => ({ ...s, plusTwoSubject: null }));
      else if (state.plusTwoGrade) setState((s) => ({ ...s, plusTwoGrade: null }));
      else if (state.plusTwoStream) setState((s) => ({ ...s, plusTwoStream: null }));
      else setState((s) => ({ ...s, board: null }));
    }
  };

  // Launch the active curriculum (d-pharm-y2)
  const handleLaunchActive = (destination: "dashboard" | "register") => {
    setProgramSlug("d-pharm-y2");
    if (destination === "register") {
      router.push("/auth/register?program=d-pharm-y2");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <section id={id} className="relative scroll-mt-12 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm sm:p-10">
          
          {/* Header & Step Tracker */}
          <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Custom Learning Path
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                What do you study?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your education board, stream, and year to access customized MCQs & study material.
              </p>
            </div>

            {state.board && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="gap-1.5 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              </div>
            )}
          </div>

          {/* Stepper Progress Indicator */}
          <nav aria-label="Workflow Stepper" className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:gap-4">
              <li className={`flex items-center gap-1.5 ${currentStep >= 1 ? "text-primary font-semibold" : ""}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${currentStep >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted"}`}>
                  1
                </span>
                <span>Board</span>
              </li>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              <li className={`flex items-center gap-1.5 ${currentStep >= 2 ? "text-primary font-semibold" : ""}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${currentStep >= 2 ? "border-primary bg-primary text-primary-foreground" : "border-muted"}`}>
                  2
                </span>
                <span>{state.board === "plus-two" ? "Stream" : "Category"}</span>
              </li>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              <li className={`flex items-center gap-1.5 ${currentStep >= 3 ? "text-primary font-semibold" : ""}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${currentStep >= 3 ? "border-primary bg-primary text-primary-foreground" : "border-muted"}`}>
                  3
                </span>
                <span>{state.board === "plus-two" ? "Grade" : "Program"}</span>
              </li>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              <li className={`flex items-center gap-1.5 ${currentStep >= 4 ? "text-primary font-semibold" : ""}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${currentStep >= 4 ? "border-primary bg-primary text-primary-foreground" : "border-muted"}`}>
                  4
                </span>
                <span>{state.board === "plus-two" ? "Subject" : "Year / Sem"}</span>
              </li>
            </ol>
          </nav>

          {/* ================= STEP 1: CHOOSE BOARD ================= */}
          {!state.board && (
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, board: "ctevt" }))}
                className="group relative flex flex-col items-start rounded-2xl border-2 border-border/80 bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="mt-4 flex items-center justify-between w-full">
                  <h3 className="text-xl font-bold">CTEVT Programmes</h3>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Live Content
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Technical diplomas in Health Sciences (Pharmacy, Nursing, Health Assistant, CMLT, Physiotherapy) & Engineering.
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  Select CTEVT <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setState((s) => ({ ...s, board: "plus-two" }))}
                className="group relative flex flex-col items-start rounded-2xl border-2 border-border/80 bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 transition-transform group-hover:scale-105">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="mt-4 flex items-center justify-between w-full">
                  <h3 className="text-xl font-bold">+2 Programmes (NEB)</h3>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Coming Soon
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Higher secondary streams for Grade 11 & 12 in Science (Biology/Physical), Computer Science, and Management.
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  Select +2 <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          )}

          {/* ================= CTEVT BRANCH ================= */}
          {state.board === "ctevt" && (
            <div className="space-y-6">

              {/* Step 2: CTEVT Category */}
              {!state.ctevtCategory && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Choose CTEVT Category</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {CTEVT_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setState((s) => ({ ...s, ctevtCategory: cat.id }))}
                          className="group relative flex flex-col items-start rounded-xl border p-5 text-left transition-all hover:border-primary hover:bg-primary/[0.02]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="mt-3 flex w-full items-center justify-between">
                            <span className="font-semibold text-foreground">{cat.title}</span>
                            {cat.available ? (
                              <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: CTEVT Program (if Category selected) */}
              {state.ctevtCategory && !state.ctevtProgram && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Choose Health Science Program</h3>
                    <Badge variant="outline" className="text-xs">Category: Health</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CTEVT_HEALTH_PROGRAMS.map((prog) => (
                      <button
                        key={prog.id}
                        type="button"
                        onClick={() => setState((s) => ({ ...s, ctevtProgram: prog.id }))}
                        className="group flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary hover:bg-primary/[0.02]"
                      >
                        <span className="text-2xl">{prog.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{prog.title}</h4>
                            {prog.hasActiveYear ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                                Active Content
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{prog.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: CTEVT Year / Semester (if Program selected) */}
              {state.ctevtCategory && state.ctevtProgram && !state.ctevtYear && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Select Year / Semester</h3>
                    <p className="text-xs text-muted-foreground">
                      Curriculum and examination subjects are structured by year.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {CTEVT_YEARS.map((yr) => {
                      const isActive = state.ctevtProgram === "d-pharm" && yr.id === "y2";
                      return (
                        <button
                          key={yr.id}
                          type="button"
                          onClick={() => setState((s) => ({ ...s, ctevtYear: yr.id }))}
                          className={`group flex flex-col items-center justify-center rounded-2xl border-2 p-6 text-center transition-all ${
                            isActive
                              ? "border-emerald-500/40 bg-emerald-500/[0.04] hover:border-emerald-500 hover:shadow-md"
                              : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <span className="text-xl font-bold">{yr.label}</span>
                          {isActive ? (
                            <Badge className="mt-3 bg-emerald-500 text-white text-xs">
                              Live Syllabus & MCQs
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-3 text-xs text-muted-foreground">
                              Coming Soon
                            </Badge>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {isActive
                              ? "8 Subjects • 800+ Questions • Timed Mocks"
                              : "Syllabus in preparation"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completion Screen for CTEVT */}
              {state.ctevtCategory && state.ctevtProgram && state.ctevtYear && (
                <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                  {state.ctevtProgram === "d-pharm" && state.ctevtYear === "y2" ? (
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">Diploma in Pharmacy · Year 2</h3>
                            <Badge className="bg-emerald-500 text-white text-xs">Ready to Study</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            CTEVT Health Sciences • 8 Subjects • Full Unit Practice & Mock Tests
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-2.5 rounded-xl border bg-muted/30 p-4 text-xs sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Pharmaceutics I, Pharmacology I, Chemistry I</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Pharmacognosy, Microbiology, Therapeutics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Pharmaceutical Management &amp; Public Health</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>Live Leaderboard &amp; Explanations</span>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                          size="lg"
                          onClick={() => handleLaunchActive("dashboard")}
                          className="gap-2 bg-primary font-semibold shadow-md"
                        >
                          <BookOpen className="h-4 w-4" />
                          Start Practice on Dashboard
                        </Button>
                        {!user && (
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleLaunchActive("register")}
                            className="gap-2 font-semibold"
                          >
                            Create Free Account
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Curriculum Coming Soon!</h3>
                          <p className="text-sm text-muted-foreground">
                            This programme track is actively being drafted. You can explore the live D.Pharm Year 2 curriculum today to experience the platform.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                          onClick={() => {
                            setState((s) => ({ ...s, ctevtProgram: "d-pharm", ctevtYear: "y2" }));
                          }}
                          className="gap-2"
                        >
                          Switch to D.Pharm Year 2 (Live Demo)
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={handleReset}>
                          Choose Another Programme
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= +2 BRANCH ================= */}
          {state.board === "plus-two" && (
            <div className="space-y-6">

              {/* Step 2: +2 Stream */}
              {!state.plusTwoStream && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Choose Your +2 Stream</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {PLUS_TWO_STREAMS.map((st) => {
                      const Icon = st.icon;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setState((s) => ({ ...s, plusTwoStream: st.id }))}
                          className="group flex flex-col items-start rounded-xl border p-5 text-left transition-all hover:border-primary hover:bg-primary/[0.02]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="mt-3 font-semibold text-foreground">{st.title}</span>
                          <p className="mt-1 text-xs text-muted-foreground">{st.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: +2 Grade */}
              {state.plusTwoStream && !state.plusTwoGrade && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select Grade / Level</h3>
                    <Badge variant="outline" className="text-xs">Stream: {state.plusTwoStream}</Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {PLUS_TWO_GRADES.map((gr) => (
                      <button
                        key={gr.id}
                        type="button"
                        onClick={() => setState((s) => ({ ...s, plusTwoGrade: gr.id }))}
                        className="group flex flex-col items-center justify-center rounded-2xl border-2 p-8 text-center transition-all hover:border-primary hover:bg-primary/[0.02]"
                      >
                        <span className="text-2xl font-bold">{gr.label}</span>
                        <p className="mt-1 text-xs text-muted-foreground">National Examinations Board (NEB)</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: +2 Subject */}
              {state.plusTwoStream && state.plusTwoGrade && !state.plusTwoSubject && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Select Target Subject Focus</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(PLUS_TWO_SUBJECTS[state.plusTwoStream] || []).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setState((s) => ({ ...s, plusTwoSubject: sub }))}
                        className="rounded-xl border p-4 text-center font-medium transition-all hover:border-primary hover:bg-primary/[0.02]"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion Screen for +2 */}
              {state.plusTwoStream && state.plusTwoGrade && state.plusTwoSubject && (
                <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">
                          +2 {state.plusTwoStream.toUpperCase()} · Grade {state.plusTwoGrade} ({state.plusTwoSubject})
                        </h3>
                        <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        NEB question banks and chapter-wise MCQs are currently under development.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      onClick={() => handleLaunchActive("dashboard")}
                      className="gap-2"
                    >
                      Try D.Pharm Year 2 Live Demo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      Explore CTEVT Streams
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
