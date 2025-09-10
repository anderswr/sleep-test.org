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
        {/* Head panel */}
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

        {/* Articles – 3 per row desktop */}
        {items && (
          <section className="cards-row mt-6">
            {items.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="card card-clickable"
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

          /* Clickable card */
          .card-clickable {
            display: block; /* ensures Link is a block element */
            padding: 0;
            text-decoration: none;
            color: inherit;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            transition: transform 120ms ease, box-shadow 200ms ease,
              border-color 200ms ease;
            cursor: pointer;
          }
          .card-clickable:hover,
          .card-clickable:focus-visible {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          }
          .card-clickable:focus-visible {
            outline: 2px solid rgba(0, 0, 0, 0.25);
            outline-offset: 2px;
          }

          /* Media area with subtle blend */
          .media {
            position: relative;
            overflow: hidden;
            isolation: isolate; /* keeps filters inside card */
          }
          .card-image {
            width: 100%;
            height: auto;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            display: block;
            filter: saturate(0.9) contrast(0.98);
            transform: scale(1); /* anchor for hover zoom */
            transition: transform 300ms ease, filter 300ms ease, opacity 300ms ease;
          }
          .media-gradient {
            position: absolute;
            inset: auto 0 0 0; /* bottom only */
            height: 70px;
            content: "";
            display: block;
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0) 0%,
              rgba(0, 0, 0, 0.04) 40%,
              rgba(0, 0, 0, 0.06) 100%
            );
            pointer-events: none;
            z-index: 1;
          }

          /* Hover interactions that actually trigger */
          .card-clickable:hover .card-image,
          .card-clickable:focus-visible .card-image {
            transform: scale(1.02);
            filter: saturate(1) contrast(1);
          }

          /* Content spacing: tighter */
          .card-content {
            padding: 14px 14px 12px; /* reduce bottom space */
          }
          .card-title {
            margin: 0 0 4px 0; /* tighter */
            line-height: 1.2;
          }
          .card-summary {
            margin: 6px 0 0 0; /* no extra bottom margin */
          }

          /* Respect reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .card-clickable {
              transition: none;
            }
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
