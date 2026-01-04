// app/home/HomeClient.tsx
"use client";

import Link from "next/link";
import * as React from "react";
import { useI18n } from "../providers/I18nProvider";
import { t } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  const { dict, lang } = useI18n();

  const LANGS = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "nb", label: "Norsk", flag: "🇳🇴" },
    { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "sk", label: "Slovenčina", flag: "🇸🇰" },
    { code: "zh", label: "简体中文", flag: "🇨🇳" },
  ] as const;

  // Teller-state
  const [targetCount, setTargetCount] = React.useState<number | null>(null);
  const [displayCount, setDisplayCount] = React.useState<number>(0);
  const [articleItems, setArticleItems] = React.useState<
    { slug: string; title: string; summary?: string }[] | null
  >(null);
  const seoParagraphs = t(dict, "ui.home.seo_paragraphs", [] as string[]) as string[];

  // Hent antall fullførte tester
  React.useEffect(() => {
    let canceled = false;

    async function fetchCount(): Promise<number | null> {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) return null;
        const json = await res.json();
        return typeof json.total === "number"
          ? json.total
          : typeof json.count === "number"
          ? json.count
          : typeof json.totalTests === "number"
          ? json.totalTests
          : null;
      } catch {
        return null;
      }
    }

    fetchCount().then((n) => {
      if (!canceled && typeof n === "number") setTargetCount(n);
    });

    return () => {
      canceled = true;
    };
  }, []);

  // Myk opptelling 0 -> targetCount på ~0.8s
  React.useEffect(() => {
    if (targetCount == null) return;

    let start: number | null = null;
    const duration = 800; // ms
    const from = 0;
    const to = targetCount;

    const tick = (t: number) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.floor(from + (to - from) * eased);
      setDisplayCount(val);
      if (p < 1) requestAnimationFrame(tick);
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetCount]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      const urlFor = (l: string) => `/articles/${l}/index.json`;

      try {
        const res1 = await fetch(urlFor(lang), { cache: "no-store" });
        if (res1.ok) {
          const json = (await res1.json()) as {
            slug: string;
            title: string;
            summary?: string;
          }[];
          if (!cancelled) setArticleItems(json.slice(0, 3));
          return;
        }
      } catch {}

      try {
        const res2 = await fetch(urlFor("en"), { cache: "no-store" });
        if (res2.ok) {
          const json = (await res2.json()) as {
            slug: string;
            title: string;
            summary?: string;
          }[];
          if (!cancelled) setArticleItems(json.slice(0, 3));
          return;
        }
      } catch {}

      if (!cancelled) setArticleItems([]);
    }

    loadArticles();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {/* Hero */}
        <header className="panel head" style={{ padding: 24 }}>
          <h1 style={{ margin: 0, fontSize: "1.8rem" }}>
            {t(dict, "ui.home.title", "Sleep Test")}
          </h1>
          <p className="muted" style={{ marginTop: 6 }}>
            {t(
              dict,
              "ui.home.pitch",
              "Answer 37 questions in 5–10 minutes — get a free, practical sleep report."
            )}
          </p>
          <div
            style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
            aria-label="Sleep test call to action"
          >
            <Link href="/test" className="btn primary">
              {t(dict, "ui.home.cta", "Start the test")}
            </Link>
            <Link href="/result/powekmNVMeM" className="btn">
              {t(dict, "ui.home.example", "See sample report")}
            </Link>
          </div>
        </header>

        {seoParagraphs.length > 0 && (
          <section className="card seo-copy" aria-label="Sleep test details">
            {seoParagraphs.map((paragraph, index) => (
              <p key={index} className="muted">
                {paragraph}
              </p>
            ))}
          </section>
        )}

        {/* Tre informasjonskort */}
        <section className="cards-row" aria-label="Sleep test features">
          {/* Kort 1: Teller */}
          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>
              {t(dict, "ui.home.tests_count_title", "Completed sleep tests")}
            </h2>
            <div style={{ marginTop: 6 }}>
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "0.5px",
                }}
                aria-live="polite"
                aria-label="Total number of completed sleep tests"
              >
                {targetCount == null ? "…" : displayCount.toLocaleString()}
              </div>
              <p className="muted" style={{ marginTop: 6 }}>
                {t(
                  dict,
                  "ui.home.tests_count_caption",
                  "People have used this free, anonymous tool."
                )}
              </p>
            </div>
          </article>

          {/* Kort 2: Compare */}
          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>
              {t(dict, "ui.compare.card.title", "Compare")}
            </h2>
            <p className="muted">
              {t(
                dict,
                "ui.compare.card.text",
                "You get an ID after the test. Take it again later and compare what changed."
              )}
            </p>
            <Link href="/compare" className="btn" aria-label="Compare sleep test results">
              {t(dict, "ui.nav.compare", "Compare")}
            </Link>
          </article>

          {/* Kort 3: Articles */}
          <article className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>
              {t(dict, "ui.articles.card.title", "Learn more")}
            </h2>
            <p className="muted">
              {t(
                dict,
                "ui.articles.card.text",
                "Learn about sleep patterns, insomnia, sleep hygiene, environment and more."
              )}
            </p>
            <Link href="/articles" className="btn" aria-label="Read sleep articles and guides">
              {t(dict, "ui.nav.articles", "Articles")}
            </Link>
          </article>
        </section>

        <section className="card ad-card" aria-label="Language availability">
          <div className="ad-copy">
            <h2 style={{ marginTop: 0 }}>
              {t(dict, "ui.ad.card.title", "Free test in multiple languages")}
            </h2>
            <p className="muted" style={{ marginBottom: 16 }}>
              {t(
                dict,
                "ui.ad.card.text",
                "Translated into many languages, try for yourself and share on social media."
              )}
            </p>
          </div>
          <div className="ad-flags" aria-label="Available languages">
            {LANGS.map((l) => (
              <span key={l.code} className="ad-flag" title={l.label}>
                <span aria-hidden>{l.flag}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="article-preview" aria-label="Sleep articles preview">
          {articleItems == null && (
            <div className="card" style={{ padding: 16 }}>
              <p className="muted">Loading…</p>
            </div>
          )}
          {articleItems && articleItems.length > 0 && (
            <div className="cards-row articles-row">
              {articleItems.map((a) => (
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
            </div>
          )}
        </section>

        <style jsx>{`
          .cards-row {
            margin-top: 16px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .ad-card {
            margin-top: 24px;
            padding: 24px;
            display: grid;
            grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
            gap: 24px;
            align-items: center;
          }
          .seo-copy {
            margin-top: 20px;
            padding: 20px;
            display: grid;
            gap: 12px;
          }
          .ad-flags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: flex-start;
          }
          .ad-flag {
            font-size: 1.6rem;
            line-height: 1;
            padding: 6px 8px;
            border-radius: 12px;
            background: var(--card);
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
          }
          .article-preview {
            margin-top: 16px;
          }
          .articles-row {
            margin-top: 0;
          }

          .article-card {
            display: block;
            padding: 0 !important;
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

          .card-content {
            padding: 14px 14px 12px;
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
          .card-content :global(p:last-child) {
            margin-bottom: 0;
          }
          @media (max-width: 980px) {
            .cards-row {
              grid-template-columns: 1fr;
            }
            .ad-card {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </main>
      <SiteFooter />
    </>
  );
}
