// app/[lang]/_seo.ts
import { buildAlternatesForPath, DEFAULT_LOCALE, LOCALES } from "@/lib/i18n-routing";

export function seoForPath(fullPathname: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sleep-test.org";
  const { languages, xDefault } = buildAlternatesForPath(BASE_URL, fullPathname);

  return {
    alternates: {
      canonical: languages[DEFAULT_LOCALE],
      languages,
      types: {},
    },
    other: {
      "hreflang-x-default": xDefault,
    },
  } as const;
}
