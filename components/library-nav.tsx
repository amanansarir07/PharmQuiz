"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Bookmark, NotebookPen, RotateCcw, History } from "lucide-react";

const items = [
  { href: "/review", label: "Questions", icon: BookOpen },
  { href: "/bookmarks", label: "Saved", icon: Bookmark },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/mistakes", label: "Mistakes", icon: RotateCcw },
  { href: "/history", label: "History", icon: History },
];

export function LibraryNav() {
  const pathname = usePathname();
  return <nav aria-label="Study library" className="mb-6 flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 [scrollbar-width:none]">{items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`flex min-h-11 shrink-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><Icon className="size-4" /><span>{label}</span></Link>)}</nav>;
}
