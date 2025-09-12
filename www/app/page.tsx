// app/page.tsx
"use client";

import Link from "next/link";
import * as React from "react";
import { useI18n } from "./providers/I18nProvider";
import { t } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  const { dict } = useI18n();

  // Teller-state
  const [targetCount, setTargetCount] = React.useState<number | null>(null);
  const [displayCount, setDisplayCount] = React.useState<number>(0);

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
              "Answer 30 questions in 5–10 minutes — get a free, practical sleep report."
            )}
          </p>
          <div
            style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}
            aria-label="Sleep test call to action"
          >
            <Link href="/test" className="btn primary">
              {t(dict, "ui.home.cta", "Start the test")}
            </Link>
            <Link href="/result/WYvIBTnpKTs" className="btn">
              {t(dict, "ui.home.example", "See sample report")}
            </Link>
          </div>
        </header>

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
    </>
  );
}
