// app/[lang]/articles/page.tsx
export { default } from "@/app/articles/page";

import type { Metadata } from "next";
import { seoForPath } from "../_seo";

const SUPPORTED_LANGS = ["en","nb","de","es","fr","hi","ja","ko","pt-BR","ru","sk","zh","ar"] as const;
const BASE = "https://sleep-test.org";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = SUPPORTED_LANGS.includes(params.lang as any) ? params.lang : "en";

  const path = lang === "en" ? "/articles" : `/${lang}/articles`;

  return {
    ...seoForPath(path),
    alternates: {
      canonical: `${BASE}${path}`,
      languages: {
        "x-default": `${BASE}/articles`,
        en: `${BASE}/en/articles`,
        nb: `${BASE}/nb/articles`,
        de: `${BASE}/de/articles`,
        es: `${BASE}/es/articles`,
        fr: `${BASE}/fr/articles`,
        hi: `${BASE}/hi/articles`,
        ja: `${BASE}/ja/articles`,
        ko: `${BASE}/ko/articles`,
        "pt-BR": `${BASE}/pt-BR/articles`,
        ru: `${BASE}/ru/articles`,
        sk: `${BASE}/sk/articles`,
        zh: `${BASE}/zh/articles`,
        ar: `${BASE}/ar/articles`,
      },
    },
  };
}
