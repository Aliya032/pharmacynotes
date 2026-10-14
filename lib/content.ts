// Reads content/uploads.json (made by `npm run content`).
// Only import this from server components (pages), never from "use client" files.
import uploadsJson from "@/content/uploads.json";

export type Category = "presentation" | "document" | "infographic";

export type Upload = {
  category: Category;
  slug: string;
  url: string;
  title: string;
  description: string;
  subject: string;
  courses: string[];
  tags: string[];
  featured: boolean;
  order: number;
  thumb: string;
  pages: number;
  aspect: number;
  text: string[];
  download: string;
  downloadLabel: string;
  pdf?: string;
  image?: string;
  width?: number;
  height?: number;
};

export const uploads = uploadsJson as Upload[];

export const sections: Record<
  Category,
  { path: string; title: string; singular: string; unit: string; blurb: string; empty: string }
> = {
  presentation: {
    path: "/presentations",
    title: "Presentations",
    singular: "Presentation",
    unit: "slides",
    blurb: "Lecture slides you can read here or download as PowerPoint.",
    empty: "No presentations yet. Check back soon.",
  },
  document: {
    path: "/documents",
    title: "Documents",
    singular: "Document",
    unit: "pages",
    blurb: "Written notes, flowcharts and handouts as PDF.",
    empty: "No documents yet. Check back soon.",
  },
  infographic: {
    path: "/infographics",
    title: "Infographics",
    singular: "Infographic",
    unit: "",
    blurb: "One-page visual summaries for quick revision.",
    empty: "No infographics yet. Check back soon.",
  },
};

export function byCategory(category: Category) {
  return uploads.filter((u) => u.category === category);
}

export function featured(category: Category, max = 6) {
  const all = byCategory(category);
  const picks = all.filter((u) => u.featured);
  return (picks.length ? picks : all).slice(0, max);
}

export function findUpload(category: Category, slug: string) {
  return uploads.find((u) => u.category === category && u.slug === slug);
}

// The fields a card needs. Keeps the slide text out of the browser bundle.
export type CardData = Pick<
  Upload,
  "url" | "title" | "subject" | "thumb" | "pages" | "category" | "aspect"
>;

export function toCard(u: Upload): CardData {
  const { url, title, subject, thumb, pages, category, aspect } = u;
  return { url, title, subject, thumb, pages, category, aspect };
}

// Static export needs at least one page per route, so an empty category gets a placeholder
// that renders the 404 page.
export function staticParams(category: Category) {
  const list = byCategory(category).map((u) => ({ slug: u.slug }));
  return list.length ? list : [{ slug: "none" }];
}
