// app/test/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SmileyLikert from "@/components/SmileyLikert";
import TimeSelect from "@/components/TimeSelect";
import SleepHoursSlider from "@/components/SleepHoursSlider";
import ThumbLikert from "@/components/ThumbLikert";

import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import { AnswerMap, FieldMap, LikertValue, CategoryId, Question } from "@/lib/types";
import { useRouter } from "next/navigation";

/** Er dette spørsmålet besvart? */
function isAnswered(q: Question, answers: AnswerMap, fields: FieldMap) {
  if (q.kind === "likert") return !!answers[q.id];
  const val = (fields as any)[q.field.key];
  return val !== undefined && val !== null && val !== "";
}

export default function TestPage() {
  const { dict } = useI18n();
  const router = useRouter();

  // Rekkefølge: slik spørsmålene står i QUESTION_BANK
  const ordered = useMemo(() => QUESTION_BANK.slice(), []);
  const total = ordered.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fields, setFields] = useState<FieldMap>({});
  const [loading, setLoading] = useState(false);

  const q = ordered[idx];
  const answeredCount = ordered.reduce((n, q) => n + (isAnswered(q, answers, fields) ? 1 : 0), 0);
  const progressPct = Math.round((answeredCount / total) * 100);

  function goNext() { setIdx((i) => Math.min(total - 1, i + 1)); }
  function goPrev() { setIdx((i) => Math.max(0, i - 1)); }

  function onLikert(v: LikertValue) {
    setAnswers((p) => ({ ...p, [q.id]: v }));
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
    }, 120);
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
      if (json?.id) {
        localStorage.setItem("lastResultId", json.id);
        router.push(`/result/${json.id}`); // Gå direkte til rapport
        return;
      }
      // fallback: bli på sida om ID mangler
      alert("Kunne ikke åpne rapport. Prøv igjen.");
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
                {/* Custom felter per key */}
                {q.field.subtype === "time" && (
                  <TimeSelect
                    value={(fields as any)[q.field.key] as string | undefined}
                    onChange={(val) => onFieldChange(val)}
                    label={t(dict, q.textKey, "")}
                  />
                )}

                {q.field.subtype === "number" && q.field.key === "sleepHours" && (
                  <SleepHoursSlider
                    value={(fields.sleepHours ?? 7) as number}
                    onChange={(val) => onFieldChange(val)}
                  />
                )}

                {q.field.subtype === "select" && q.field.key === "hypertensionDx" && (
                  <ThumbLikert
                    value={(fields.hypertensionDx as any) || "unknown"}
                    onChange={(val) => onFieldChange(val)}
                  />
                )}

                {/* Fallback (skulle ikke brukes nå) */}
                {q.field.subtype === "number" && q.field.key !== "sleepHours" && (
                  <input
                    className="btn"
                    type="number" step="0.5"
                    onChange={(e) => onFieldChange(Number(e.target.value))}
                  />
                )}
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
      </main>
      <SiteFooter />
    </>
  );
}
