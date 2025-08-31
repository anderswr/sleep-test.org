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
      <main className="container">
        {/* Hero */}
        <section className="card" style={{ padding: 24 }}>
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>{t(dict, "ui.home.title", "Sleep Test")}</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            {t(dict, "ui.home.pitch")}
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href="/test" className="btn primary">{t(dict, "ui.home.cta", "Start test")}</Link>
            <Link href="/result/example" className="btn" style={{ marginLeft: 8 }}>
              {t(dict, "ui.home.example", "See sample report")}
            </Link>
          </div>
        </section>

        {/* Tre infokort */}
        <section className="stack-4" style={{ marginTop: 16 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t(dict, "ui.home.box_privacy.title")}</h3>
            <p className="muted">{t(dict, "ui.home.box_privacy.text")}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t(dict, "ui.home.box_compare.title")}</h3>
            <p className="muted">{t(dict, "ui.home.box_compare.text")}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t(dict, "ui.home.box_articles.title")}</h3>
            <p className="muted">{t(dict, "ui.home.box_articles.text")}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
