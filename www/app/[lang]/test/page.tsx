// app/[lang]/test/page.tsx
export { default } from "@/app/test/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

const SUPPORTED_LANGS = ["en","nb","de","es","fr","hi","ja","ko","pt-BR","ru","sk","zh","ar"] as const;
const BASE = "https://sleep-test.org";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = SUPPORTED_LANGS.includes(params.lang as any) ? params.lang : "en";
  const path = lang === "en" ? "/test" : `/${lang}/test`;

  return {
    ...seoForPath(path),
    alternates: {
      canonical: `${BASE}${path}`,
      languages: {
        "x-default": `${BASE}/test`,
        en: `${BASE}/en/test`,
        nb: `${BASE}/nb/test`,
        de: `${BASE}/de/test`,
        es: `${BASE}/es/test`,
        fr: `${BASE}/fr/test`,
        hi: `${BASE}/hi/test`,
        ja: `${BASE}/ja/test`,
        ko: `${BASE}/ko/test`,
        "pt-BR": `${BASE}/pt-BR/test`,
        ru: `${BASE}/ru/test`,
        sk: `${BASE}/sk/test`,
        zh: `${BASE}/zh/test`,
        ar: `${BASE}/ar/test`,
      },
    },
  };
}
