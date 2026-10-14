import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import UploadCard from "@/components/UploadCard";
import { EmptyState } from "@/components/ListingGrid";
import {
  byCategory,
  featured,
  sections,
  toCard,
  type Category,
} from "@/lib/content";
import { site } from "@/lib/site";

// Order of the sections on the home page
const order: Category[] = ["presentation", "document", "infographic"];

export default function Home() {
  return (
    <>
      {/* Intro (DRAFT TEXT: replace with your own words) */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-8 pt-14 sm:px-6 md:grid-cols-[1.4fr_1fr] md:pt-20">
        <div>
          <p className="text-sm font-medium text-coral">
            For B.Pharm and Pharm.D students
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Clear notes for pharmacy students, straight from the classroom.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            I&apos;m {site.author.name},{" "}
            {site.author.role.split(",")[0].toLowerCase()} of pharmacy practice.
            These are the slides and notes I teach with, free to read here or
            download. No sign-up needed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/presentations"
              className="rounded-full bg-deep px-6 py-3 text-sm font-semibold text-paper hover:bg-deep-dark"
            >
              Browse presentations
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-deep px-6 py-3 text-sm font-semibold text-deep hover:bg-deep hover:text-paper"
            >
              About me
            </Link>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {order.map((c) => (
              <div key={c} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{sections[c].title}</dt>
                <dd className="font-display text-2xl font-semibold text-deep">
                  {byCategory(c).length}
                </dd>
                <dd className="text-muted">
                  {(byCategory(c).length === 1
                    ? sections[c].singular
                    : sections[c].title
                  ).toLowerCase()}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative hidden md:block" aria-hidden="true">
          <div className="absolute inset-6 rounded-full bg-coral-soft/70 blur-2xl" />
          <LogoMark className="relative mx-auto w-full max-w-sm text-deep" />
        </div>
      </section>

      {order.map((c) => {
        const s = sections[c];
        const items = featured(c, 6).map(toCard);
        return (
          <section
            key={c}
            className="mx-auto max-w-6xl px-4 pt-14 sm:px-6"
            aria-labelledby={`h-${c}`}
          >
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-3">
              <div>
                <h2 id={`h-${c}`} className="text-2xl font-semibold">
                  {s.title}
                </h2>
                <p className="mt-1 text-sm text-muted">{s.blurb}</p>
              </div>
              {items.length > 0 && (
                <Link
                  href={s.path}
                  className="shrink-0 text-sm font-semibold text-deep hover:text-coral"
                >
                  Check more <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            {items.length === 0 ? (
              <EmptyState text={s.empty} />
            ) : (
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => (
                  <li key={item.url}>
                    <UploadCard
                      item={item}
                      priority={c === "presentation" && i < 3}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}
