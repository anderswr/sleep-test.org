// app/sitemap.ts
import { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n-routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sleep-test.org";
  const basePaths = ["/", "/result", "/compare", "/articles", "/about"];

  const items: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const lang of LOCALES) {
    for (const p of basePaths) {
      // Sett riktig path
      const url = p === "/" ? `/${lang}` : `/${lang}${p}`;

      // Bygg alternate-lenker (alle språk peker på hverandre)
      const alternates = LOCALES.reduce<Record<string, string>>((acc, l) => {
        acc[l] = `${BASE}${p === "/" ? `/${l}` : `/${l}${p}`}`;
        return acc;
      }, {});

      items.push({
        url: `${BASE}${url}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: p === "/" ? 1 : 0.7,
        alternates,
      });
    }
  }

  return items;
}
