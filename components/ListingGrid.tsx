"use client";

import { useMemo, useState } from "react";
import UploadCard from "./UploadCard";
import type { CardData } from "@/lib/content";

// Card grid with a search box and subject filter. Shown on /presentations, /documents, /infographics.
export default function ListingGrid({
  items,
  emptyText,
}: {
  items: CardData[];
  emptyText: string;
}) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  const subjects = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items)
      if (i.subject) counts.set(i.subject, (counts.get(i.subject) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  }, [items]);

  const shown = items.filter((i) => {
    if (subject !== "All" && i.subject !== subject) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      i.title.toLowerCase().includes(q) || i.subject.toLowerCase().includes(q)
    );
  });

  if (items.length === 0) return <EmptyState text={emptyText} />;

  return (
    <div>
      {items.length > 6 && (
        <div className="mb-8 flex flex-col gap-4">
          <label className="relative block max-w-md">
            <span className="sr-only">Search by title or subject</span>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or subject"
              className="w-full rounded-full border border-line bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted focus:border-teal focus:outline-none"
            />
          </label>
          {subjects.length > 1 && (
            <div
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
              role="group"
              aria-label="Filter by subject"
            >
              {["All", ...subjects].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  aria-pressed={subject === s}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition ${
                    subject === s
                      ? "border-deep bg-deep text-paper"
                      : "border-line bg-card text-ink hover:border-coral"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState text="Nothing matches that search. Try another word or subject." />
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((item, i) => (
            <li key={item.url} className="flex">
              <div className="w-full">
                <UploadCard item={item} priority={i < 3} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-card/60 px-6 py-16 text-center">
      <svg
        viewBox="0 0 24 24"
        className="mx-auto h-10 w-10 text-coral"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10l2 2h6.5A1.5 1.5 0 0 1 20 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
      </svg>
      <p className="mt-4 text-muted">{text}</p>
    </div>
  );
}
