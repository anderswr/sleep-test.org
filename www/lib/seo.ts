// lib/seo.ts
import type { Metadata } from "next";
import { Dict, t } from "@/lib/i18n";
import {
  DEFAULT_LANG,
  Lang,
  SUPPORTED_LANGS,
  langToHomePath,
} from "@/lib/lang";

import ar from "@/public/locales/ar.json";
import de from "@/public/locales/de.json";
import en from "@/public/locales/en.json";
import es from "@/public/locales/es.json";
import fr from "@/public/locales/fr.json";
import hi from "@/public/locales/hi.json";
import ja from "@/public/locales/ja.json";
import ko from "@/public/locales/ko.json";
import nb from "@/public/locales/nb.json";
import ptBR from "@/public/locales/pt-BR.json";
import ru from "@/public/locales/ru.json";
import sk from "@/public/locales/sk.json";
import zh from "@/public/locales/zh.json";

const BASE_URL = "https://sleep-test.org";

const LOCALES: Record<Lang, Dict> = {
  ar,
  de,
  en,
  es,
  fr,
  hi,
  ja,
  ko,
  nb,
  "pt-BR": ptBR,
  ru,
  sk,
  zh,
};

function getHomeCopy(lang: Lang) {
  const dict = LOCALES[lang] ?? LOCALES[DEFAULT_LANG];
  const fallbackTitle =
    "Sleep Test – Free - No login 5-Minute Sleep Quality Report";
  const fallbackDescription =
    "Take a free sleep test in 5–10 minutes. Answer 30 simple questions and get an instant report with sleep score, patterns, and practical tips.";

  return {
    title: t(dict, "seo.home.title", fallbackTitle) as string,
    description: t(dict, "seo.home.description", fallbackDescription) as string,
  };
}

export function getHomeMetadata(lang: Lang): Metadata {
  const { title, description } = getHomeCopy(lang);
  const canonicalPath = langToHomePath(lang);
  const canonicalUrl = new URL(canonicalPath, BASE_URL).toString();

  const languages = Object.fromEntries(
    SUPPORTED_LANGS.map((language) => [
      language,
      new URL(langToHomePath(language), BASE_URL).toString(),
    ])
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Sleep Test",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
