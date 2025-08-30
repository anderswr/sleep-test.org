"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// Supported languages
export type Lang = "nb" | "en";

interface I18nContextShape {
  lang: Lang;
  dict: any; // current dictionary json
  setLang: (l: Lang) => void;
}

const I18nCtx = createContext<I18nContextShape>({ lang: "nb", dict: {}, setLang: () => {} });

async function fetchDict(lang: Lang) {
  const res = await fetch(`/locales/${lang}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load locale: " + lang);
  return res.json();
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("nb");
  const [dict, setDict] = useState<any>({});

  useEffect(() => {
    fetchDict(lang).then(setDict).catch(() => setDict({}));
  }, [lang]);

  return (
    <I18nCtx.Provider value={{ lang, dict, setLang }}>
      {children}
    </I18nCtx.Provider>
  );
}

export const useI18n = () => useContext(I18nCtx);
