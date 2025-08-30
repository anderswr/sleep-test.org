// components/SiteHeader.tsx
"use client";
import Link from "next/link";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function SiteHeader() {
  const { lang, setLang, dict } = useI18n();
  return (
    <header className="topbar">
      <nav className="nav">
        <Link href="/" className="active">DMZ Sleep</Link>
        <Link href="/compare">{t(dict, "ui.nav.compare", "Sammenlign")}</Link>
        <Link href="#articles">{t(dict, "ui.nav.articles", "Artikler")}</Link>
      </nav>
      <div>
        <label className="sr-only" htmlFor="lang">{t(dict, "ui.home.language_label", "Språk")}</label>
        <select id="lang" className="btn" value={lang} onChange={(e)=>setLang(e.target.value as any)}>
          <option value="nb">Norsk</option>
          <option value="en">English</option>
        </select>
      </div>
    </header>
  );
}
