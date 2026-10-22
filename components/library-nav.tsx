"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/review", label: "Questions" },
  { href: "/bookmarks", label: "Saved" },
  { href: "/notes", label: "Notes" },
  { href: "/mistakes", label: "Mistakes" },
  { href: "/history", label: "History" },
];

export function LibraryNav() {
  const pathname = usePathname();
  return <nav aria-label="Study library" className="mb-6 flex gap-1 overflow-x-auto border-b [scrollbar-width:none]">{items.map(({ href, label }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`flex min-h-11 shrink-0 flex-1 items-center justify-center border-b-2 px-3 text-xs font-semibold transition-colors ${pathname === href ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{label}</Link>)}</nav>;
}
