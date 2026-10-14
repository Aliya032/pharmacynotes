import type { MetadataRoute } from "next";
import { uploads } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/presentations", "/documents", "/infographics", "/about"];
  return [
    ...pages.map((p) => ({
      url: site.url + p,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.8,
    })),
    ...uploads.map((u) => ({
      url: site.url + u.url,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
