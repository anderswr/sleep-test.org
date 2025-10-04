// app/providers/I18nProvider.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Supported languages
export type Lang =
  | "ar"
  | "de"
  | "en"
  | "es"
  | "fr"
  | "hi"
  | "ja"
  | "ko"
  | "nb"
  | "pt-BR"
  | "ru"
  | "sk"
  | "zh";

interface I18nContextShape {
  lang: Lang;
  dict: any; // current dictionary json
  setLang: (l: Lang) => void;
}

const I18nCtx = createContext<I18nContextShape>({
  lang: "en",
  dict: {},
  setLang: () => {},
});

// Språk som støttes
const SUPPORTED: Lang[] = [
  "ar",
  "de",
  "en",
  "es",
  "fr",
  "hi",
  "ja",
  "ko",
  "nb",
  "pt-BR",
  "ru",
  "sk",
  "zh",
];

function isLang(x: unknown): x is Lang {
  return typeof x === "string" && SUPPORTED.includes(x as Lang);
}

function isRTL(lang: Lang): boolean {
  return lang === "ar"; // utvid hvis du legger til hebraisk, persisk osv.
}

function detectLangFromNavigator(): Lang {
  if (typeof navigator === "undefined") return "en";
  const langs = (navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || "en"]
  ).map((l) => String(l).toLowerCase());

  if (langs.some((l) => l.startsWith("nb") || l.startsWith("no") || l.startsWith("nn"))) {
    return "nb";
  }
  if (langs.some((l) => l.startsWith("pt-br"))) {
    return "pt-BR";
  }
  for (const cand of langs) {
    const code = SUPPORTED.find((s) => cand.startsWith(s.toLowerCase()));
    if (code) return code;
  }
  return "en";
}

function getInitialLang(): Lang {
  // 1) Persisted user choice
  try {
    const saved = localStorage.getItem("lang");
    if (isLang(saved)) return saved;
  } catch {}
  // 2) From <html data-lang|lang>
  if (typeof document !== "undefined") {
    const el = document.documentElement;
    const fromAttr = el.getAttribute("data-lang") || el.lang;
    if (isLang(fromAttr)) return fromAttr;
  }
  // 3) Browser
  return detectLangFromNavigator();
}

async function fetchDict(lang: Lang) {
  const res = await fetch(`/locales/${lang}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load locale: " + lang);
  return res.json();
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en"; // SSR fallback
    return getInitialLang();
  });
  const [dict, setDict] = useState<any>({});

  // Hold <html> oppdatert
  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.setAttribute("data-lang", lang);
    el.dir = isRTL(lang) ? "rtl" : "ltr";
  }, [lang]);

  // Last ordbok
  useEffect(() => {
    let cancelled = false;
    fetchDict(lang)
      .then((d) => {
        if (!cancelled) setDict(d);
      })
      .catch(() => {
        if (!cancelled) setDict({});
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  // Setter med lagring
  const setLang = useMemo(
    () => (l: Lang) => {
      try {
        localStorage.setItem("lang", l);
      } catch {}
      setLangState(l);
    },
    []
  );

  return (
    <I18nCtx.Provider value={{ lang, dict, setLang }}>
      {children}
    </I18nCtx.Provider>
  );
}

export const useI18n = () => useContext(I18nCtx);
