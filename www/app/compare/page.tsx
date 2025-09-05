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
  sleepScore: number;
  totalRaw: number;
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
    setLoading(true); setErr(null); setAR(null); setBR(null);
    try {
      const [ra, rb] = await Promise.all([
        fetch(`/api/result/${a}`, { cache: "no-store" }),
        fetch(`/api/result/${b}`, { cache: "no-store" })
      ]);
      if (!ra.ok || !rb.ok) { setErr(t(dict,"ui.compare.notfound","Finner ikke én eller begge ID-ene.")); return; }
      const ja = await ra.json(); const jb = await rb.json();
      setAR(ja); setBR(jb);
    } catch { setErr(t(dict,"ui.compare.error","Noe gikk galt. Prøv igjen.")); }
    finally { setLoading(false); }
  }

return (
  <div className="app-shell">
    <SiteHeader />
    <main className="container" style={{ flex: "1 1 auto" }}>
      {/* Top-boks – identisk layout som About */}
      <article className="card" style={{ padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>{t(dict, "ui.nav.compare", "Sammenlign")}</h1>

        <div className="row" style={{ gap: 8, alignItems: "stretch", flexWrap: "wrap" }}>
          <input
            placeholder="ID A"
            value={a}
            onChange={(e) => setA(e.target.value.trim())}
            style={{
              flex: 1,
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "10px 12px",
            }}
          />
          <input
            placeholder="ID B"
            value={b}
            onChange={(e) => setB(e.target.value.trim())}
            style={{
              flex: 1,
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "10px 12px",
            }}
          />
          <button className="btn primary" onClick={run} disabled={!a || !b || loading}>
            {loading ? t(dict, "ui.common.sending", "Sender…") : t(dict, "ui.nav.compare", "Sammenlign")}
          </button>
        </div>

        {err && <p style={{ color: "var(--bad)", marginTop: 8 }}>{err}</p>}
      </article>

      {(A && B) && (
        <>
          {/* Hero – to cards side-om-side */}
          <section className="grid-cards mt-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[A, B].map((R, i) => (
              <article key={i} className="card score-hero" style={{ alignItems: "center" }}>
                <div className="score-hero__left">
                  <h2 className="mb-2" style={{ margin: 0 }}>{i === 0 ? "ID A" : "ID B"}</h2>
                  <code className="px-1 py-0.5" style={{ background: "#f3f4f6", borderRadius: 6 }}>
                    {R.id}
                  </code>
                </div>
                <div className="score-hero__right">
                  <div className="score-ring" title={t(dict, "ui.result.sleep_score", "Søvn-score")}>
                    <div className="score-ring__value">{Number(R.sleepScore)}</div>
                    <div className="score-ring__label">{t(dict, "ui.result.sleep_score", "Søvn-score")}</div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Kategorier – A til venstre, B med diff til høyre */}
          <section className="grid-cards mt-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Kolonne A */}
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

            {/* Kolonne B */}
            <div className="stack-4">
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
