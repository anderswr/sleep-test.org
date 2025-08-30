// app/test/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import { AnswerMap, FieldMap, LikertValue, CategoryId, ALL_CATEGORIES } from "@/lib/types";
import { LIKERT_LABEL_KEYS } from "@/lib/scoring";
import SmileyLikert from "@/components/SmileyLikert";

export default function TestPage() {
  const { lang, setLang, dict } = useI18n();

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fields, setFields] = useState<FieldMap>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState(0); // kategori-index

  const groups = useMemo(() => {
    const g: Record<CategoryId, typeof QUESTION_BANK> = {
      pattern: [], insomnia: [], quality: [], daytime: [], hygiene: [], environment: [], breathing: [],
    } as any;
    QUESTION_BANK.forEach((q) => g[q.category].push(q));
    return g;
  }, []);

  const allLikertIds = useMemo(
    () => QUESTION_BANK.filter(q => q.kind === "likert").map(q => q.id),
    []
  );
  const answeredCount = useMemo(
    () => allLikertIds.reduce((acc, id) => acc + (answers[id] ? 1 : 0), 0),
    [answers, allLikertIds]
  );
  const progressPct = Math.round((answeredCount / allLikertIds.length) * 100);

  const handleLikert = (id: string, v: LikertValue) => setAnswers((p) => ({ ...p, [id]: v }));
  const handleField  = (key: keyof FieldMap, v: any)  => setFields((p) => ({ ...p, [key]: v }));

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, fields, lang }),
      });
      const json = await res.json();
      setResult(json);
      // Husk siste ID for enkel sammenligning senere
      localStorage.setItem("lastResultId", json.id);
    } finally {
      setLoading(false);
    }
  }

  const currentCat = ALL_CATEGORIES[step];
  const items = groups[currentCat];

  return (
    <>
      <div className="topbar">
        <div className="nav">
          <a href="/" className="active">DMZ Sleep</a>
          <a href="/result/placeholder">{t(dict, "ui.nav.result", "Resultat")}</a>
          <a href="/compare">{t(dict, "ui.nav.compare", "Sammenlign")}</a>
          <a href="#articles">{t(dict, "ui.nav.articles", "Artikler")}</a>
        </div>
        <div className="row">
          <label className="sr-only" htmlFor="lang">{t(dict, "ui.home.language_label", "Language")}</label>
          <select id="lang" value={lang} onChange={(e) => setLang(e.target.value as any)} className="btn">
            <option value="nb">Norsk</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <main className="container">
        {/* Fremdrift */}
        <div className="row mb-2" aria-live="polite">
          <div style={{minWidth:80}}>{String(progressPct).padStart(2,"0")}%</div>
          <div className="progress" aria-label={t(dict, "ui.test.progress", "Fremdrift")}>
            <div style={{width: `${progressPct}%`}} />
          </div>
        </div>

        <h1 className="mb-2">{t(dict, `category.${currentCat}.name`, "")}</h1>
        <p className="mb-6" style={{color:"var(--muted)"}}>{t(dict, `category.${currentCat}.desc`, "")}</p>

        <form className="stack-4" onSubmit={onSubmit}>
          {/* Render kort for alle spørsmål i denne kategorien */}
          {items.map((q) => (
            <div key={q.id} className="card">
              {q.kind === "likert" ? (
                <>
                  <h3 id={`${q.id}-legend`}>{t(dict, q.textKey, "")}</h3>
                  <SmileyLikert
                    name={q.id}
                    value={answers[q.id]}
                    onChange={(v) => handleLikert(q.id, v)}
                    dict={dict}
                  />
                </>
              ) : (
                <>
                  <h3>{t(dict, q.textKey, "")}</h3>
                  <div className="stack-2">
                    {q.field.subtype === "time" && (
                      <input
                        className="btn"
                        type="time"
                        onChange={(e) => handleField(q.field.key as keyof FieldMap, e.target.value)}
                      />
                    )}
                    {q.field.subtype === "number" && (
                      <input
                        className="btn"
                        type="number"
                        step="0.1"
                        onChange={(e) => handleField(q.field.key as keyof FieldMap, Number(e.target.value))}
                      />
                    )}
                    {q.field.subtype === "select" && (
                      <select
                        className="btn"
                        onChange={(e) => handleField(q.field.key as keyof FieldMap, e.target.value as any)}
                      >
                        {Object.entries(
                          (t<Record<string, string>>(dict, q.field.optionsKey!, {}))
                        ).map(([v, label]) => (
                          <option key={v} value={v}>{label}</option>
                        ))}
                      </select>
                    )}
                    <p className="muted">{t(dict, q.infoKey || "", "")}</p>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Sticky navigasjon nederst */}
          <div className="sticky-controls">
            <button
              type="button"
              className="btn"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
            >
              {t(dict, "ui.common.back", "Tilbake")}
            </button>

            {step < ALL_CATEGORIES.length - 1 ? (
              <button
                type="button"
                className="btn primary"
                onClick={() => setStep((s) => Math.min(ALL_CATEGORIES.length - 1, s + 1))}
                disabled={loading}
              >
                {t(dict, "ui.common.next", "Neste")}
              </button>
            ) : (
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? t(dict, "ui.common.sending", "Sender…") : t(dict, "ui.test.submit", "Send inn")}
              </button>
            )}
          </div>
        </form>

        {/* Resultat (enkelt) */}
        {result && (
          <div className="card mt-6">
            <h3>{t(dict, "ui.result.title", "Resultat")}</h3>
            <p><strong>{t(dict, "ui.result.sleep_score", "Søvn-score")}:</strong> {Number(result.sleepScore)} / 100</p>
            <ul className="stack-2">
              {(Object.entries((result.categoryScores || {}) as Record<string, number>) as Array<[string, number]>).map(([k,v]) => (
                <li key={k}>• {t(dict, `category.${k}.name`, String(k))}: {Number(v)}</li>
              ))}
            </ul>
            {result.flags?.osaSignal && (<p style={{color:"var(--bad)"}} className="mt-6">{t(dict, "flags.osa_signal")}</p>)}
            {result.flags?.excessiveSleepiness && (<p style={{color:"#f59e0b"}}>{t(dict, "flags.excessive_sleepiness")}</p>)}
          </div>
        )}
      </main>
    </>
  );
}
