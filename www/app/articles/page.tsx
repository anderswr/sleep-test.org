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
        <article className="panel head" style={{ padding: 24 }}>
          <h1 className="mb-2">
            {t(dict, "ui.articles.card.title", "Learn more")}
          </h1>
          <p className="muted">{t(dict, "ui.articles.card.text", "")}</p>
        </article>

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

        {items && (
          <section className="cards-row mt-6">
            {items.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="card article-card"
                aria-label={a.title}
              >
                <div className="media">
                  <img
                    src={`/images/${a.slug}.png`}
                    alt={a.title}
                    className="card-image"
                    loading="lazy"
                  />
                  <span className="media-gradient" aria-hidden />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{a.title}</h3>
                  {a.summary && <p className="card-summary">{a.summary}</p>}
                </div>
              </Link>
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

          /* Dedicated override so globals.css .card doesn't win */
          .article-card {
            display: block;
            padding: 0 !important;          /* kill global .card padding */
            border-radius: var(--radius);
            overflow: hidden;
            position: relative;
            text-decoration: none;
            color: inherit;
            transition: transform 120ms ease, box-shadow 200ms ease,
              border-color 200ms ease, filter 200ms ease;
            border: 1px solid var(--border);
          }
          .article-card:hover,
          .article-card:focus-visible {
            transform: translateY(-2px);
            box-shadow: 0 14px 28px rgba(0, 0, 0, 0.14);
            border-color: #d7dbe2;
          }
          .article-card:focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
          }

          /* Media area with image blend */
          .media {
            position: relative;
            overflow: hidden;
            isolation: isolate;
            background: #f8fafc;
          }
          .card-image {
            width: 100%;
            height: auto;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            display: block;
            transform: scale(1);
            filter: saturate(0.9) contrast(0.98);
            transition: transform 300ms ease, filter 300ms ease, opacity 300ms ease;
          }
          .media-gradient {
            position: absolute;
            inset: auto 0 0 0;
            height: 80px;
            content: "";
            display: block;
            /* soft blend into content */
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0) 0%,
              rgba(0, 0, 0, 0.04) 45%,
              rgba(0, 0, 0, 0.07) 100%
            );
            pointer-events: none;
            z-index: 1;
          }
          .article-card:hover .card-image,
          .article-card:focus-visible .card-image {
            transform: scale(1.025);
            filter: saturate(1) contrast(1);
          }

          /* Content spacing: tighter and no big bottom gap */
          .card-content {
            padding: 14px 14px 12px; /* smaller bottom padding */
          }
          .card-title {
            margin: 0 0 4px 0;
            line-height: 1.25;
            font-size: 1.05rem;
          }
          .card-summary {
            margin: 6px 0 0 0;
            color: var(--muted);
            font-size: 0.95rem;
          }
          /* Remove trailing margin from last child to avoid extra whitespace */
          .card-content :global(p:last-child) {
            margin-bottom: 0;
          }

          @media (prefers-reduced-motion: reduce) {
            .article-card,
            .card-image {
              transition: none;
            }
          }
        `}</style>
      </main>
      <SiteFooter />
    </div>
  );
}
