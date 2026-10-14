import ListingGrid from "./ListingGrid";
import { byCategory, sections, toCard, type Category } from "@/lib/content";

export default function ListingPage({ category }: { category: Category }) {
  const s = sections[category];
  const items = byCategory(category).map(toCard);
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-coral">
          {items.length}{" "}
          {(items.length === 1 ? s.singular : s.title).toLowerCase()}
        </p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{s.title}</h1>
        <p className="mt-3 text-muted">{s.blurb}</p>
      </header>
      <ListingGrid items={items} emptyText={s.empty} />
    </div>
  );
}
