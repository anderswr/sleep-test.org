// app/test/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SmileyLikert from "@/components/SmileyLikert";

import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import { AnswerMap, FieldMap, LikertValue, CategoryId, Question } from "@/lib/types";

/** Er dette spørsmålet besvart? */
function isAnswered(q: Question, answers: AnswerMap, fields: FieldMap) {
  if (q.kind === "likert") return !!answers[q.id];
  const val = (fields as any)[q.field.key];
  return val !== undefined && val !== null && val !== "";
}

export default function TestPage() {
  const { dict } = useI18n();

  // Rekkefølge: slik spørsmålene står i QUESTION_BANK
  const ordered = useMemo(() => QUESTION_BANK.slice(), []);
  const total = ordered.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fields, setFields] = useState<FieldMap>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const q = ordered[idx];
  const answeredCount = ordered.reduce((n, q) => n + (isAnswered(q, answers, fields) ? 1 : 0), 0);
  const progressPct = Math.round((answeredCount / total) * 100);

  function goNext() { setIdx((i) => Math.min(total - 1, i + 1)); }
  function goPrev() { setIdx((i) => Math.max(0, i - 1)); }

  function onLikert(v: LikertValue) {
    setAnswers((p) => ({ ...p, [q.id]: v }));
    // auto-avanser og fokus på neste
    setTimeout(() => {
      if (idx < total - 1) {
        goNext();
        const nextFirst = document.querySelector<HTMLButtonElement>('[role="radiogroup"] [role="radio"]');
        nextFirst?.focus();
      }
    }, 120);
  }

  function onFieldChange(val: any) {
    if (q.kind === "field") setFields((p) => ({ ...p, [q.field.key]: val }));
    setTimeout(() => {
      if (idx < total - 1) {
        goNext();
        const nextFirst = document.querySelector<HTMLButtonElement>('[role="radiogroup"] [role="radio"]');
        nextFirst?.focus();
      }
    }, 100);
  }

  async function onSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, fields, lang: "nb" })
      });
      const json = await res.json();
      setResult(json);
      if (json?.id) localStorage.setItem("lastResultId", json.id);
    } finally {
      setLoading(false);
    }
  }

  // Kategori-navn
  function catName(cat: CategoryId) { return t(dict, `category.${cat}.name`, String(cat)); }

  return (
    <>
      <SiteHeader />

      <main className="container stage">
        {/* Fremdrift */}
        <div className="stage-head">
          <div className="row mb-2" aria-live="polite">
            <div style={{minWidth:80}}>{String(progressPct).padStart(2,"0")}%</div>
            <div className="progress" aria-label={t(dict, "ui.test.progress", "Fremdrift")}>
              <div style={{ width: `${progressPct}%` }} />
            </div>
            <div style={{minWidth:72, textAlign:"right"}}>{idx+1}/{total}</div>
          </div>
        </div>

        {/* Spørsmål */}
        <div className="center-wrap">
          <article className="card q-card">
            <p className="muted" style={{margin:0}}>{catName(q.category)}</p>
            <h1 className="mb-2">{t(dict, q.textKey, "")}</h1>

            {q.kind === "likert" ? (
              <SmileyLikert
                name={q.id}
                value={answers[q.id]}
                onChange={onLikert}
                dict={dict}
              />
            ) : (
              <div className="stack-2">
                {q.field.subtype === "time" && (
                  <input className="btn" type="time" onChange={(e) => onFieldChange(e.target.value)} />
                )}
                {q.field.subtype === "number" && (
                  <input className="btn" type="number" step="0.1" onChange={(e) => onFieldChange(Number(e.target.value))} />
                )}
                {q.field.subtype === "select" && (
                  <select className="btn" onChange={(e) => onFieldChange(e.target.value)}>
                    {Object.entries(t<Record<string, string>>(dict, q.field.optionsKey!, {})).map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                )}
                {q.infoKey && <p className="muted">{t(dict, q.infoKey, "")}</p>}
              </div>
            )}
          </article>
        </div>

        {/* Navigasjon / Innsending */}
        <div className="stage-controls">
          <button className="btn" onClick={goPrev} disabled={idx === 0 || loading}>
            {t(dict, "ui.common.back", "Tilbake")}
          </button>

          {idx < total - 1 ? (
            <button
              className="btn primary"
              onClick={goNext}
              disabled={!isAnswered(q, answers, fields) || loading}
            >
              {t(dict, "ui.common.next", "Neste")}
            </button>
          ) : (
            <button className="btn primary" onClick={onSubmit} disabled={loading || answeredCount === 0}>
              {loading ? t(dict, "ui.common.sending", "Sender…") : t(dict, "ui.test.submit", "Send inn")}
            </button>
          )}
        </div>

        {/* Resultat */}
        {result && (
          <div className="card mt-6 q-card" role="region" aria-live="polite">
            <h3>{t(dict, "ui.result.title", "Resultat")}</h3>

            <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
              <p>
                <strong>{t(dict, "ui.result.sleep_score", "Søvn-score")}:</strong>{" "}
                {Number(result.sleepScore)} / 100
              </p>

              {result.id && (
                <div className="row" style={{gap:8}}>
                  <code className="px-1 py-0.5" style={{background:"#f3f4f6", borderRadius:6}}>
                    {result.id}
                  </code>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => navigator.clipboard.writeText(result.id)}
                    aria-label={t(dict, "ui.result.copy_id", "Kopier ID")}
                    title={t(dict, "ui.result.copy_id", "Kopier ID")}
                  >
                    {t(dict, "ui.result.copy_id", "Kopier ID")}
                  </button>
                  <a className="btn" href={`/result/${result.id}`}>
                    {t(dict, "ui.result.open_report", "Åpne rapport")}
                  </a>
                </div>
              )}
            </div>

            {/* Kategori-sammendrag */}
            <ul className="stack-2">
              {(Object.entries((result.categoryScores || {}) as Record<string, number>) as Array<[string, number]>).map(([k,v]) => (
                <li key={k}>• {t(dict, `category.${k}.name`, String(k))}: {Number(v)}</li>
              ))}
            </ul>

            {/* Tips per kategori */}
            {result.suggestedTips && (
              <div className="mt-6">
                <h4 className="mb-2">{t(dict, "ui.result.tips_title", "Forslag til tiltak")}</h4>
                <ul className="stack-2">
                  {Object.entries(result.suggestedTips as Record<string, string[]>).flatMap(([cat, tips]) =>
                    tips.map((tipKey) => (
                      <li key={`${cat}-${tipKey}`}>• {t(dict, tipKey, tipKey)}</li>
                    ))
                  )}
                </ul>
              </div>
            )}

            {/* Varsler */}
            {result.flags?.osaSignal && (
              <p style={{color:"var(--bad)"}} className="mt-6">
                {t(dict, "flags.osa_signal")}
              </p>
            )}
            {result.flags?.excessiveSleepiness && (
              <p style={{color:"#f59e0b"}}>
                {t(dict, "flags.excessive_sleepiness")}
              </p>
            )}
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
