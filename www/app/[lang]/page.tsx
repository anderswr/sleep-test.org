// app/[lang]/page.tsx
export { default } from "@/app/page";

import type { Metadata } from "next";
import { seoForPath } from "./_seo";

const SUPPORTED_LANGS = ["en","nb","de","es","fr","hi","ja","ko","pt-BR","ru","sk","zh","ar"] as const;
const BASE = "https://sleep-test.org";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = SUPPORTED_LANGS.includes(params.lang as any) ? params.lang : "en";

  // Sett riktig URL for canonical
  const path = lang === "en" ? "/" : `/${lang}`;

  return {
    ...seoForPath(path), // din eksisterende SEO helper
    alternates: {
      canonical: `${BASE}${path}`,
      languages: {
        "x-default": `${BASE}/`,
        en: `${BASE}/en`,
        nb: `${BASE}/nb`,
        de: `${BASE}/de`,
        es: `${BASE}/es`,
        fr: `${BASE}/fr`,
        hi: `${BASE}/hi`,
        ja: `${BASE}/ja`,
        ko: `${BASE}/ko`,
        "pt-BR": `${BASE}/pt-BR`,
        ru: `${BASE}/ru`,
        sk: `${BASE}/sk`,
        zh: `${BASE}/zh`,
        ar: `${BASE}/ar`,
      },
    },
  };
}
