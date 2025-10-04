// app/[lang]/about/page.tsx
export { default } from "@/app/about/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

const SUPPORTED_LANGS = ["en","nb","de","es","fr","hi","ja","ko","pt-BR","ru","sk","zh","ar"] as const;
const BASE = "https://sleep-test.org";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = SUPPORTED_LANGS.includes(params.lang as any) ? params.lang : "en";

  const path = lang === "en" ? "/about" : `/${lang}/about`;

  return {
    ...seoForPath(path),
    alternates: {
      canonical: `${BASE}${path}`,
      languages: {
        "x-default": `${BASE}/about`,
        en: `${BASE}/en/about`,
        nb: `${BASE}/nb/about`,
        de: `${BASE}/de/about`,
        es: `${BASE}/es/about`,
        fr: `${BASE}/fr/about`,
        hi: `${BASE}/hi/about`,
        ja: `${BASE}/ja/about`,
        ko: `${BASE}/ko/about`,
        "pt-BR": `${BASE}/pt-BR/about`,
        ru: `${BASE}/ru/about`,
        sk: `${BASE}/sk/about`,
        zh: `${BASE}/zh/about`,
        ar: `${BASE}/ar/about`,
      },
    },
  };
}
