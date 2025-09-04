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

      // 1) Try current language
      const tryUrl = (l: string) => `/articles/${l}/index.json`;
      const res1 = await fetch(tryUrl(lang), { cache: "no-store" });
      if (res1.ok) {
        const json = (await res1.json()) as ArticleMeta[];
        if (!cancelled) setItems(json);
        return;
      }

      // 2) Fallback to English
      const res2 = await fetch(tryUrl("en"), { cache: "no-store" });
      if (res2.ok) {
        const json = (await res2.json()) as ArticleMeta[];
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
        <section className="card">
          <h1 className="mb-2">{t(dict, "ui.articles.card.title", "Learn more")}</h1>
          <p className="muted">{t(dict, "ui.articles.card.text", "")}</p>
        </section>

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
                  {/* optional tag pill on the right */}
                </div>
                <h3 style={{ marginTop: 0 }}>{a.title}</h3>
                {a.summary && <p className="muted" style={{ marginTop: 6 }}>{a.summary}</p>}
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
