// app/compare/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { bucketColor } from "@/lib/scoring";

type ResultDoc = {
  id: string;
  sleepScore: number;                          // 0–100 (høyere er bedre)
  totalRaw?: number;                           // 0–100 (høyere er verre) – kan mangle i eldre resultater
  categoryScores: Record<string, number>;      // rå 0–100 (lavere er bedre)
  suggestedTips?: Record<string, string[]>;
};

function ringColorFrom(doc: ResultDoc): "green" | "orange" | "red" {
  const raw = typeof doc.totalRaw === "number" ? doc.totalRaw : Math.max(0, 100 - Number(doc.sleepScore));
  return bucketColor(raw).replace("yellow", "orange") as any;
}

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
        fetch(`/api/result/${b}`, { cache: "no-store" }),
      ]);
      if (!ra.ok || !rb.ok) {
        setErr(t(dict, "ui.compare.notfound", "Finner ikke én eller begge ID-ene."));
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

  // Union av kategorinøkler slik at begge sider får samme rekkefølge/rader
  const cats: string[] = useMemo(() => {
    if (!A && !B) return [];
    const keys = new Set<string>([
      ...Object.keys(A?.categoryScores || {}),
      ...Object.keys(B?.categoryScores || {}),
    ]);
    return Array.from(keys);
  }, [A, B]);

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {/* OVERSKRIFTSBOKS */}
        <article className="panel head" style={{ padding: 24 }}>
          <h1 className="mb-2">{t(dict, "ui.nav.compare", "Compare")}</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            {t(
              dict,
              "ui.compare.explainer",
              "Compare two reports to see if your actions work. Retest every 4–8 weeks to clearly see the trend."
            )}
          </p>

          <div className="row" style={{ gap: 8, alignItems: "stretch", flexWrap: "wrap", marginTop: 12 }}>
            <input
              className="btn"
              style={{ flex: 1, textAlign: "left" }}
              placeholder={t(dict, "ui.compare.id_a", "ID A")}
              value={a}
              onChange={(e) => setA(e.target.value.trim())}
              aria-label={t(dict, "ui.compare.id_a", "ID A")}
            />
            <input
              className="btn"
              style={{ flex: 1, textAlign: "left" }}
              placeholder={t(dict, "ui.compare.id_b", "ID B")}
              value={b}
              onChange={(e) => setB(e.target.value.trim())}
              aria-label={t(dict, "ui.compare.id_b", "ID B")}
            />
            <button className="btn primary" onClick={run} disabled={!a || !b || loading}>
              {loading ? t(dict, "ui.common.sending", "Sender…") : t(dict, "ui.nav.compare", "Compare")}
            </button>
          </div>
          {err && <p style={{ color: "var(--bad)", marginTop: 8 }}>{err}</p>}
        </article>

        {/* SAMMENLIGNING – 2 kolonner: A venstre, B høyre */}
        {A && B && (
          <>
            {/* HERO-RAD (like høye kort) */}
            <section className="cmp-grid mt-6">
              {[A, B].map((R, i) => {
                const ringColor = ringColorFrom(R);
                const isA = i === 0;
                return (
                  <article key={i} className="card cmp-cell" style={{ padding: 24 }}>
                    <div className="score-hero" style={{ gap: 16 }}>
                      <div className="score-hero__left">
                        <h2 className="mb-2" style={{ margin: 0 }}>
                          {isA
                            ? t(dict, "ui.compare.label_a", "ID A")
                            : t(dict, "ui.compare.label_b", "ID B")}
                        </h2>
                        <code className="code-badge">{R.id}</code>
                      </div>
                      <div className="score-hero__right">
                        <div
                          className="score-ring"
                          data-color={ringColor}
                          title={t(dict, "ui.result.sleep_score", "Sleep score")}
                          aria-label={t(dict, "ui.result.sleep_score", "Sleep score")}
                        >
                          <div className="score-ring__value">{Number(R.sleepScore)}</div>
                          <div className="score-ring__label">
                            {t(dict, "ui.result.sleep_score", "Sleep score")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* KATEGORI-RADER: hver rad er 2 like høye celler */}
            <section className="cmp-rows mt-6">
              {cats.map((cat) => {
                const aRaw = Number(A.categoryScores?.[cat] ?? NaN);
                const bRaw = Number(B.categoryScores?.[cat] ?? NaN);

                // raw = 0–100 (lavere er bedre); visning = 100 - raw
                const aDisplay = isFinite(aRaw) ? 100 - aRaw : null;
                const bDisplay = isFinite(bRaw) ? 100 - bRaw : null;

                const aColor = isFinite(aRaw)
                  ? (bucketColor(aRaw).replace("yellow", "orange") as "green" | "orange" | "red")
                  : "green";
                const bColor = isFinite(bRaw)
                  ? (bucketColor(bRaw).replace("yellow", "orange") as "green" | "orange" | "red")
                  : "green";

                const diff = isFinite(aRaw) && isFinite(bRaw) ? bRaw - aRaw : 0; // + = verre, - = bedre
                const trend = diff === 0 ? "•" : diff > 0 ? "▲" : "▼";
                const trendColor = diff === 0 ? "var(--muted)" : diff > 0 ? "#f59e0b" : "#34d399";

                return (
                  <div key={cat} className="cmp-grid">
                    {/* A */}
                    <article className="cat-card cmp-cell" data-color={aColor}>
                      <div className="cat-card__head">
                        <span className="pill" data-color={aColor}>
                          {t(dict, `category.${cat}.name`, String(cat))}
                        </span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                          <strong className="cat-card__score">
                            {aDisplay == null ? "—" : aDisplay}
                          </strong>
                          <span className="muted" style={{ fontSize: ".85rem" }}>/ 100</span>
                        </div>
                      </div>
                      <p className="muted">{t(dict, `category.${cat}.desc`, "")}</p>
                    </article>

                    {/* B + diff vs A */}
                    <article className="cat-card cmp-cell" data-color={bColor}>
                      <div className="cat-card__head">
                        <span className="pill" data-color={bColor}>
                          {t(dict, `category.${cat}.name`, String(cat))}
                        </span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                          <span style={{ color: trendColor, fontWeight: 600 }} title={`Δ (B - A): ${diff}`}>
                            {trend} {diff === 0 ? "0" : Math.abs(diff)}
                          </span>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                            <strong className="cat-card__score">
                              {bDisplay == null ? "—" : bDisplay}
                            </strong>
                            <span className="muted" style={{ fontSize: ".85rem" }}>/ 100</span>
                          </div>
                        </div>
                      </div>
                      <p className="muted">{t(dict, `category.${cat}.desc`, "")}</p>
                    </article>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>
      <SiteFooter />

      <style jsx>{`
        /* 2-kol grid med like høye celler */
        .cmp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: stretch;
        }
        .cmp-cell {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Liten “code-chip” for ID */
        .code-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 8px;
          background: var(--prose-code-bg, #f3f4f6);
          border: 1px solid var(--border);
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
        }

        @media (max-width: 900px) {
          .cmp-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
