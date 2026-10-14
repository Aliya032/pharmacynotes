import Link from "next/link";
import type { CardData } from "@/lib/content";

const unit = {
  presentation: "slides",
  document: "pages",
  infographic: "",
} as const;

export default function UploadCard({
  item,
  priority = false,
}: {
  item: CardData;
  priority?: boolean;
}) {
  const count =
    item.category !== "infographic" && item.pages
      ? `${item.pages} ${unit[item.category]}`
      : "";
  return (
    <Link
      href={item.url}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition hover:-translate-y-0.5 hover:border-teal hover:shadow-[0_8px_24px_-12px_rgba(25,90,95,0.35)]"
    >
      <div className="aspect-[16/10] overflow-hidden border-b border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumb}
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`h-full w-full object-cover ${item.aspect < 1 ? "object-top" : "object-center"} transition duration-300 group-hover:scale-[1.02]`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-deep group-hover:text-deep-dark">
          {item.title}
        </h3>
        <p className="mt-auto flex flex-wrap items-center gap-x-2 text-xs text-muted">
          {item.subject && <span>{item.subject}</span>}
          {item.subject && count && <span aria-hidden="true">·</span>}
          {count && <span>{count}</span>}
        </p>
      </div>
    </Link>
  );
}
