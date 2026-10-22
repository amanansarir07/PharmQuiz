"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { faculties, getContentRecipients, getPrograms, getSubjectsForProgram } from "@/data/registry";
import { useAuth } from "@/lib/auth";
import { getSubjectQuestions } from "@/lib/quiz-loader";
import {
  createQuestionImport,
  DIFFICULTIES,
  MAX_IMPORT_QUESTIONS,
  type DraftQuestion,
  type ImportDestination,
  type SavedImport,
  getQuestionImportItems,
  getQuestionImports,
  publishQuestionImport,
  reviewState,
  updateQuestionImportItem,
  validateBatch,
  validateQuestion,
} from "@/lib/bulk-question-import";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Check, CheckCheck, ChevronRight, CircleAlert, ClipboardCheck, Download, FileJson, History, Loader2, Pencil, Search, Send, ShieldAlert, Trash2, Upload } from "lucide-react";

type Step = "destination" | "import" | "review";
type Filter = "all" | "ready" | "review" | "invalid" | "duplicates" | "approved" | "rejected";

// This mirrors the A/B/C/D past-paper JSON format used in the supplied
// collection. Destination fields in the UI decide where Bujh stores it;
// programme and unit metadata here are preserved as helpful source context.
const EXAMPLE = JSON.stringify([{
  id: "AP-U15-015",
  program: "D.Pharm",
  year: 2,
  subject: "Anatomy and Physiology",
  unit_number: 15,
  unit: "Human Growth and Development",
  topic: "Ageing",
  difficulty: "hard",
  question: "Which mechanism is proposed as a cause of ageing?",
  options: {
    A: "Increased muscle mass only",
    B: "Accumulation of free radical damage and shortening of telomeres",
    C: "Unlimited cell division",
    D: "Increased cell regeneration"
  },
  answer: "B",
  explanation: "Ageing theories include free radical damage, telomere shortening and DNA damage."
}], null, 2);

function downloadExample() {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([EXAMPLE], { type: "application/json" }));
  link.download = "bujh-mcq-import-example.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function StatusBadge({ question }: { question: DraftQuestion }) {
  const state = reviewState(question);
  if (question.status === "approved") return <Badge className="bg-emerald-600">Approved</Badge>;
  if (question.status === "rejected") return <Badge variant="secondary">Rejected</Badge>;
  if (state === "invalid") return <Badge variant="destructive">Invalid</Badge>;
  if (state === "review") return <Badge className="bg-amber-500 text-white">Needs review</Badge>;
  return <Badge className="bg-emerald-600">Ready</Badge>;
}

function Summary({ questions }: { questions: DraftQuestion[] }) {
  const ready = questions.filter((question) => reviewState(question) === "ready").length;
  const review = questions.filter((question) => reviewState(question) === "review").length;
  const invalid = questions.filter((question) => reviewState(question) === "invalid").length;
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><SummaryTile label="Imported" value={questions.length} /><SummaryTile label="Ready" value={ready} tone="text-emerald-600" /><SummaryTile label="Need review" value={review} tone="text-amber-600" /><SummaryTile label="Invalid" value={invalid} tone="text-destructive" /></div>;
}
function SummaryTile({ label, value, tone = "" }: { label: string; value: number; tone?: string }) { return <div className="rounded-xl border bg-card px-3 py-3"><p className={`text-xl font-bold tabular-nums ${tone}`}>{value}</p><p className="mt-0.5 text-xs text-muted-foreground">{label}</p></div>; }

