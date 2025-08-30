"use client";
import React, { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { bucketColor } from "@/lib/scoring";

type ResultDoc = { id: string; sleepScore: number; totalRaw: number; categoryScores: Record<string, number>; suggestedTips?: Record<string, string[]>; };

export default function ComparePage() {
  const { dict } = useI18n();
  const [a, setA] = useState(""); const [b, setB] = useState("");
  const [A, setAR] = useState<ResultDoc | null>(null);
  const [B, setBR] = useState<ResultDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true); setErr(null); setAR(null); setBR(null);
    try {
      const [ra, rb] = await Promise.all([fetch(`/api/result/${a}`), fetch(`/api/result/${b}`)]);
      if (!ra.ok || !rb.ok) { setErr(t(dict,"ui.compare.notfound","Fant ikke en eller begge ID-ene.")); return; }
      setAR(await ra.json()); setBR(await rb.json());
    } catch { setErr(t(dict,"ui.compare.error","Noe gikk galt. Prøv igjen.")); }
    finally { setLoading(false); }
  }

  return (
    <>
      <SiteHeader />
      <main className="container">
        <section className="card">
          <h1 className="mb-2">{t(dict, "ui.nav.compare", "Sammenlign")}</h1>
          <p className="muted mb-4">{t(dict,"ui.compare.help","Har du ID-en din fra sist gang? Skriv den inn sammen med ny ID for å se om du har gjort fremskritt – og hvor.")}</p>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <input className="btn" placeholder="ID A" value={a} onChange={(e)=>setA(e.target.value.trim())} />
            <input className="btn" placeholder="ID B" value={b} onChange={(e)=>setB(e.target.value.trim())} />
            <button className="btn primary" onClick={run} disabled={!a || !b || loading}>
              {loading ? t(dict,"ui.common.sending","Sender…") : t(dict,"ui.nav.compare","Sammenlign")}
            </button>
          </div>
          {err && <p style={{ color:"var(--bad)", marginTop:8 }}>{err}</p>}
        </section>

        {(A && B) && (
          <section className="grid-cards mt-6" style={{ gridTemplateColumns:"1fr 1fr" }}>
            {/* venstre kolonne – A */}
            <div className="stack-4">
              <article className="card score-hero"><div className="score-hero__left"><h2>ID A</h2><code>{A.id}</code></div><div className="score-hero__right"><div className="score-ring"><div className="score-ring__value">{A.sleepScore}</div><div className="score-ring__label">{t(dict,"ui.result.sleep_score","Søvn-score")}</div></div></div></article>
              {Object.entries(A.categoryScores).map(([cat, val])=>{
                const color = bucketColor(Number(val));
                return (
                  <article key={`A-${cat}`} className="cat-card" data-color={color}>
                    <div className="cat-card__head"><span className="pill" data-color={color}>{t(dict,`category.${cat}.name`,String(cat))}</span><strong className="cat-card__score">{val as number}</strong></div>
                    <p className="muted">{t(dict,`category.${cat}.desc`,"")}</p>
                  </article>
                );
              })}
            </div>

            {/* høyre kolonne – B (viser diff til A) */}
            <div className="stack-4">
              <article className="card score-hero"><div className="score-hero__left"><h2>ID B</h2><code>{B.id}</code></div><div className="score-hero__right"><div className="score-ring"><div className="score-ring__value">{B.sleepScore}</div><div className="score-ring__label">{t(dict,"ui.result.sleep_score","Søvn-score")}</div></div></div></article>
              {Object.entries(B.categoryScores).map(([cat, vb])=>{
                const va = Number(A.categoryScores[cat]); const diff = Number(vb)-va;
                const color = bucketColor(Number(vb));
                const trend = diff === 0 ? "•" : diff > 0 ? "▲" : "▼";
                const trendColor = diff === 0 ? "#6b7280" : diff > 0 ? "#b91c1c" : "#065f46";
                return (
                  <article key={`B-${cat}`} className="cat-card" data-color={color}>
                    <div className="cat-card__head">
                      <span className="pill" data-color={color}>{t(dict,`category.${cat}.name`,String(cat))}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ color: trendColor, fontWeight:600 }} title={`Diff (B - A): ${diff}`}>{trend} {diff===0?"0":Math.abs(diff)}</span>
                        <strong className="cat-card__score">{vb as number}</strong>
                      </div>
                    </div>
                    <p className="muted">{t(dict,`category.${cat}.desc`,"")}</p>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
