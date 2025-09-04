"use client";

import * as React from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

type ArticleListItem = {
  slug: string;
  title: string;
  excerpt?: string;
};

export default function ArticlesIndexPage() {
  const { dict, lang } = useI18n();

  const [items, setItems] = React.useState<ArticleListItem[] | null>(null);
  const [usedLang, setUsedLang] = React.useState(lang);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setError(null);
    setItems(null);

    async function fetchIndex(l: string) {
      const res = await fetch(`/articles/${l}/index.json`, { cache: "no-store" });
      if (!res.ok) return null;
      try {
        return (await res.json()) as ArticleListItem[];
      } catch {
        return null;
      }
    }

    (async () => {
      let data = await fetchIndex(lang);
      let actualLang = lang;

      if (!data) {
        data = await fetchIndex("en");
        actualLang = "en";
      }

      if (!alive) return;

      if (!data) {
        setError("No articles found.");
      } else {
        setUsedLang(actualLang);
        setItems(data);
      }
    })();

    return () => { alive = false; };
  }, [lang]);

  return (
    <>
      <SiteHeader />
      <main className="container">
        <h1 className="mb-2">{t(dict, "ui.articles.card.title", "Articles")}</h1>
        <p className="muted mb-4">{t(dict, "ui.articles.card.text", "Short articles about sleep, for everyone.")}</p>

        {error && (
          <div className="card">
            <p className="muted">{error}</p>
          </div>
        )}

        {!items && !error && (
          <div className="card">
            <p className="muted">Loading…</p>
          </div>
        )}

        {items && (
          <section
            className="grid-cards"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            {items.map((a) => (
              <article key={a.slug} className="card">
                <h3 style={{ marginBottom: 6 }}>{a.title}</h3>
                {a.excerpt && <p className="muted" style={{ marginBottom: 12 }}>{a.excerpt}</p>}
                <Link className="btn" href={`/articles/${a.slug}`}>
                  {t(dict, "ui.common.read", "Read")}
                </Link>
              </article>
            ))}
          </section>
        )}

        {items && usedLang !== lang && (
          <p className="muted" style={{ marginTop: 12 }}>
            (Showing English list – not yet available in your language)
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
