"use client";

import Link from "next/link";
import * as React from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

type ArticleItem = {
  slug: string;
  title: string;
  summary: string;
};

export default function ArticlesPage() {
  const { dict, lang } = useI18n();
  const [items, setItems] = React.useState<ArticleItem[] | null>(null);
  const [loadedLang, setLoadedLang] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      async function fetchIndex(l: string) {
        const res = await fetch(`/articles/${l}/index.json`, { cache: "no-store" });
        if (!res.ok) throw new Error("no index");
        return (await res.json()) as ArticleItem[];
      }

      try {
        const data = await fetchIndex(lang);
        if (!cancelled) { setItems(data); setLoadedLang(lang); }
      } catch {
        // fallback til engelsk
        try {
          const data = await fetchIndex("en");
          if (!cancelled) { setItems(data); setLoadedLang("en"); }
        } catch {
          if (!cancelled) setItems([]);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [lang]);

  return (
    <>
      <main className="container">
        <div className="card">
          <h1 className="mb-2">{t(dict, "ui.articles.card.title", "Lær mer")}</h1>
          <p className="muted">{t(dict, "ui.articles.card.text", "Korte artikler om søvn – skrevet for folk flest.")}</p>
        </div>

        {!items ? (
          <div className="card"><p className="muted">Loading…</p></div>
        ) : (
          <section className="grid-cards mt-6">
            {items.map(a => (
              <article key={a.slug} className="cat-card">
                <h3 style={{marginTop:0}}>{a.title}</h3>
                <p className="muted" style={{marginBottom:12}}>{a.summary}</p>
                <Link className="btn primary" href={`/articles/${a.slug}`}>
                  {t(dict, "ui.common.read", "Les")}
                </Link>
              </article>
            ))}
          </section>
        )}

        {items && loadedLang !== lang && (
          <p className="muted mt-6">
            (Denne listen vises på engelsk fordi vi ikke fant artikler på valgt språk.)
          </p>
        )}
      </main>
    </>
  );
}
