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

      // 1) Prøv valgt språk
      try {
        const res1 = await fetch(urlFor(lang), { cache: "no-store" });
        if (res1.ok) {
          const json = (await res1.json()) as ArticleMeta[];
          if (!cancelled) setItems(json);
          return;
        }
      } catch {
        /* fallthrough */
      }

      // 2) Fallback til engelsk
      try {
        const res2 = await fetch(urlFor("en"), { cache: "no-store" });
        if (res2.ok) {
          const json = (await res2.json()) as ArticleMeta[];
          if (!cancelled) setItems(json);
          return;
        }
      } catch {
        /* fallthrough */
      }

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
        {/* Toppkort – samme breddeopplevelse som About/Home */}
        <article className="card" style={{ padding: 24 }}>
          <h1 className="mb-2">{t(dict, "ui.articles.card.title", "Learn more")}</h1>
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

        {/* Artikler */}
        {items && (
          <section className="cards-grid mt-6">
            {items.map((a) => (
              <article key={a.slug} className="card" style={{ padding: 16 }}>
                <div
                  className="cat-card__head"
                  style={{ alignItems: "center", marginBottom: 6 }}
                >
                  <span className="pill">{a.minutes ? `${a.minutes} min` : " "}</span>
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
    </div>
  );
}
