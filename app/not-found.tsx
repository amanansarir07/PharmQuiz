import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, GraduationCap, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <SearchX className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The link may be out of date, or the programme or subject it pointed to
        hasn&apos;t been published yet.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link href="/programs">
          <Button>
            <GraduationCap className="mr-2 h-4 w-4" />
            Browse programmes
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">
            <Compass className="mr-2 h-4 w-4" />
            Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
