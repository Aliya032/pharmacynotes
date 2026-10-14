"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import DownloadButton from "./DownloadButton";

type Props = {
  src: string;
  pages: number;
  aspect: number; // width / height of page 1
  unit: "Slide" | "Page";
  title: string;
  category: string;
  download: string;
  downloadLabel: string;
};

// Renders every page of a PDF onto canvases with PDF.js (pages draw as you scroll near them).
// There is no PDF.js toolbar, so its built-in download button never appears.
export default function PdfReader({
  src,
  pages,
  aspect,
  unit,
  title,
  category,
  download,
  downloadLabel,
}: Props) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [current, setCurrent] = useState(1);
  const [drawn, setDrawn] = useState<Set<number>>(() => new Set());
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const busy = useRef<Set<number>>(new Set());

  // 1. Load the PDF
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const doc = await pdfjs.getDocument({ url: src }).promise;
        if (cancelled) return void doc.destroy();
        docRef.current = doc;
        setStatus("ready");
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      docRef.current?.destroy();
      docRef.current = null;
    };
  }, [src]);

  // 2. Draw one page into its box
  const draw = useCallback(
    async (n: number) => {
      const doc = docRef.current;
      const box = pageRefs.current[n - 1];
      if (!doc || !box || busy.current.has(n)) return;
      busy.current.add(n);
      try {
        const page = await doc.getPage(n);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale: (box.clientWidth / base.width) * dpr,
        });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.className = "block h-auto w-full";
        canvas.setAttribute("aria-label", `${unit} ${n}`);
        canvas.setAttribute("role", "img");
        await page.render({ canvas, viewport }).promise;
        box.querySelector("canvas")?.remove();
        box.appendChild(canvas);
        box.style.aspectRatio = `${base.width} / ${base.height}`;
        setDrawn((s) => new Set(s).add(n));
      } catch (err) {
        console.error(err);
        busy.current.delete(n); // allow a retry when it scrolls into view again
      }
    },
    [unit],
  );

  // 3. Draw pages as they come near the screen
  useEffect(() => {
    if (status !== "ready") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            draw(Number((e.target as HTMLElement).dataset.page));
        }
      },
      { rootMargin: "1200px 0px" },
    );
    pageRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [status, draw]);

  // 4. Work out which page is on screen, for the progress bar
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.45;
        let n = 1;
        pageRefs.current.forEach((el, i) => {
          if (el && el.getBoundingClientRect().top < line) n = i + 1;
        });
        setCurrent(n);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-danger/30 bg-card px-6 py-12 text-center">
        <p className="font-display text-lg font-semibold text-danger">
          This file could not be shown here.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          It may be a slow connection or an older browser. You can still
          download it and open it on your device.
        </p>
        <div className="mt-6">
          <DownloadButton
            href={download}
            label={downloadLabel}
            title={title}
            category={category}
          />
        </div>
      </div>
    );
  }

  const pct = pages ? Math.round((current / pages) * 100) : 0;

  return (
    <div>
      {/* Progress bar, sticks under the site header */}
      <div className="sticky top-16 z-30 -mx-4 mb-4 border-b border-line bg-paper/95 px-4 py-2.5 backdrop-blur sm:mx-0 sm:rounded-b-xl sm:px-0">
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          <span aria-live="polite">
            {status === "loading"
              ? "Loading…"
              : `${unit} ${current} of ${pages}`}
          </span>
          <span>{status === "loading" ? "" : `${pct}%`}</span>
        </div>
        <div
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={pages}
          aria-valuenow={current}
          aria-label="Reading progress"
        >
          <div
            className="h-full rounded-full bg-teal transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: pages }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              pageRefs.current[i] = el;
            }}
            data-page={i + 1}
            style={{ aspectRatio: String(aspect) }}
            className={`relative w-full overflow-hidden rounded-lg border border-line bg-white shadow-sm ${
              drawn.has(i + 1) ? "" : "skeleton"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
