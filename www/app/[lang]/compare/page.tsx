// app/[lang]/compare/page.tsx
export { default } from "@/app/compare/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

const SUPPORTED_LANGS = ["en","nb","de","es","fr","hi","ja","ko","pt-BR","ru","sk","zh","ar"] as const;
const BASE = "https://sleep-test.org";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = SUPPORTED_LANGS.includes(params.lang as any) ? params.lang : "en";

  const path = lang === "en" ? "/compare" : `/${lang}/compare`;

  return {
    ...seoForPath(path),
    alternates: {
      canonical: `${BASE}${path}`,
      languages: {
        "x-default": `${BASE}/compare`,
        en: `${BASE}/en/compare`,
        nb: `${BASE}/nb/compare`,
        de: `${BASE}/de/compare`,
        es: `${BASE}/es/compare`,
        fr: `${BASE}/fr/compare`,
        hi: `${BASE}/hi/compare`,
        ja: `${BASE}/ja/compare`,
        ko: `${BASE}/ko/compare`,
        "pt-BR": `${BASE}/pt-BR/compare`,
        ru: `${BASE}/ru/compare`,
        sk: `${BASE}/sk/compare`,
        zh: `${BASE}/zh/compare`,
        ar: `${BASE}/ar/compare`,
      },
    },
  };
}
