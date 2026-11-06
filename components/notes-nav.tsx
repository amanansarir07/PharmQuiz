"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/notes", label: "My notes" },
  { href: "/notes/shared", label: "Shared notes" },
];

export function NotesNav() {
  const pathname = usePathname();
  return <nav aria-label="Note sections" className="mb-6 grid grid-cols-2 border-b">
    {items.map((item) => {
      const active = pathname === item.href;
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
        className={`flex min-h-11 items-center justify-center border-b-2 px-3 text-sm font-semibold ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
        {item.label}
      </Link>;
    })}
  </nav>;
}
