import type { Metadata } from "next";
import Link from "next/link";
import DownloadButton from "./DownloadButton";
import PdfReader from "./PdfReader";
import UploadCard from "./UploadCard";
import { sections, toCard, uploads, type Upload } from "@/lib/content";
import { site } from "@/lib/site";

export function uploadMetadata(item: Upload): Metadata {
  const s = sections[item.category];
  const description =
    item.description ||
    `${item.title}: ${s.singular.toLowerCase()} for ${item.courses.join(" and ") || "pharmacy"} students.`;
  return {
    title: `${item.title} (${s.singular})`,
    description: description.slice(0, 160),
    keywords: [...item.tags, item.subject, ...item.courses].filter(Boolean),
    alternates: { canonical: item.url },
    openGraph: {
      title: item.title,
      description,
      url: item.url,
      images: [item.thumb],
      type: "article",
    },
  };
}

export default function UploadPage({ item }: { item: Upload }) {
  const s = sections[item.category];
  const related = uploads
    .filter((u) => u.subject === item.subject && u.url !== item.url)
    .slice(0, 3);
  const hasText = item.text.some((t) => t.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":
      item.category === "infographic" ? "ImageObject" : "LearningResource",
    name: item.title,
    description: item.description,
    url: site.url + item.url,
    image: site.url + item.thumb,
    inLanguage: "en",
    educationalLevel: item.courses.join(", "),
    about: item.subject,
    keywords: item.tags.join(", "),
    author: { "@type": "Person", name: site.author.name },
    isAccessibleForFree: true,
  };

  return (
    <article className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href={s.path} className="hover:text-deep hover:underline">
          {s.title}
        </Link>
        {item.subject && (
          <>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span>{item.subject}</span>
          </>
        )}
      </nav>

      <header className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
            {item.title}
          </h1>
          <p className="mt-2 flex flex-wrap gap-x-2 text-sm text-muted">
            <span>{s.singular}</span>
            {item.category !== "infographic" && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {item.pages} {s.unit}
                </span>
              </>
            )}
            {item.courses.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{item.courses.join(", ")}</span>
              </>
            )}
          </p>
        </div>
        <div className="shrink-0">
          <DownloadButton
            href={item.download}
            label={item.downloadLabel}
            title={item.title}
            category={item.category}
          />
        </div>
      </header>

      <div className="mt-8">
        {item.category === "infographic" && item.image ? (
          <figure>
            <a
              href={item.download}
              target="_blank"
              rel="noopener"
              className="block overflow-hidden rounded-lg border border-line bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={`${item.title} infographic`}
                width={item.width}
                height={item.height}
                className="h-auto w-full"
              />
            </a>
            <figcaption className="mt-2 text-center text-xs text-muted">
              Tap the image to open it full size.
            </figcaption>
          </figure>
        ) : item.pdf ? (
          <PdfReader
            src={item.pdf}
            pages={item.pages}
            aspect={item.aspect}
            unit={item.category === "presentation" ? "Slide" : "Page"}
            title={item.title}
            category={item.category}
            download={item.download}
            downloadLabel={item.downloadLabel}
          />
        ) : null}
      </div>

      <section className="mt-10 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">
          About this {s.singular.toLowerCase()}
        </h2>
        {item.description && (
          <p className="mt-3 leading-relaxed">{item.description}</p>
        )}
        {item.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics">
            {item.tags.map((t) => (
              <li
                key={t}
                className="rounded-full bg-teal-soft px-3 py-1 text-xs text-deep"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <p className="text-sm text-muted">
            By{" "}
            <Link
              href="/about"
              className="font-medium text-deep hover:underline"
            >
              {site.author.name}
            </Link>
          </p>
          <DownloadButton
            href={item.download}
            label={item.downloadLabel}
            title={item.title}
            category={item.category}
            variant="outline"
          />
        </div>
      </section>

      {hasText && (
        <details className="group mt-6 rounded-2xl border border-line bg-card p-6">
          <summary className="cursor-pointer list-none font-display font-semibold text-deep">
            <span
              className="mr-2 inline-block transition group-open:rotate-90"
              aria-hidden="true"
            >
              ›
            </span>
            Text of these {s.unit}
          </summary>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            {item.text.map((t, i) =>
              t ? (
                <li key={i}>
                  <span className="font-medium text-ink">
                    {item.category === "presentation" ? "Slide" : "Page"}{" "}
                    {i + 1}.
                  </span>{" "}
                  {t}
                </li>
              ) : null,
            )}
          </ol>
        </details>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold">More on {item.subject}</h2>
          <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((u) => (
              <li key={u.url}>
                <UploadCard item={toCard(u)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
