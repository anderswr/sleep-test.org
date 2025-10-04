// app/[lang]/_seo.ts
import { buildAlternatesForPath, DEFAULT_LOCALE, LOCALES } from "@/lib/i18n-routing";

export function seoForPath(fullPathname: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sleep-test.org";
  const { languages, xDefault } = buildAlternatesForPath(BASE_URL, fullPathname);

  return {
    title: "Sleep Test – Free multilingual sleep quality report",
    description:
      "Answer 30 short questions in your language and get a personalized sleep report — free, science-based, and anonymous.",
    alternates: {
      canonical: languages[DEFAULT_LOCALE],
      languages,
    },
    other: {
      "hreflang-x-default": xDefault,
    },
  } as const;
}
