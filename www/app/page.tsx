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
        <section className="hero card">
          <h1>Sleep Test</h1>
          <p className="lead">
            {t(dict,"ui.home.pitch","Svar på 30 spørsmål, ca 5 minutter og få en grundig rapport med forklaringer og tiltak.")}
          </p>
          <div className="row" style={{ gap:12, flexWrap:"wrap" }}>
            <Link href="/test" className="btn primary lg">{t(dict,"ui.home.cta","Start testen")}</Link>
            <Link href="/result/demo" className="btn lg">{t(dict,"ui.home.example","Se eksempel på rapport")}</Link>
          </div>
        </section>

        <section className="grid-cards mt-6">
          <article className="card">
            <h3>{t(dict,"ui.home.box_privacy.title","Personvern først")}</h3>
            <p className="muted">{t(dict,"ui.home.box_privacy.text","Ingen pålogging, registrering eller mulighet for misbruk. GDPR-vennlig.")}</p>
          </article>
          <article className="card">
            <h3>{t(dict,"ui.home.box_compare.title","Sammenlign senere")}</h3>
            <p className="muted">{t(dict,"ui.home.box_compare.text","Du får en ID etter testen. Ta testen igjen og sammenlign endringer.")}</p>
            <Link href="/compare" className="btn">{t(dict,"ui.nav.compare","Sammenlign")}</Link>
          </article>
          <article className="card">
            <h3>{t(dict,"ui.home.box_articles.title","Lær mer")}</h3>
            <p className="muted">{t(dict,"ui.home.box_articles.text","Korte artikler om søvn, med kilder.")}</p>
            <Link href="/articles" className="btn">{t(dict,"ui.nav.articles","Artikler")}</Link>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
