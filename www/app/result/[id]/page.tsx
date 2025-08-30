// app/result/[id]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { bucketColor } from "@/lib/scoring";
import { CategoryId } from "@/lib/types";

type ResultDoc = {
  id: string;
  sleepScore: number;
  totalRaw: number;
  categoryScores: Record<string, number>;
  flags?: { osaSignal?: boolean; excessiveSleepiness?: boolean };
  suggestedTips?: Record<string, string[]>;
};

export default function ResultPage({ params }: { params: { id: string } }) {
  const { dict } = useI18n();
  const [data, setData] = useState<ResultDoc | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/result/${params.id}`, { cache: "no-store" });
        if (!res.ok) { setNotFound(true); return; }
        const json = await res.json();
        setData(json);
      } catch {
        setNotFound(true);
      }
    })();
  }, [params.id]);

  const entries = useMemo(
    () => Object.entries((data?.categoryScores || {}) as Record<string, number>) as Array<[CategoryId, number]>,
    [data]
  );

  if (notFound) {
    return (
      <>
        <SiteHeader />
        <main className="container">
          <div className="card">
            <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>
            <p className="muted">Not found.</p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container">
        {!data ? (
          <div className="card"><p className="muted">Loading…</p></div>
        ) : (
          <>
            {/* Hero */}
            <section className="card score-hero">
              <div className="score-hero__left">
                <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>
                <div className="row" style={{gap:8, alignItems:"center"}}>
                  <code className="px-1 py-0.5" style={{background:"#f3f4f6", borderRadius:6}}>
                    {data.id}
                  </code>
                  <button
                    className="btn"
                    onClick={() => navigator.clipboard.writeText(data.id)}
                    title={t(dict, "ui.result.copy_id", "Kopier ID")}
                  >
                    {t(dict, "ui.result.copy_id", "Kopier ID")}
                  </button>
                </div>
              </div>
              <div className="score-hero__right">
                <div className="score-ring" aria-label={t(dict, "ui.result.sleep_score", "Søvn-score")}>
                  <div className="score-ring__value">{Number(data.sleepScore)}</div>
                  <div className="score-ring__label">{t(dict, "ui.result.sleep_score", "Søvn-score")}</div>
                </div>
              </div>
            </section>

            {/* Kategorier */}
            <section className="grid-cards mt-6">
              {entries.map(([cat, val]) => {
                const color = bucketColor(Number(val));
                return (
                  <article key={cat} className="cat-card" data-color={color}>
                    <div className="cat-card__head">
                      <span className="pill" data-color={color}>
                        {t(dict, `category.${cat}.name`, String(cat))}
                      </span>
                      <strong className="cat-card__score">{Number(val)}</strong>
                    </div>
                    <p className="muted">{t(dict, `category.${cat}.desc`, "")}</p>

                    {/* Tips */}
                    {(data.suggestedTips?.[cat] || []).length > 0 && (
                      <>
                        <h4 className="mb-2 mt-6">{t(dict, "ui.result.how_to_improve", "Hvordan forbedre dette:")}</h4>
                        <ul className="tips-list">
                          {(data.suggestedTips?.[cat] || []).map((tipKey) => (
                            <li key={`${cat}-${tipKey}`}>
                              <span className="star">*</span> {t(dict, tipKey, tipKey)}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </article>
                );
              })}
            </section>

            {/* Varsler */}
            {(data.flags?.osaSignal || data.flags?.excessiveSleepiness) && (
              <section className="card mt-6">
                <h2 className="mb-2">⚠️</h2>
                {data.flags?.osaSignal && (
                  <p style={{color:"var(--bad)"}}>{t(dict, "flags.osa_signal")}</p>
                )}
                {data.flags?.excessiveSleepiness && (
                  <p style={{color:"#f59e0b"}}>{t(dict, "flags.excessive_sleepiness")}</p>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
