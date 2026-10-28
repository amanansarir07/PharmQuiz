"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { LearningPage, PageHeading } from "@/components/learning-ui";

const FIRST_PAGE = 7;
const LAST_PAGE = 110;
const SOURCE_ROOT = "/npc-question-collection";

interface SearchPage {
  page: number;
  firstQuestion: number;
  lastQuestion: number;
  text: string;
}

function pageImage(page: number) {
  return `${SOURCE_ROOT}/pages/${String(page).padStart(3, "0")}.webp`;
}

export function NpcQuestionCollection() {
  const [page, setPage] = useState(FIRST_PAGE);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchPage[] | null>(null);
  const [searchError, setSearchError] = useState(false);

  useEffect(() => {
    if (!query.trim() || index || searchError) return;
    let cancelled = false;
    fetch(`${SOURCE_ROOT}/search-index.json`)
      .then((response) => {
        if (!response.ok) throw new Error("Index unavailable");
        return response.json() as Promise<SearchPage[]>;
      })
      .then((pages) => { if (!cancelled) setIndex(pages); })
      .catch(() => { if (!cancelled) setSearchError(true); });
    return () => { cancelled = true; };
  }, [query, index, searchError]);

  const matches = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term || !index) return [];
    const questionNumber = /^\d{1,3}$/.test(term) ? Number(term) : 0;
    return index.filter((entry) => questionNumber > 0
      ? questionNumber >= entry.firstQuestion && questionNumber <= entry.lastQuestion
      : entry.text.toLocaleLowerCase().includes(term));
  }, [index, query]);

  const currentRange = index?.find((entry) => entry.page === page);

  return <LearningPage className="max-w-5xl">
    <Link href="/programs/c-pharm" className="mb-5 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ChevronLeft className="size-4" /> Registration exam
    </Link>
    <PageHeading eyebrow="Nepal Pharmacy Council" title="Past question collection" description="Browse the supplied scanned collection, numbered through question 866." />

    <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
      <div className="flex items-start gap-3"><BookOpen className="mt-0.5 size-5 shrink-0 text-primary" /><div>
        <p className="font-semibold">For study and reference</p>
        <p className="mt-1 text-muted-foreground">The Council publication combines pharmacist and pharmacy assistant past questions. It has no answer key, so these scans are not used for scored practice. The original page image is the source of truth.</p>
      </div></div>
    </div>

    <div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-end">
      <label className="min-w-0 flex-1 text-sm font-semibold">
        Search pages or question number
        <span className="relative mt-2 block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. digoxin or 439" className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary" /></span>
      </label>
      <a href={`${SOURCE_ROOT}/source.pdf`} download="NPC-past-question-collection.pdf" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold hover:bg-muted"><Download className="size-4" /> Original PDF</a>
    </div>

    {query.trim() && <div className="mb-5 rounded-2xl border bg-card p-4" aria-live="polite">
      <p className="text-sm font-semibold">{searchError ? "Search is unavailable" : !index ? "Searching pages…" : `${matches.length} matching ${matches.length === 1 ? "page" : "pages"}`}</p>
      <p className="mt-1 text-xs text-muted-foreground">Search uses OCR and may miss words, especially Nepali text. Browse the scans for the exact wording.</p>
      {matches.length > 0 && <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto">{matches.map((match) => <button key={match.page} type="button" onClick={() => { setPage(match.page); setQuery(""); }} className="min-h-10 rounded-lg border px-3 text-sm hover:border-primary hover:text-primary">Page {match.page} · Q{match.firstQuestion}–{match.lastQuestion}</button>)}</div>}
    </div>}

    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3 sm:p-4">
        <div><p className="text-sm font-bold">Page {page} of {LAST_PAGE}</p><p className="text-xs text-muted-foreground">{currentRange ? `Questions ${currentRange.firstQuestion}–${currentRange.lastQuestion}` : "Questions 1–866 across 104 pages"}</p></div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">Jump to page
          <select value={page} onChange={(event) => setPage(Number(event.target.value))} className="h-10 rounded-lg border bg-background px-2 text-sm font-medium text-foreground">{Array.from({ length: LAST_PAGE - FIRST_PAGE + 1 }, (_, offset) => offset + FIRST_PAGE).map((value) => <option key={value} value={value}>{value}</option>)}</select>
        </label>
      </div>
      <Image key={page} src={pageImage(page)} alt={`Scanned Council past questions, book page ${page}`} width={1042} height={1474} unoptimized priority={page === FIRST_PAGE} className="mx-auto h-auto w-full max-w-[1042px]" />
      <div className="flex items-center justify-between gap-3 border-t p-3 sm:p-4">
        <button type="button" onClick={() => setPage((value) => Math.max(FIRST_PAGE, value - 1))} disabled={page === FIRST_PAGE} className="inline-flex min-h-11 items-center gap-1 rounded-xl border px-4 text-sm font-semibold disabled:opacity-40"><ChevronLeft className="size-4" /> Previous</button>
        <span className="text-xs text-muted-foreground">{page - FIRST_PAGE + 1} / {LAST_PAGE - FIRST_PAGE + 1}</span>
        <button type="button" onClick={() => setPage((value) => Math.min(LAST_PAGE, value + 1))} disabled={page === LAST_PAGE} className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40">Next <ChevronRight className="size-4" /></button>
      </div>
    </div>
  </LearningPage>;
}
