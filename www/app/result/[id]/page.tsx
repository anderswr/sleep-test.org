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
  sleepScore: number;                          // 0–100 (høyere = bedre)
  totalRaw?: number;                           // 0–100 (høyere = verre) – kan mangle i eldre resultater
  categoryScores: Record<string, number>;      // 0–100 (høyere = verre)
  flags?: { osaSignal?: boolean; excessiveSleepiness?: boolean; highBpRisk?: boolean };
  suggestedTips?: Record<string, string[]>;
};

function decapitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// Slug pr. kategori -> artikkelside
const ARTICLE_SLUG: Record<CategoryId, string> = {
  [CategoryId.Pattern]: "pattern",
  [CategoryId.Insomnia]: "insomnia",
  [CategoryId.Quality]: "quality",
  [CategoryId.Daytime]: "daytime",
  [CategoryId.Hygiene]: "hygiene",
  [CategoryId.Environment]: "environment",
  [CategoryId.Breathing]: "breathing",
  [CategoryId.BloodPressure]: "bloodpressure",
};

export default function ResultPage({ params }: { params: { id: string } }) {
  const { dict, lang } = useI18n();
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
      <div className="app-shell">
        <SiteHeader />
        <main className="container" style={{ flex: "1 1 auto" }}>
          <article className="card" style={{ padding: 24 }}>
            <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>
            <p className="muted">Not found.</p>
          </article>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Farge til ringen: bruk totalRaw hvis den finnes, ellers 100 - sleepScore (eldre resultater)
  const ringColor =
    data
      ? bucketColor(
          typeof data.totalRaw === "number" ? data.totalRaw : Math.max(0, 100 - Number(data.sleepScore))
        ).replace("yellow", "orange")
      : "green";

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {!data ? (
          <article className="card" style={{ padding: 24 }}>
            <p className="muted">Loading…</p>
          </article>
        ) : (
          <>
            {/* TOPP: bred card – samme breddeopplevelse som About */}
            <article className="panel head score-hero" style={{ padding: 24 }}>
              <div className="score-hero__left">
                <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <code
                    className="px-1 py-0.5"
                    style={{ background: "#f3f4f6", borderRadius: 6 }}
                  >
                    {data.id}
                  </code>
                  <button
                    className="btn"
                    onClick={() => navigator.clipboard.writeText(data.id)}
                    title={t(dict, "ui.result.copy_id", "Kopier ID")}
                    aria-label={t(dict, "ui.result.copy_id", "Kopier ID")}
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
            </article>

            {/* Kategorier */}
            <section className="grid-cards mt-6">
              {entries.map(([cat, rawVal]) => {
                const raw = Number(rawVal);             // 0–100 (høyere = verre)
                const display = 100 - raw;              // visning 0–100 (høyere = bedre)
                const color = bucketColor(raw).replace("yellow", "orange") as "green" | "orange" | "red";
                const desc = t(dict, `category.${cat}.desc`, "");
                const lead = t(dict, `ui.result.lead.${color}`, "");
                const slug = ARTICLE_SLUG[cat];

                return (
                  <article key={cat} className="cat-card" data-color={color}>
                    <div className="cat-card__head">
                      <span className="pill" data-color={color}>
                        {t(dict, `category.${cat}.name`, String(cat))}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <strong className="cat-card__score">{display}</strong>
                        <span className="muted" style={{ fontSize: ".85rem" }}>
                          / 100
                        </span>
                      </div>
                    </div>

                    <p className="muted" style={{ marginTop: 6 }}>
                      <strong>{lead}</strong> {decapitalize(desc)}
                    </p>

                    {/* Les mer-link til artikkel */}
                    {slug && (
                      <div style={{ marginTop: 8 }}>
                        <a
                          href={`/articles/${slug}`}
                          className="muted"
                          style={{ fontSize: ".9rem", textDecoration: "underline", textUnderlineOffset: 2 }}
                          aria-label={t(dict, "ui.common.read", "Read")}
                        >
                          {t(dict, "ui.common.read", "Read more")} →
                        </a>
                      </div>
                    )}

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

            {/* Varsler */}
            {(data.flags?.osaSignal || data.flags?.excessiveSleepiness || data.flags?.highBpRisk) && (
              <section className="card mt-6" style={{ padding: 24 }}>
                <h2 className="mb-2">⚠️</h2>
                {data.flags?.osaSignal && (
                  <p style={{ color: "var(--bad)" }}>{t(dict, "flags.osa_signal")}</p>
                )}
                {data.flags?.excessiveSleepiness && (
                  <p style={{ color: "#f59e0b" }}>{t(dict, "flags.excessive_sleepiness")}</p>
                )}
                {data.flags?.highBpRisk && (
                  <p style={{ color: "#b45309" /* amber-600, rolig tone */ }}>
                    {t(
                      dict,
                      "flags.high_bp_risk",
                      "Flere livsstilsfaktorer peker mot økt blodtrykksrisiko. Vurder å måle blodtrykket ved anledning, særlig hvis du har type 2-diabetes eller nær familie med hjerte-/karsykdom."
                    )}
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
