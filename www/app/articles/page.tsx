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

      const url = (l: string) => `/articles/${l}/index.json`;

      // try current language, fallback to EN
      const res1 = await fetch(url(lang), { cache: "no-store" });
      if (res1.ok) {
        const json = (await res1.json()) as ArticleMeta[];
        if (!cancelled) setItems(json);
        return;
      }
      const res2 = await fetch(url("en"), { cache: "no-store" });
      if (res2.ok) {
        const json = (await res2.json()) as ArticleMeta[];
        if (!cancelled) setItems(json);
        return;
      }
      if (!cancelled) setError("Could not load articles.");
    }

    load();
    return () => { cancelled = true; };
  }, [lang]);

return (
  <>
    <SiteHeader />
    <main className="container" style={{ flex: "1 1 auto" }}>
      {/* Top-boks – identisk med About */}
      <article className="card" style={{ padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>
          {t(dict, "ui.articles.card.title", "Learn more")}
        </h1>
        <p className="muted">{t(dict, "ui.articles.card.text", "")}</p>
      </article>

      {!items && !error && (
        <article className="card mt-6" style={{ padding: 24 }}>
          <p className="muted">Loading…</p>
        </article>
      )}

      {error && (
        <article className="card mt-6" style={{ padding: 24 }}>
          <p className="muted">{error}</p>
        </article>
      )}

      {items && (
        <section className="grid-cards mt-6">
          {items.map((a) => (
            <article key={a.slug} className="card" style={{ padding: 16 }}>
              <div className="cat-card__head">
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
  </>
);
}
