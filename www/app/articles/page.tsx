"use client";

import * as React from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

type ArticleMeta = { slug: string; title: string; summary?: string };

export default function ArticlesPage() {
  const { dict, lang } = useI18n();
  const [items, setItems] = React.useState<ArticleMeta[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/articles/${lang}/index.json`, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : []))
      .then((list: ArticleMeta[]) => { if (alive) setItems(list || []); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [lang]);

  return (
    <>
      <SiteHeader />
      <main className="container">
        <section className="card">
          <h1 className="mb-2">{t(dict, "ui.articles.card.title", "Articles")}</h1>
          <p className="muted">{t(dict, "ui.articles.card.text", "")}</p>
        </section>

        {loading ? (
          <div className="card mt-6"><p className="muted">Loading…</p></div>
        ) : (
          <section className="grid-cards mt-6">
            {items.map(a => (
              <article key={a.slug} className="cat-card">
                <div className="cat-card__head">
                  <strong>{a.title}</strong>
                </div>
                {a.summary && <p className="muted">{a.summary}</p>}
                <Link href={`/articles/${a.slug}`} className="btn primary" style={{marginTop:8}}>
                  {t(dict, "ui.common.read", "Read")}
                </Link>
              </article>
            ))}
            {items.length === 0 && (
              <div className="card"><p className="muted">No articles yet.</p></div>
            )}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
