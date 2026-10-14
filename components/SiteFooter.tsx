import Link from "next/link";
import LogoMark from "./LogoMark";
import { nav, site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2.5 text-deep">
            <LogoMark className="h-8 w-auto" />
            <span className="font-display font-semibold">{site.name}</span>
          </Link>
          <p className="mt-3 text-sm text-muted">
            Notes, slides and infographics by {site.author.name},{" "}
            {site.author.credentials}. Free to read and download for your own
            study.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink hover:text-deep hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} {site.author.name}. For educational use.
        </p>
      </div>
    </footer>
  );
}
