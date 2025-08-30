// app/test/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SmileyLikert from "@/components/SmileyLikert";
import SleepRange from "@/components/SleepRange";
import SleepHoursBand from "@/components/SleepHoursBand";
import ThumbLikert from "@/components/ThumbLikert";

import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import { AnswerMap, FieldMap, LikertValue, CategoryId, Question } from "@/lib/types";
import { useRouter } from "next/navigation";

function isAnswered(q: Question, answers: AnswerMap, fields: FieldMap) {
  if (q.kind === "likert") return !!answers[q.id];
  if (q.id === "f1") return !!fields.bedtime && !!fields.waketime; // begge satt
  const val = (fields as any)[q.field.key];
  return val !== undefined && val !== null && val !== "";
}

export default function TestPage() {
  const { dict } = useI18n();
  const router = useRouter();

  const ordered = useMemo(() => QUESTION_BANK.slice(), []);
  const total = ordered.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fields, setFields] = useState<FieldMap>({});
  const [loading, setLoading] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const q = ordered[idx];
  const answeredCount = ordered.reduce((n, q) => n + (isAnswered(q, answers, fields) ? 1 : 0), 0);
  const progressPct = Math.round((answeredCount / total) * 100);

  function nextIndex(i: number) {
    // hopp forbi f2 (waketime – håndteres i f1)
    let ni = Math.min(total - 1, i + 1);
    if (ordered[ni]?.id === "f2") ni = Math.min(total - 1, ni + 1);
    return ni;
  }
  function prevIndex(i: number) {
    let pi = Math.max(0, i - 1);
    if (ordered[pi]?.id === "f2") pi = Math.max(0, pi - 1);
    return pi;
  }

  function goNext() { setIdx((i) => nextIndex(i)); }
  function goPrev() { setIdx((i) => prevIndex(i)); }

  function animateAndGoNext() {
    if (idx >= total - 1) return;
    setAnimOut(true);
    setTimeout(() => { setAnimOut(false); goNext(); }, 140);
  }

  async function submitNow() {
    if (loading || submitted) return;
    setLoading(true);
    setSubmitted(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, fields, lang: "nb" })
      });
      const json = await res.json();
      if (json?.id) {
        localStorage.setItem("lastResultId", json.id);
        router.push(`/result/${json.id}`);
        return;
      }
      alert("Kunne ikke åpne rapport. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  function onLikert(v: LikertValue) {
    setAnswers((p) => ({ ...p, [q.id]: v }));
    animateAndGoNext();
  }

  function onHypertensionChange(val: "yes" | "no" | "unknown") {
    // Vis én gang og autosubmit
    setFields((p) => ({ ...p, hypertensionDx: val }));
    setAnimOut(true);
    setTimeout(() => { setAnimOut(false); submitNow(); }, 120);
  }

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
          <article key={idx} className={`card q-card ${animOut ? "q-animate-out" : "q-animate-in"}`}>
            <p className="muted" style={{margin:0}}>{catName(q.category)}</p>
            <h1 className="mb-2">{t(dict, q.textKey, "")}</h1>

            {/* f1 = bedtime + waketime, i ett kort – hopper videre først når begge er satt */}
            {q.kind === "field" && q.id === "f1" && (
              <SleepRange
                bedtime={fields.bedtime}
                waketime={fields.waketime}
                onChange={(bed, wake) => setFields((p) => ({ ...p, bedtime: bed, waketime: wake }))}
                onBothSet={() => animateAndGoNext()}
              />
            )}

            {/* Likert */}
            {q.kind === "likert" && (
              <SmileyLikert name={q.id} value={answers[q.id]} onChange={onLikert} dict={dict} />
            )}

            {/* Øvrige felt */}
            {q.kind === "field" && q.id !== "f1" && (
              <div className="stack-2">
                {q.field.key === "sleepHours" && (
                  <SleepHoursBand
                    value={(fields.sleepHours ?? 7) as number}
                    onChange={(val) => { setFields((p) => ({ ...p, sleepHours: val })); animateAndGoNext(); }}
                  />
                )}

                {q.field.key === "hypertensionDx" && (
                  <ThumbLikert value={(fields.hypertensionDx as any) || "unknown"} onChange={onHypertensionChange} />
                )}
              </div>
            )}
          </article>
        </div>

        {/* Navigasjon */}
        <div className="stage-controls">
          <button className="btn" onClick={() => { setAnimOut(true); setTimeout(() => { setAnimOut(false); goPrev(); }, 120); }} disabled={idx === 0 || loading}>
            {t(dict, "ui.common.back", "Tilbake")}
          </button>

          {/* Ingen manuell “Send inn” – siste autosubmitter */}
          {idx < total - 1 && (
            <button className="btn primary" onClick={animateAndGoNext} disabled={!isAnswered(q, answers, fields) || loading}>
              {t(dict, "ui.common.next", "Neste")}
            </button>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
