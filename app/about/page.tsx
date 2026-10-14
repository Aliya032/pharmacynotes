import type { Metadata } from "next";
import LogoMark from "@/components/LogoMark";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `About ${site.author.name}`,
  description: `${site.author.name}, ${site.author.credentials}, ${site.author.role}. The person behind ${site.name}.`,
  alternates: { canonical: "/about" },
};

// DRAFT PAGE: the photo, bio and contact details below are placeholders until Aliya sends the real ones.
const contacts: { label: string; value: string; href: string }[] = [
  // { label: "Email", value: "name@example.com", href: "mailto:name@example.com" },
  // { label: "Instagram", value: "@handle", href: "https://instagram.com/handle" },
];

export default function About() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.author.name,
    jobTitle: "Assistant Professor",
    hasCredential: site.author.credentials,
    url: site.url + "/about",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pt-14 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="grid items-start gap-10 md:grid-cols-[240px_1fr]">
        {/* Photo placeholder: replace with <img src="/about/photo.webp" ... /> */}
        <div className="mx-auto flex aspect-[4/5] w-48 items-center justify-center rounded-3xl border border-line bg-teal-soft md:w-full">
          <LogoMark className="w-2/3 text-deep/40" />
        </div>

        <div>
          <p className="text-sm font-medium text-coral">About</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
            {site.author.name}
          </h1>
          <p className="mt-2 text-muted">
            {site.author.credentials} · {site.author.role}
          </p>

          <div className="mt-8 space-y-4 leading-relaxed">
            <p>
              [Bio goes here. Two or three short paragraphs: what you teach,
              where, how long you have been teaching, and why you share these
              notes.]
            </p>
          </div>

          {contacts.length > 0 && (
            <section className="mt-10 rounded-2xl border border-line bg-card p-6">
              <h2 className="text-lg font-semibold">Get in touch</h2>
              <ul className="mt-3 space-y-2">
                {contacts.map((c) => (
                  <li key={c.label} className="text-sm">
                    <span className="inline-block w-24 text-muted">
                      {c.label}
                    </span>
                    <a
                      href={c.href}
                      className="font-medium text-deep hover:underline"
                    >
                      {c.value}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
