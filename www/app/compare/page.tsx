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
  sleepScore: number;                 // 0–100 (høyere er bedre)
  totalRaw: number;                   // kan mangle i eldre resultater
  categoryScores: Record<string, number>; // rå 0–100 (lavere er bedre)
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
        setErr(t(dict, "ui.compare.notfound", "Fant ikke en eller begge ID-ene."));
        return;
      }
      const ja = (await ra.json()) as ResultDoc;
      const jb = (await rb.json()) as ResultDoc;
      setAR(ja);
      setBR(jb);
    } catch {
      setErr(t(dict, "ui.compare.error", "Noe gikk galt. Prøv igjen."));
    } finally {
      setLoading(false);
    }
  }

  // Samme ringfargelogikk som Result-siden
  function ringColorFrom(doc: ResultDoc): "green" | "orange" | "red" {
    const raw = typeof doc.totalRaw === "number" ? doc.totalRaw : Math.max(0, 100 - Number(doc.sleepScore));
    return bucketColor(raw).replace("yellow", "orange") as any;
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {/* Toppkort – samme breddeopplevelse som About/Home */}
        <article className="panel head" style={{ padding: 24 }}>
          <h1 className="mb-2">{t(dict, "ui.nav.compare", "Sammenlign")}</h1>

          {/* NY forklaringstekst */}
          <p className="muted" style={{ marginTop: 6 }}>
            {t(
              dict,
              "ui.compare.explainer",
              "Sammenlign to rapporter for å se om tiltakene dine virker. Vi anbefaler å ta testen med 4–8 ukers mellomrom, så du ser tydelig retning over tid."
            )}
          </p>

          <div className="row" style={{ gap: 8, alignItems: "stretch", flexWrap: "wrap", marginTop: 12 }}>
            <input
              className="border rounded px-3 py-2"
              style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 12 }}
              placeholder={t(dict, "ui.compare.id_a", "ID A")}
              value={a}
              onChange={(e) => setA(e.target.value.trim())}
              aria-label={t(dict, "ui.compare.id_a", "ID A")}
            />
            <input
              className="border rounded px-3 py-2"
              style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 12 }}
              placeholder={t(dict, "ui.compare.id_b", "ID B")}
              value={b}
              onChange={(e) => setB(e.target.value.trim())}
              aria-label={t(dict, "ui.compare.id_b", "ID B")}
            />
            <button className="btn primary" onClick={run} disabled={!a || !b || loading}>
              {loading ? t(dict, "ui.common.sending", "Sender…") : t(dict, "ui.nav.compare", "Sammenlign")}
            </button>
          </div>
          {err && <p style={{ color: "var(--bad)", marginTop: 8 }}>{err}</p>}
        </article>

        {/* Resultatblokker */}
        {A && B && (
          <>
            {/* To “hero”-kort under hverandre */}
            <section className="stack-4 mt-6">
              {[A, B].map((R, i) => {
                const ringColor = ringColorFrom(R);
                return (
                  <article
                    key={i}
                    className="card score-hero"
                    style={{ padding: 24, alignItems: "center" }}
                  >
                    <div className="score-hero__left">
                      <h2 className="mb-2" style={{ margin: 0 }}>
                        {i === 0 ? t(dict, "ui.compare.label_a", "ID A") : t(dict, "ui.compare.label_b", "ID B")}
                      </h2>
                      <code
                        className="px-1 py-0.5"
                        style={{ background: "#f3f4f6", borderRadius: 6 }}
                      >
                        {R.id}
                      </code>
                    </div>
                    <div className="score-hero__right">
                      <div
                        className="score-ring"
                        data-color={ringColor}
                        title={t(dict, "ui.result.sleep_score", "Søvn-score")}
                      >
                        <div className="score-ring__value">{Number(R.sleepScore)}</div>
                        <div className="score-ring__label">
                          {t(dict, "ui.result.sleep_score", "Søvn-score")}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Kategorier – A sin liste, så B sin liste (med diff) */}
            <section className="stack-4 mt-6">
              {/* A-kort */}
              <div className="stack-4">
                {Object.entries(A.categoryScores as Record<string, number>).map(([cat, val]) => {
                  const color = bucketColor(Number(val)).replace("yellow", "orange");
                  return (
                    <article key={`A-${cat}`} className="cat-card" data-color={color}>
                      <div className="cat-card__head">
                        <span className="pill" data-color={color}>
                          {t(dict, `category.${cat}.name`, String(cat))}
                        </span>
                        <strong className="cat-card__score">{Number(val)}</strong>
                      </div>
                      <p className="muted">{t(dict, `category.${cat}.desc`, "")}</p>
                    </article>
                  );
                })}
              </div>

              {/* B-kort med diff vs A */}
              <div className="stack-4 mt-6">
                {Object.entries(B.categoryScores as Record<string, number>).map(([cat, vb]) => {
                  const va = Number(A.categoryScores[cat]);
                  const diff = Number(vb) - va; // + = verre, - = bedre
                  const color = bucketColor(Number(vb)).replace("yellow", "orange");
                  const trend = diff === 0 ? "•" : diff > 0 ? "▲" : "▼";
                  const trendColor = diff === 0 ? "#6b7280" : diff > 0 ? "#b91c1c" : "#065f46";
                  return (
                    <article key={`B-${cat}`} className="cat-card" data-color={color}>
                      <div className="cat-card__head">
                        <span className="pill" data-color={color}>
                          {t(dict, `category.${cat}.name`, String(cat))}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: trendColor, fontWeight: 600 }} title={`Diff (B - A): ${diff}`}>
                            {trend} {diff === 0 ? "0" : Math.abs(diff)}
                          </span>
                          <strong className="cat-card__score">{Number(vb)}</strong>
                        </div>
                      </div>
                      <p className="muted">{t(dict, `category.${cat}.desc`, "")}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
