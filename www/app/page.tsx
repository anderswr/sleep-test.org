"use client";

import Link from "next/link";
import { useI18n } from "./providers/I18nProvider";
import { t } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  const { dict } = useI18n();

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {/* Hero */}
        <section className="card" style={{ padding: 24 }}>
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>{t(dict, "ui.home.title", "Sleep Test-fallback")}</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            {t(dict, "ui.home.pitch")}
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href="/test" className="btn primary">{t(dict, "ui.home.cta", "Start test-fallback")}</Link>
            <Link href="/result/example" className="btn" style={{ marginLeft: 8 }}>
              {t(dict, "ui.home.example", "See sample report-fallback")}
            </Link>
          </div>
        </section>

        {/* Three info cards in one row */}
        <section className="cards-row">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t(dict, "ui.privacy.card.title")}</h3>
            <p className="muted">{t(dict, "ui.privacy.card.text")}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t(dict, "ui.compare.card.title")}</h3>
            <p className="muted">{t(dict, "ui.compare.card.text")}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t(dict, "ui.articles.card.title")}</h3>
            <p className="muted">{t(dict, "ui.articles.card.text")}</p>
          </div>
        </section>

        <style jsx>{`
          .cards-row {
            margin-top: 16px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          @media (max-width: 980px) {
            .cards-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
      <SiteFooter />
    </>
  );
}
