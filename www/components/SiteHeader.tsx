// components/SiteHeader.tsx
"use client";
import Link from "next/link";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import * as React from "react";

export default function SiteHeader() {
  const { dict, lang, setLang, theme, setTheme } = useI18n();
  return (
    <header className="topbar">
      <nav className="nav">
        <Link href="/" className="brand">Sleep Test</Link>
        <Link href="/result/demo">{t(dict,"ui.nav.result","Resultat")}</Link>
        <Link href="/compare">{t(dict,"ui.nav.compare","Sammenlign")}</Link>
        <Link href="/articles">{t(dict,"ui.nav.articles","Artikler")}</Link>
        <Link href="/legal">{t(dict,"ui.nav.legal","Personvern & vilkår")}</Link>
      </nav>

      <div className="row">
        {/* theme */}
        <button
          className="btn ghost"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* language */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          className="select"
          aria-label="Language"
        >
          <option value="nb">Norsk</option>
          <option value="en">English</option>
        </select>
      </div>
    </header>
  );
}
