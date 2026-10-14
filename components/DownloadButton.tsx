"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Props = {
  href: string;
  label: string; // "PPTX", "PDF", "PNG"
  title: string;
  category: string;
  variant?: "solid" | "outline";
};

// Our own download button. Sends a "download_notes" event to Google Analytics
// with the upload's name (GA4 is added in a later step; until then this just downloads).
export default function DownloadButton({
  href,
  label,
  title,
  category,
  variant = "solid",
}: Props) {
  const fileName = href.split("/").pop();
  return (
    <a
      href={href}
      download={fileName}
      onClick={() =>
        window.gtag?.("event", "download_notes", {
          upload_name: title,
          upload_category: category,
          file_type: label,
        })
      }
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        variant === "solid"
          ? "bg-deep text-paper hover:bg-deep-dark"
          : "border border-deep text-deep hover:bg-deep hover:text-paper"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" />
      </svg>
      Download {label}
    </a>
  );
}
