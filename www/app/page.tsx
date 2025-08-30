// app/page.tsx
"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "./providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function Home() {
  const { dict } = useI18n();

  return (
    <>
      <SiteHeader />
      <main className="container">
        {/* Hero */}
        <section className="card" style={{ padding: "28px" }}>
          <h1 className="mb-2">{t(dict, "ui.home.title", "DMZ Sleep Test")}</h1>
          <p className="muted">{t(dict, "ui.home.subtitle", "Start testen for å få en personlig rapport.")}</p>
          <div className="row mt-6" style={{ gap: 10 }}>
            <Link className="btn primary" href="/test">
              {t(dict, "ui.home.cta", "Start test")}
            </Link>
            <Link className="btn" href="/compare">
              {t(dict, "ui.nav.compare", "Sammenlign")}
            </Link>
          </div>
        </section>

        {/* Hurtigvalg-kort */}
        <section className="grid-cards mt-6">
          <Link href="/test" className="card quick-card">
            <h3>🛌 {t(dict, "ui.home.cards.start", "Start test")}</h3>
            <p className="muted">{t(dict, "ui.home.cards.start_desc", "Svare på 5–10 min, få konkret rapport.")}</p>
          </Link>
          <Link href="/result/demo" className="card quick-card">
            <h3>📊 {t(dict, "ui.home.cards.results", "Resultater")}</h3>
            <p className="muted">{t(dict, "ui.home.cards.results_desc", "Se eksempel på rapport.")}</p>
          </Link>
          <Link href="/compare" className="card quick-card">
            <h3>🔁 {t(dict, "ui.home.cards.compare", "Sammenlign")}</h3>
            <p className="muted">{t(dict, "ui.home.cards.compare_desc", "Sammenlign to ID-er over tid.")}</p>
          </Link>
          <Link href="#articles" className="card quick-card">
            <h3>📰 {t(dict, "ui.home.cards.articles", "Artikler")}</h3>
            <p className="muted">{t(dict, "ui.home.cards.articles_desc", "Lær mer om søvn og vaner.")}</p>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
