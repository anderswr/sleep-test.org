// app/compare/page.tsx
"use client";

import React, { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { bucketColor } from "@/lib/scoring";

type ResultDoc = {
  id: string;
  sleepScore: number;                // 0–100 (høyere = bedre)
  totalRaw: number;                  // 0–100 (høyere = verre)
  categoryScores: Record<string, number>;
  suggestedTips?: Record<string, string[]>;
};

export default function ComparePage() {
  const { dict } = useI18n();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [A, setAR] = useState<ResultDoc | null>(null);
  const [B, setBR] = useState<ResultDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    setAR(null);
    setBR(null);
    try {
      const [ra, rb] = await Promise.all([
        fetch(`/api/result/${a}`, { cache: "no-store" }),
        fetch(`/api/result/${b}`, { cache: "no-store" })
      ]);
      if (!ra.ok || !rb.ok) {
        setErr(t(dict, "ui.compare.notfound", "Finner ikke én eller begge ID-ene."));
        return;
      }
      const ja = await ra.json();
      const jb = await rb.json();
      setAR(ja);
      setBR(jb);
    } catch {
      setErr(t(dict, "ui.compare.error", "Noe gikk galt. Prøv igjen."));
    } finally {
      setLoading(false);
    }
  }

  // farge på søvn-ring: høy score = grønn -> inverter til bucketColor som antar "høy=verre"
  const ringColor = (sleepScore: number) => bucketColor(100 - Number(sleepScore));

  return (
    <>
      <SiteHeader />
      <main className="container">
        {/* Smal hero / intro */}
        <div className="content-narrow">
          <section className="card">
            <h1 className="mb-2">{t(dict, "ui.nav.compare", "Sammenlign")}</h1>
            <p className="muted" style={{ marginBottom: 12 }}>
              {t(
                dict,
                "ui.compare.help",
                "Har du ID-en din fra sist? Skriv inn begge for å se fremgang – og hvor."
              )}
            </p>

            <div
              className="row"
              style={{ gap: 8, alignItems: "stretch", flexWrap: "wrap" }}
            >
              <input
                className="btn"
                placeholder="ID A"
                aria-label="ID A"
                value={a}
                onChange={(e) => setA(e.target.value.trim())}
              />
              <input
                className="btn"
                placeholder="ID B"
                aria-label="ID B"
                value={b}
                onChange={(e) => setB(e.target.value.trim())}
              />
              <button
                className="btn primary"
                onClick={run}
                disabled={!a || !b || loading}
              >
                {loading
                  ? t(dict, "ui.common.sending", "Sender…")
                  : t(dict, "ui.nav.compare", "Sammenlign")}
              </button>
            </div>

            {err && (
              <p style={{ color: "var(--bad)", marginTop: 8 }}>{err}</p>
            )}
          </section>
        </div>

        {/* Når begge lastet: vis A og B side-ved-side */}
        {A && B && (
          <>
            {/* Hero-kort for A og B med sleepScore-ring */}
            <section
              className="grid-cards mt-6"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
            >
              {[A, B].map((R, i) => {
                const color = ringColor(R.sleepScore);
                return (
                  <article
                    key={i}
                    className="card score-hero"
                    style={{ alignItems: "center" }}
                  >
                    <div className="score-hero__left">
                      <h2 className="mb-2">{i === 0 ? "ID A" : "ID B"}</h2>
                      <code
                        className="px-1 py-0.5"
                        style={{ background: "#f3f4f6", borderRadius: 6 }}
                      >
                        {R.id}
                      </code>
                    </div>
                    <div className="score-hero__right">
                      <div className="score-ring" data-color={color}>
                        <div className="score-ring__value">
                          {Number(R.sleepScore)}
                        </div>
                        <div className="score-ring__label">
                          {t(dict, "ui.result.sleep_score", "Søvn-score")}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Hele A til venstre, hele B til høyre */}
            <section
              className="grid-cards mt-6"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              {/* Kolonne A */}
              <div className="stack-4">
                {Object.entries(A.categoryScores as Record<string, number>).map(
                  ([cat, val]) => {
                    const color = bucketColor(Number(val)); // her: høyere = verre
                    return (
                      <article key={`A-${cat}`} className="cat-card" data-color={color}>
                        <div className="cat-card__head">
                          <span className="pill" data-color={color}>
                            {t(dict, `category.${cat}.name`, String(cat))}
                          </span>
                          <strong className="cat-card__score">
                            {Number(val)}
                          </strong>
                        </div>
                        <p className="muted">
                          {t(dict, `category.${cat}.desc`, "")}
                        </p>

                        {(A.suggestedTips?.[cat] || []).length > 0 && (
                          <>
                            <h4 className="mb-2 mt-6">
                              {t(
                                dict,
                                "ui.result.how_to_improve",
                                "Hvordan forbedre dette:"
                              )}
                            </h4>
                            <ul className="tips-list">
                              {A.suggestedTips![cat].map((tipKey) => (
                                <li key={`A-${cat}-${tipKey}`}>
                                  <span className="star">*</span>{" "}
                                  {t(dict, tipKey, tipKey)}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </article>
                    );
                  }
                )}
              </div>

              {/* Kolonne B (med diff mot A) */}
              <div className="stack-4">
                {Object.entries(B.categoryScores as Record<string, number>).map(
                  ([cat, vb]) => {
                    const va = Number(A.categoryScores[cat]);
                    const diff = Number(vb) - va; // + = verre (rød), - = bedre (grønn)
                    const color = bucketColor(Number(vb));
                    const trend =
                      diff === 0 ? "•" : diff > 0 ? "▲" : "▼";
                    const trendColor =
                      diff === 0 ? "#6b7280" : diff > 0 ? "#b91c1c" : "#065f46";

                    return (
                      <article key={`B-${cat}`} className="cat-card" data-color={color}>
                        <div className="cat-card__head">
                          <span className="pill" data-color={color}>
                            {t(dict, `category.${cat}.name`, String(cat))}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{ color: trendColor, fontWeight: 600 }}
                              title={`Diff (B - A): ${diff > 0 ? "+" : ""}${diff}`}
                            >
                              {trend} {diff === 0 ? "0" : `${diff > 0 ? "+" : ""}${Math.abs(diff)}`}
                            </span>
                            <strong className="cat-card__score">
                              {Number(vb)}
                            </strong>
                          </div>
                        </div>
                        <p className="muted">
                          {t(dict, `category.${cat}.desc`, "")}
                        </p>

                        {(B.suggestedTips?.[cat] || []).length > 0 && (
                          <>
                            <h4 className="mb-2 mt-6">
                              {t(
                                dict,
                                "ui.result.how_to_improve",
                                "Hvordan forbedre dette:"
                              )}
                            </h4>
                            <ul className="tips-list">
                              {B.suggestedTips![cat].map((tipKey) => (
                                <li key={`B-${cat}-${tipKey}`}>
                                  <span className="star">*</span>{" "}
                                  {t(dict, tipKey, tipKey)}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
