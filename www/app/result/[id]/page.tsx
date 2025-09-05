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
  sleepScore: number;                    // 0–100 (høyere = bedre)
  totalRaw: number;                      // 0–100 (høyere = verre)
  categoryScores: Record<string, number>;
  flags?: { osaSignal?: boolean; excessiveSleepiness?: boolean };
  suggestedTips?: Record<string, string[]>;
};

function decapitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

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
    () =>
      Object.entries((data?.categoryScores || {}) as Record<string, number>) as Array<
        [CategoryId, number]
      >,
    [data]
  );

  if (notFound) {
    return (
      <>
        <SiteHeader />
        <main className="container">
          <div className="content-narrow">
            <div className="card">
              <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>
              <p className="muted">Not found.</p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // Farge på ringen: høy sleepScore (bra) -> grønn
  const ringColor =
    data ? bucketColor(100 - Number(data.sleepScore)).replace("yellow", "orange") : "green";

  return (
    <>
      <SiteHeader />
      <main className="container">
        {!data ? (
          <div className="content-narrow">
            <div className="card"><p className="muted">Loading…</p></div>
          </div>
        ) : (
          <>
            {/* Hero (smal bredde) */}
            <div className="content-narrow">
              <section className="card score-hero">
                <div className="score-hero__left">
                  <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>
                  <div className="row" style={{ gap: 8, alignItems: "center" }}>
                    <code className="px-1 py-0.5" style={{ background: "#f3f4f6", borderRadius: 6 }}>
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
                  <div
                    className="score-ring"
                    data-color={ringColor}
                    aria-label={t(dict, "ui.result.sleep_score", "Søvn-score")}
                    title={t(dict, "ui.result.sleep_score", "Søvn-score")}
                  >
                    <div className="score-ring__value">{Number(data.sleepScore)}</div>
                    <div className="score-ring__label">
                      {t(dict, "ui.result.sleep_score", "Søvn-score")}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Kategorier (full bredde grid) */}
            <section className="grid-cards mt-6">
              {entries.map(([cat, rawVal]) => {
                const raw = Number(rawVal);           // 0–100 (høyere = verre)
                const display = 100 - raw;            // vis "høyere = bedre"
                const color = bucketColor(raw).replace("yellow", "orange");
                const desc = t(dict, `category.${cat}.desc`, "");
                const lead = t(dict, `ui.result.lead.${color}`, "");

                return (
                  <article key={cat} className="cat-card" data-color={color}>
                    <div className="cat-card__head">
                      <span className="pill" data-color={color}>
                        {t(dict, `category.${cat}.name`, String(cat))}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <strong className="cat-card__score">{display}</strong>
                        <span className="muted" style={{ fontSize: ".85rem" }}>/ 100</span>
                      </div>
                    </div>

                    <p className="muted">
                      <strong>{lead}</strong> {decapitalize(desc)}
                    </p>

                    {(data.suggestedTips?.[cat] || []).length > 0 && (
                      <>
                        <h4 className="mb-2 mt-6">
                          {t(dict, "ui.result.how_to_improve", "Hvordan forbedre dette:")}
                        </h4>
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

            {/* Varsler (kan stå i full bredde) */}
            {(data.flags?.osaSignal || data.flags?.excessiveSleepiness) && (
              <section className="card mt-6">
                <h2 className="mb-2">⚠️</h2>
                {data.flags?.osaSignal && (
                  <p style={{ color: "var(--bad)" }}>{t(dict, "flags.osa_signal")}</p>
                )}
                {data.flags?.excessiveSleepiness && (
                  <p style={{ color: "#f59e0b" }}>{t(dict, "flags.excessive_sleepiness")}</p>
                )}
              </section>
            )}

            {/* Lokale ringfarger (dus grønn/oransje/rød) – kan evt. ligge i globals.css */}
            <style jsx>{`
              .score-ring[data-color="green"] { border-color: #86efac; background: #f0fdf4; }
              .score-ring[data-color="orange"] { border-color: #fdba74; background: #fff7ed; }
              .score-ring[data-color="red"] { border-color: #fecaca; background: #fef2f2; }
            `}</style>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
