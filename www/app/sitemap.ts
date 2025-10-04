// app/sitemap.ts
import { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n-routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sleep-test.org";

  const basePaths = ["/", "/result", "/compare", "/articles", "/about"];

  const items: MetadataRoute.Sitemap = [];

  const now = new Date();

  // Default (uten prefiks)
  for (const p of basePaths) {
    items.push({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: p === "/" ? 1 : 0.7,
    });
  }

  // Alle språk med prefiks
  for (const lang of LOCALES) {
    if (lang === DEFAULT_LOCALE) {
      // Engelsk finnes allerede uten prefiks, men vi legger også /en/... for tydelig signal til Google
      for (const p of basePaths) {
        const prefixed = p === "/" ? "/en" : `/en${p}`;
        items.push({
          url: `${BASE}${prefixed}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: p === "/" ? 0.9 : 0.6,
        });
      }
      continue;
    }
    for (const p of basePaths) {
      const prefixed = p === "/" ? `/${lang}` : `/${lang}${p}`;
      items.push({
        url: `${BASE}${prefixed}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: p === "/" ? 0.9 : 0.6,
      });
    }
  }

  return items;
}
