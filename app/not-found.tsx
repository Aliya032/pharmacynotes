import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <LogoMark className="w-28 text-coral" />
      <p className="mt-8 font-display text-sm font-semibold text-coral">404</p>
      <h1 className="mt-2 text-3xl font-semibold">This page isn&apos;t here</h1>
      <p className="mt-3 text-muted">
        The link may be old, or the notes may have moved. Try one of these
        instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-deep px-5 py-2.5 text-sm font-semibold text-paper hover:bg-deep-dark"
        >
          Home
        </Link>
        <Link
          href="/presentations"
          className="rounded-full border border-deep px-5 py-2.5 text-sm font-semibold text-deep hover:bg-deep hover:text-paper"
        >
          Presentations
        </Link>
        <Link
          href="/documents"
          className="rounded-full border border-deep px-5 py-2.5 text-sm font-semibold text-deep hover:bg-deep hover:text-paper"
        >
          Documents
        </Link>
      </div>
    </div>
  );
}
