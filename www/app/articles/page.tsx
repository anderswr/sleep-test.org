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

      try {
        const res1 = await fetch(urlFor(lang), { cache: "no-store" });
        if (res1.ok) {
          const json = (await res1.json()) as ArticleMeta[];
          if (!cancelled) setItems(json);
          return;
        }
      } catch {}

      try {
        const res2 = await fetch(urlFor("en"), { cache: "no-store" });
        if (res2.ok) {
          const json = (await res2.json()) as ArticleMeta[];
          if (!cancelled) setItems(json);
          return;
        }
      } catch {}

      if (!cancelled) setError("Could not load articles.");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {/* Bred toppboks */}
        <article className="panel head" style={{ padding: 24 }}>
          <h1 className="mb-2">
            {t(dict, "ui.articles.card.title", "Learn more")}
          </h1>
          <p className="muted">{t(dict, "ui.articles.card.text", "")}</p>
        </article>

        {/* States */}
        {!items && !error && (
          <section className="card mt-6" style={{ padding: 16 }}>
            <p className="muted">Loading…</p>
          </section>
        )}

        {error && (
          <section className="card mt-6" style={{ padding: 16 }}>
            <p className="muted">{error}</p>
          </section>
        )}

        {/* Artikler – 3 per rad */}
        {items && (
          <section className="cards-row mt-6">
            {items.map((a) => (
              <div key={a.slug} className="card" style={{ padding: 16 }}>
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
              </div>
            ))}
          </section>
        )}

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
    </div>
  );
}
