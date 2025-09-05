// app/articles/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

type ArticleMeta = {
  slug: string;
  title: string;
  summary?: string;
  minutes?: number;
  tags?: string[];
};

export default function ArticlesPage() {
  const { dict, lang } = useI18n();
  const [items, setItems] = React.useState<ArticleMeta[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      setItems(null);

      const urlFor = (l: string) => `/articles/${l}/index.json`;

      // 1) forsøk valgt språk
      const r1 = await fetch(urlFor(lang), { cache: "no-store" });
      if (r1.ok) {
        const json = (await r1.json()) as ArticleMeta[];
        if (!cancelled) setItems(json);
        return;
      }

      // 2) fallback til engelsk
      const r2 = await fetch(urlFor("en"), { cache: "no-store" });
      if (r2.ok) {
        const json = (await r2.json()) as ArticleMeta[];
        if (!cancelled) setItems(json);
        return;
      }

      if (!cancelled) setError("Could not load articles.");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return (
    <>
      <SiteHeader />
      <main className="container">
        {/* Smal hero-seksjon med samme breddeopplevelse som Home/About */}
        <div className="content-narrow">
          <section className="card">
            <h1 className="mb-2">{t(dict, "ui.articles.card.title", "Learn more")}</h1>
            <p className="muted">{t(dict, "ui.articles.card.text", "")}</p>
          </section>
        </div>

        {!items && !error && (
          <section className="card mt-6">
            <p className="muted">Loading…</p>
          </section>
        )}

        {error && (
          <section className="card mt-6">
            <p className="muted">{error}</p>
          </section>
        )}

        {items && (
          <section className="grid-cards mt-6">
            {items.map((a) => (
              <article key={a.slug} className="cat-card">
                <div className="cat-card__head">
                  <span className="pill">{a.minutes ? `${a.minutes} min` : " "}</span>
                  {/* Tags til høyre hvis de finnes */}
                  <div className="row" style={{ gap: 6 }}>
                    {(a.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="pill" aria-label={`tag-${tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 style={{ marginTop: 0 }}>{a.title}</h3>
                {a.summary && (
                  <p className="muted" style={{ marginTop: 6 }}>
                    {a.summary}
                  </p>
                )}

                <div className="mt-6">
                  <Link href={`/articles/${a.slug}`} className="btn">
                    {t(dict, "ui.common.read", "Read")}
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
