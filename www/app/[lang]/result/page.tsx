// app/[lang]/result/page.tsx
export { default } from "@/app/result/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

const SUPPORTED_LANGS = ["en","nb","de","es","fr","hi","ja","ko","pt-BR","ru","sk","zh","ar"] as const;
const BASE = "https://sleep-test.org";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = SUPPORTED_LANGS.includes(params.lang as any) ? params.lang : "en";

  const path = lang === "en" ? "/result" : `/${lang}/result`;

  return {
    ...seoForPath(path),
    alternates: {
      canonical: `${BASE}${path}`,
      languages: {
        "x-default": `${BASE}/result`,
        en: `${BASE}/en/result`,
        nb: `${BASE}/nb/result`,
        de: `${BASE}/de/result`,
        es: `${BASE}/es/result`,
        fr: `${BASE}/fr/result`,
        hi: `${BASE}/hi/result`,
        ja: `${BASE}/ja/result`,
        ko: `${BASE}/ko/result`,
        "pt-BR": `${BASE}/pt-BR/result`,
        ru: `${BASE}/ru/result`,
        sk: `${BASE}/sk/result`,
        zh: `${BASE}/zh/result`,
        ar: `${BASE}/ar/result`,
      },
    },
  };
}
