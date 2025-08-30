"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Lang = "nb" | "en";
type Theme = "light" | "dark";

interface Ctx { lang: Lang; dict: any; setLang: (l: Lang) => void; theme: Theme; setTheme:(t:Theme)=>void }
const I18nCtx = createContext<Ctx>({ lang: "nb", dict: {}, setLang: () => {}, theme:"light", setTheme: ()=>{} });

async function fetchDict(lang: Lang) {
  const res = await fetch(`/locales/${lang}.json`, { cache: "no-store" });
  return res.json();
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>((localStorage.getItem("lang") as Lang) || "nb");
  const [dict, setDict] = useState<any>({});
  const [theme, setThemeState] = useState<Theme>((localStorage.getItem("theme") as Theme) || "light");

  useEffect(() => { fetchDict(lang).then(setDict); localStorage.setItem("lang", lang); }, [lang]);
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setLang = (l: Lang) => setLangState(l);
  const setTheme = (t: Theme) => setThemeState(t);

  return <I18nCtx.Provider value={{ lang, dict, setLang, theme, setTheme }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