export default function AdminQuestionsPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();
  // Admin imports must support every registered programme. A programme without
  // its curriculum wired into the registry uses manual subject/unit identifiers
  // until that syllabus is added, while its questions remain safely dormant.
  const availablePrograms = useMemo(() => getPrograms(), []);
  const [step, setStep] = useState<Step>("destination");
  const [facultySlug, setFacultySlug] = useState("");
  const [award, setAward] = useState("");
  const [destination, setDestination] = useState<ImportDestination>({ programSlug: "", subjectSlug: "", unitId: "", topic: "" });
  const programmesInFaculty = useMemo(() => availablePrograms.filter((program) => program.facultySlug === facultySlug), [availablePrograms, facultySlug]);
  const awardsInFaculty = useMemo(() => [...new Set(programmesInFaculty.map((program) => program.award))], [programmesInFaculty]);
  const yearsInProgramme = useMemo(() => programmesInFaculty.filter((program) => program.award === award), [programmesInFaculty, award]);
  const subjects = useMemo(() => getSubjectsForProgram(destination.programSlug), [destination.programSlug]);
  const sharedRecipients = useMemo(
    () => destination.programSlug ? getContentRecipients(destination.programSlug) : [],
    [destination.programSlug]
  );
  const subject = subjects.find((item) => item.slug === destination.subjectSlug);
  const unit = subject?.units.find((item) => item.id === destination.unitId);
  const hasRegisteredCurriculum = subjects.length > 0;
  const [rawJson, setRawJson] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [batch, setBatch] = useState<SavedImport | null>(null);
  const [history, setHistory] = useState<SavedImport[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<DraftQuestion | null>(null);
  const [notice, setNotice] = useState("");

  const loadHistory = async () => {
    try { setHistory(await getQuestionImports()); } catch { /* Migration may not have been applied yet. */ }
  };
  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setTimeout(() => { void loadHistory(); }, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin]);

  const chooseFaculty = (nextFacultySlug: string) => {
    setFacultySlug(nextFacultySlug);
    setAward("");
    setDestination({ programSlug: "", subjectSlug: "", unitId: "", topic: "" });
  };
  const chooseAward = (nextAward: string) => {
    setAward(nextAward);
    setDestination({ programSlug: "", subjectSlug: "", unitId: "", topic: "" });
  };
  const chooseProgram = (programSlug: string) => setDestination({ programSlug, subjectSlug: "", unitId: "", topic: "" });
  const chooseSubject = (subjectSlug: string) => setDestination((current) => ({ ...current, subjectSlug, unitId: "", topic: "" }));
  const chooseUnit = (unitId: string) => setDestination((current) => ({ ...current, unitId, topic: "" }));

  const scrollJsonEditorToEnd = () => window.requestAnimationFrame(() => {
    const editor = document.getElementById("question-import-json") as HTMLTextAreaElement | null;
    if (editor) editor.scrollTop = editor.scrollHeight;
  });

  const readFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) { setError("Choose a .json file."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setRawJson(typeof reader.result === "string" ? reader.result : "");
      scrollJsonEditorToEnd();
    };
    reader.onerror = () => setError("Could not read that file.");
    reader.readAsText(file);
  };

  const parseImport = async () => {
    setError(""); setNotice("");
    let parsed: unknown;
    try { parsed = JSON.parse(rawJson); } catch { setError("This is not valid JSON. Fix the syntax, then try again."); return; }
    try {
      const existing = subject ? await getSubjectQuestions(subject.slug, destination.programSlug) : [];
      setQuestions(validateBatch(parsed, existing.map((question) => question.question), destination.subjectSlug)); setSelected(new Set());
      setStep("review");
    } catch (importError) { setError(importError instanceof Error ? importError.message : "Could not validate the import."); }
  };

  const saveImport = async () => {
    setSaving(true); setError("");
    try {
      const created = await createQuestionImport(destination, questions);
      setBatch(created);
      const saved = await getQuestionImportItems(created.id);
      setQuestions(saved);
      await loadHistory();
      setNotice(sharedRecipients.length > 1
        ? `Draft saved. When published, these questions will be available to ${sharedRecipients.map((program) => program.shortLabel).join(", ")}.`
        : "Draft saved. Approved questions can now be published.");
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Could not save import. Apply migration 011 first."); }
    finally { setSaving(false); }
  };

  const updateQuestion = async (next: DraftQuestion) => {
    const recalculated = validateQuestion({ id: next.sourceId, unit_number: next.unitNumber, unit: next.unitName, topic: next.topic, unit_id: next.unitId, question: next.question, options: next.options, correctAnswer: next.correctAnswer, explanation: next.explanation, difficulty: next.difficulty, tags: next.tags }, next.position, new Set(), new Set(), destination.subjectSlug);
    recalculated.id = next.id; recalculated.status = next.status;
    setQuestions((current) => current.map((question) => question.id === next.id ? recalculated : question));
    setEditing(null);
    if (batch) {
      try { await updateQuestionImportItem(recalculated); } catch (updateError) { setError(updateError instanceof Error ? updateError.message : "Could not save this edit."); }
    }
  };

  const setQuestionStatus = async (id: string, status: "approved" | "rejected") => {
    const current = questions.find((question) => question.id === id); if (!current) return;
    if (status === "approved" && reviewState(current) === "invalid") { setError("Fix critical validation errors before approving this question."); return; }
    const next = { ...current, status };
    setQuestions((items) => items.map((item) => item.id === id ? next : item));
    if (batch) try { await updateQuestionImportItem(next); } catch (updateError) { setError(updateError instanceof Error ? updateError.message : "Could not update this question."); }
  };

  const bulkStatus = async (status: "approved" | "rejected", onlyValid = false) => {
    const targets = questions.filter((question) => !onlyValid || reviewState(question) !== "invalid");
    const next = questions.map((question) => targets.some((item) => item.id === question.id) ? { ...question, status } : question);
    setQuestions(next);
    if (batch) {
      try { await Promise.all(next.filter((question) => targets.some((item) => item.id === question.id)).map(updateQuestionImportItem)); }
      catch (updateError) { setError(updateError instanceof Error ? updateError.message : "Could not update selected questions."); }
    }
  };

  const bulkSelectedStatus = async (status: "approved" | "rejected") => {
    const targets = questions.filter((question) => selected.has(question.id) && (status !== "approved" || reviewState(question) !== "invalid"));
    if (!targets.length) { setError(status === "approved" ? "Select at least one valid question to approve." : "Select at least one question to reject."); return; }
    const next = questions.map((question) => targets.some((item) => item.id === question.id) ? { ...question, status } : question);
    setQuestions(next); setSelected(new Set());
    if (batch) try { await Promise.all(next.filter((question) => targets.some((item) => item.id === question.id)).map(updateQuestionImportItem)); }
    catch (updateError) { setError(updateError instanceof Error ? updateError.message : "Could not update selected questions."); }
  };

  const publish = async () => {
    if (!batch) { setError("Save the draft before publishing."); return; }
    setSaving(true); setError("");
    try {
      const result = await publishQuestionImport(batch.id);
      setBatch({ ...batch, status: "published", published_count: result.inserted });
      setNotice(`${result.inserted} approved question${result.inserted === 1 ? "" : "s"} published.${result.skipped ? ` ${result.skipped} duplicate approval${result.skipped === 1 ? " was" : "s were"} skipped.` : ""}`);
      await loadHistory();
    } catch (publishError) { setError(publishError instanceof Error ? publishError.message : "Could not publish this import."); }
    finally { setSaving(false); }
  };

  const openHistory = async (saved: SavedImport) => {
    try { const savedProgram = availablePrograms.find((program) => program.slug === saved.program_slug); setQuestions(await getQuestionImportItems(saved.id)); setSelected(new Set()); setBatch(saved); setFacultySlug(savedProgram?.facultySlug || ""); setAward(savedProgram?.award || ""); setDestination({ programSlug: saved.program_slug, subjectSlug: saved.subject_slug, unitId: saved.unit_id, topic: saved.topic || "" }); setStep("review"); setNotice(""); }
    catch (historyError) { setError(historyError instanceof Error ? historyError.message : "Could not open this import."); }
  };

  const filtered = questions.filter((question) => {
    const state = reviewState(question);
    const matchesSearch = !search || [question.question, ...question.options, question.explanation].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || filter === "ready" && state === "ready" || filter === "review" && state === "review" || filter === "invalid" && state === "invalid" || filter === "duplicates" && question.validation.warnings.some((warning) => warning.toLowerCase().includes("duplicate")) || filter === "approved" && question.status === "approved" || filter === "rejected" && question.status === "rejected";
    return matchesSearch && matchesFilter;
  });
  const approvable = questions.filter((question) => question.status === "approved" && reviewState(question) !== "invalid").length;

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  if (!isAdmin) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><Card><CardContent className="flex flex-col items-center gap-3 p-8"><ShieldAlert className="size-10 text-muted-foreground" /><h1 className="text-xl font-semibold">Admins only</h1><p className="text-sm text-muted-foreground">Question imports are restricted to admin accounts.</p><Button variant="outline" onClick={() => router.push("/dashboard")}>Back to dashboard</Button></CardContent></Card></div>;

  return <main className="mx-auto max-w-[1320px] px-4 py-7 pb-28 sm:px-6 lg:py-10">
    <Link href="/dashboard" className="mb-5 inline-flex min-h-10 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Dashboard</Link>
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><ClipboardCheck className="size-6" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Admin question bank</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Bulk MCQ import</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Validate, review, approve and publish a batch without exposing unreviewed content.</p></div></div><Link href="/admin/mock-exams" className="action-secondary">Mock exams <ChevronRight className="size-4" /></Link></div>
    <ol className="mb-7 grid grid-cols-3 gap-2" aria-label="Import progress">{(["destination", "import", "review"] as Step[]).map((item, index) => <li key={item} className="min-w-0"><div className={`flex items-center gap-2 text-xs font-semibold ${step === item ? "text-primary" : "text-muted-foreground"}`}><span className={`flex size-6 items-center justify-center rounded-full text-[11px] ${step === item ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{index + 1}</span><span className="truncate">{item === "destination" ? "Destination" : item === "import" ? "Import JSON" : "Review"}</span></div><div className={`mt-2 h-1 rounded-full ${step === item ? "bg-primary" : "bg-muted"}`} /></li>)}</ol>
    {error && <p role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}
    {step === "destination" && sharedRecipients.length > 1 && <p className="mb-5 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-muted-foreground"><strong className="text-foreground">Shared CTEVT Year 1 bank.</strong> When published, this batch will be available to {sharedRecipients.map((program) => program.shortLabel).join(", ")}. Nursing is kept separate.</p>}

    {step === "destination" && <Card><CardContent className="p-5 sm:p-7"><div className="mb-6"><h2 className="text-lg font-bold">Choose where these questions belong</h2><p className="mt-1 text-sm text-muted-foreground">Choose the stream, programme, and year in order. Every registered Bujh programme can receive an import.</p></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Stream"><select value={facultySlug} onChange={(event) => chooseFaculty(event.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 text-sm"><option value="">Choose stream</option>{faculties.map((faculty) => <option key={faculty.slug} value={faculty.slug}>{faculty.name}</option>)}</select></Field><Field label="Programme"><select value={award} onChange={(event) => chooseAward(event.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 text-sm" disabled={!facultySlug}><option value="">Choose programme</option>{awardsInFaculty.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field><Field label="Year / level"><select value={destination.programSlug} onChange={(event) => chooseProgram(event.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 text-sm" disabled={!award}><option value="">Choose year or level</option>{yearsInProgramme.map((program) => <option key={program.slug} value={program.slug}>{program.level || "Single programme"}{program.hasContent ? "" : " — curriculum setup pending"}</option>)}</select></Field>{!destination.programSlug ? <Field label="Subject"><select className="h-11 w-full rounded-xl border bg-card px-3 text-sm" disabled><option>Choose year or level first</option></select></Field> : hasRegisteredCurriculum ? <Field label="Subject"><select value={destination.subjectSlug} onChange={(event) => chooseSubject(event.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 text-sm"><option value="">Choose subject</option>{subjects.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></Field> : <Field label="Subject slug"><Input value={destination.subjectSlug} onChange={(event) => chooseSubject(event.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))} placeholder="e.g. pharmacology" autoCapitalize="none" /><span className="block text-xs leading-5 text-muted-foreground">Use this same slug when you register the syllabus.</span></Field>}{destination.programSlug && subject ? <Field label="Chapter / unit"><select value={destination.unitId} onChange={(event) => chooseUnit(event.target.value)} className="h-11 w-full rounded-xl border bg-card px-3 text-sm"><option value="">Choose unit</option>{subject.units.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field> : <Field label="Unit ID"><Input value={destination.unitId} onChange={(event) => chooseUnit(event.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))} placeholder="e.g. unit-1" autoCapitalize="none" disabled={!destination.programSlug} /><span className="block text-xs leading-5 text-muted-foreground">Match this ID to the future curriculum unit.</span></Field>}{destination.programSlug && unit ? <Field label="Topic (optional)"><select value={destination.topic} onChange={(event) => setDestination((current) => ({ ...current, topic: event.target.value }))} className="h-11 w-full rounded-xl border bg-card px-3 text-sm"><option value="">No specific topic</option>{unit.subtopics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></Field> : <Field label="Topic (optional)"><Input value={destination.topic} onChange={(event) => setDestination((current) => ({ ...current, topic: event.target.value }))} placeholder="e.g. autonomic nervous system" disabled={!destination.programSlug} /></Field>}</div>{destination.programSlug && !hasRegisteredCurriculum && <p className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">This programme is not student-facing yet. Published questions are stored safely and become available when its matching curriculum is registered and activated.</p>}<div className="mt-7 flex justify-end"><Button onClick={() => { if (!destination.programSlug || !destination.subjectSlug || !destination.unitId) { setError("Choose a stream, programme, year, subject, and unit to continue."); return; } setError(""); setStep("import"); }}>Continue to import <ChevronRight className="size-4" /></Button></div></CardContent></Card>}
    {step === "import" && <Card><CardContent className="p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">Import JSON</h2><p className="mt-1 text-sm text-muted-foreground">Use <code className="rounded bg-muted px-1 py-0.5 text-xs">correctAnswer</code> as a zero-based option index (0–3), or <code className="rounded bg-muted px-1 py-0.5 text-xs">answer</code> as A–D. Options may be an A/B/C/D object or an array.</p></div><Button variant="outline" onClick={downloadExample}><Download className="size-4" /> Download format demo</Button></div><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]"><Textarea id="question-import-json" aria-label="Paste question JSON" value={rawJson} onChange={(event) => setRawJson(event.target.value)} onPaste={scrollJsonEditorToEnd} placeholder={EXAMPLE} className="h-80 min-h-0 max-h-80 overflow-y-auto [field-sizing:fixed] font-mono text-xs leading-5 sm:h-[26rem] sm:max-h-[26rem] lg:h-[30rem] lg:max-h-[30rem]" /><div className="rounded-2xl border border-dashed bg-muted/20 p-5"><FileJson className="size-8 text-primary" /><p className="mt-3 text-sm font-semibold">Your collection format</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Matches the A/B/C/D options and letter answer format in your pasted question bank. Paste an array of up to {MAX_IMPORT_QUESTIONS} questions.</p><label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border bg-card px-3 text-sm font-semibold hover:bg-muted"><Upload className="size-4" /> Choose .json<input type="file" accept="application/json,.json" className="sr-only" onChange={readFile} /></label></div></div><div className="sticky bottom-3 z-10 mt-4 flex flex-wrap justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-sm backdrop-blur"><Button variant="outline" onClick={() => setStep("destination")}>Back</Button><Button onClick={parseImport} disabled={!rawJson.trim()}>Validate questions <ChevronRight className="size-4" /></Button></div></CardContent></Card>}

    {step === "review" && <><section className="mb-5"><Summary questions={questions} /></section><div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-card p-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{(["all", "ready", "review", "invalid", "duplicates", "approved", "rejected"] as Filter[]).map((item) => <Button key={item} size="sm" variant={filter === item ? "default" : "outline"} onClick={() => setFilter(item)} className="capitalize">{item === "review" ? "Needs review" : item}</Button>)}</div><div className="relative w-full lg:w-72"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search imported questions" className="h-10 pl-9" /></div></div><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Showing {filtered.length} of {questions.length} questions{selected.size ? ` · ${selected.size} selected` : ""}</p><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => void bulkStatus("approved", true)}><CheckCheck className="size-4" /> Approve all valid</Button><Button variant="outline" size="sm" onClick={() => void bulkSelectedStatus("approved")} disabled={!selected.size}><Check className="size-4" /> Approve selected</Button><Button variant="outline" size="sm" onClick={() => void bulkSelectedStatus("rejected")} disabled={!selected.size}><Trash2 className="size-4" /> Reject selected</Button></div></div><div className="space-y-3">{filtered.map((question) => <QuestionCard key={question.id} question={question} selected={selected.has(question.id)} onSelect={() => setSelected((current) => { const next = new Set(current); if (next.has(question.id)) next.delete(question.id); else next.add(question.id); return next; })} onApprove={() => void setQuestionStatus(question.id, "approved")} onReject={() => void setQuestionStatus(question.id, "rejected")} onEdit={() => setEditing(question)} />)}{filtered.length === 0 && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No imported questions match this filter.</CardContent></Card>}</div><div className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] mt-6 flex flex-col gap-3 rounded-2xl border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{approvable} approved and valid</p><p className="text-xs text-muted-foreground">Only approved, valid questions can be published.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => setStep("import")}>Import another file</Button>{!batch ? <Button onClick={saveImport} disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />} Save draft</Button> : batch.status === "published" ? <Button disabled>Published</Button> : <Button onClick={publish} disabled={!approvable || saving}><Send className="size-4" /> Publish {approvable} question{approvable === 1 ? "" : "s"}</Button>}</div></div></>}

    <section className="mt-10 border-t pt-7"><div className="mb-4 flex items-center gap-2"><History className="size-5 text-primary" /><h2 className="font-bold">Import history</h2></div>{history.length === 0 ? <p className="text-sm text-muted-foreground">Saved imports will appear here after migration 011 is applied.</p> : <div className="grid gap-2 md:grid-cols-2">{history.map((saved) => <button key={saved.id} type="button" onClick={() => void openHistory(saved)} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 text-left hover:border-primary/40"><div className="min-w-0"><p className="truncate text-sm font-semibold">{saved.subject_slug} · {saved.unit_id}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(saved.created_at).toLocaleDateString()} · {saved.imported_count} imported · {saved.published_count} published</p></div><Badge variant={saved.status === "published" ? "default" : "secondary"}>{saved.status}</Badge></button>)}</div>}</section>
    <EditDialog question={editing} onClose={() => setEditing(null)} onSave={updateQuestion} />
  </main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-2"><span className="block text-sm font-semibold">{label}</span>{children}</label>; }
function QuestionCard({ question, selected, onSelect, onApprove, onReject, onEdit }: { question: DraftQuestion; selected: boolean; onSelect: () => void; onApprove: () => void; onReject: () => void; onEdit: () => void }) { const unitLabel = question.unitName || (question.unitNumber ? `Unit ${question.unitNumber}` : "Batch unit"); return <Card><CardContent className="p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-2"><input type="checkbox" checked={selected} onChange={onSelect} aria-label={`Select question ${question.position + 1}`} className="size-4 accent-primary" /><span className="text-xs font-bold text-muted-foreground">#{question.position + 1}</span><StatusBadge question={question} /><Badge variant="secondary" className="capitalize">{question.difficulty}</Badge></div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={onEdit}><Pencil className="size-4" /> Edit</Button><Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-700" onClick={onApprove}><Check className="size-4" /> Approve</Button><Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onReject}><Trash2 className="size-4" /> Reject</Button></div></div><div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground"><span className="rounded-md bg-muted px-2 py-1">{question.unitNumber ? `Unit ${question.unitNumber}: ` : ""}{unitLabel}</span>{question.topic && <span className="rounded-md bg-muted px-2 py-1">{question.topic}</span>}<span className="rounded-md bg-muted px-2 py-1 font-mono">{question.unitId || "batch unit"}</span></div><p className="mt-3 text-sm font-semibold leading-6 sm:text-base">{question.question || "Missing question text"}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, index) => <div key={`${option}-${index}`} className={`rounded-xl border px-3 py-2 text-sm ${index === question.correctAnswer ? "border-emerald-500/50 bg-emerald-500/10" : ""}`}><span className="mr-2 font-semibold text-muted-foreground">{String.fromCharCode(65 + index)}.</span>{option || <span className="text-destructive">Missing option</span>}{index === question.correctAnswer && <Check className="ml-2 inline size-3.5 text-emerald-600" />}</div>)}</div>{question.explanation && <p className="mt-3 rounded-xl bg-muted/60 p-3 text-sm leading-6"><span className="font-semibold">Explanation: </span>{question.explanation}</p>}{[...question.validation.critical, ...question.validation.warnings].length > 0 && <div className="mt-3 flex flex-wrap gap-2">{question.validation.critical.map((message) => <span key={message} className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2 py-1 text-xs text-destructive"><CircleAlert className="size-3" />{message}</span>)}{question.validation.warnings.map((message) => <span key={message} className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-300"><CircleAlert className="size-3" />{message}</span>)}</div>}</CardContent></Card>; }
function EditDialog({ question, onClose, onSave }: { question: DraftQuestion | null; onClose: () => void; onSave: (question: DraftQuestion) => void }) { if (!question) return null; return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Edit imported question</DialogTitle><DialogDescription>Validation runs again when you save.</DialogDescription></DialogHeader><EditQuestionForm key={question.id} question={question} onClose={onClose} onSave={onSave} /></DialogContent></Dialog>; }
function EditQuestionForm({ question, onClose, onSave }: { question: DraftQuestion; onClose: () => void; onSave: (question: DraftQuestion) => void }) { const [draft, setDraft] = useState(() => ({ ...question, options: [...question.options] })); return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Unit number"><Input type="number" min="1" value={draft.unitNumber ?? ""} onChange={(event) => setDraft({ ...draft, unitNumber: event.target.value ? Number(event.target.value) : null })} /></Field><Field label="Unit ID"><Input value={draft.unitId} onChange={(event) => setDraft({ ...draft, unitId: event.target.value })} placeholder="chemistry-unit-1" /></Field></div><Field label="Unit name"><Input value={draft.unitName} onChange={(event) => setDraft({ ...draft, unitName: event.target.value })} placeholder="Physical and General Chemistry" /></Field><Field label="Topic"><Input value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} placeholder="1.1 Introduction to Chemistry" /></Field><Field label="Question"><Textarea value={draft.question} onChange={(event) => setDraft({ ...draft, question: event.target.value })} className="min-h-24" /></Field><div className="grid gap-3 sm:grid-cols-2">{draft.options.map((option, index) => <Field key={index} label={`Option ${String.fromCharCode(65 + index)}`}><Input value={option} onChange={(event) => setDraft({ ...draft, options: draft.options.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} /></Field>)}</div><Field label="Correct answer"><select value={draft.correctAnswer ?? ""} onChange={(event) => setDraft({ ...draft, correctAnswer: event.target.value === "" ? null : Number(event.target.value) })} className="h-11 w-full rounded-xl border bg-card px-3 text-sm"><option value="">Choose correct option</option>{draft.options.map((option, index) => <option key={index} value={index}>{String.fromCharCode(65 + index)}. {option || `Option ${index + 1}`}</option>)}</select></Field><Field label="Explanation"><Textarea value={draft.explanation} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} className="min-h-20" /></Field><Field label="Difficulty"><select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value })} className="h-11 w-full rounded-xl border bg-card px-3 text-sm">{DIFFICULTIES.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty[0].toUpperCase() + difficulty.slice(1)}</option>)}</select></Field><div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSave(draft)}>Save and validate</Button></div></div>; }
