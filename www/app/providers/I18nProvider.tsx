// app/providers/I18nProvider.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Supported languages
export type Lang = "nb" | "en";

interface I18nContextShape {
  lang: Lang;
  dict: any; // current dictionary json
  setLang: (l: Lang) => void;
}

const I18nCtx = createContext<I18nContextShape>({
  lang: "nb",
  dict: {},
  setLang: () => {},
});

function isLang(x: unknown): x is Lang {
  return x === "nb" || x === "en";
}

function detectLangFromNavigator(): Lang {
  if (typeof navigator === "undefined") return "en";
  const langs = (navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || "en"]
  ).map((l) => String(l).toLowerCase());

  const wantsNb = langs.some(
    (l) => l === "nb" || l.startsWith("nb-") || l === "no" || l.startsWith("no-") || l === "nn" || l.startsWith("nn-")
  );
  return wantsNb ? "nb" : "en";
}

function getInitialLang(): Lang {
  // 1) Persisted user choice
  try {
    const saved = localStorage.getItem("lang");
    if (isLang(saved)) return saved;
  } catch {}
  // 2) From <html data-lang|lang> (set early in layout boot script)
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
  // Init once on client with a safe default; replace on mount
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en"; // SSR safety
    return getInitialLang();
  });
  const [dict, setDict] = useState<any>({});

  // Keep <html> attributes in sync
  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.setAttribute("data-lang", lang);
  }, [lang]);

  // Load dictionary when lang changes
  useEffect(() => {
    let cancelled = false;
    fetchDict(lang)
      .then((d) => { if (!cancelled) setDict(d); })
      .catch(() => { if (!cancelled) setDict({}); });
    return () => { cancelled = true; };
  }, [lang]);

  // Wrap setter to persist + sync DOM
  const setLang = useMemo(
    () => (l: Lang) => {
      try { localStorage.setItem("lang", l); } catch {}
      setLangState(l);
      // <html> sync happens in the effect above
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
