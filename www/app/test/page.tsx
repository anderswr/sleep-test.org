"use client";
import React, { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SmileyLikert from "@/components/SmileyLikert";
import SleepDual from "@/components/SleepDual";
import SleepHoursBand from "@/components/SleepHoursBand";
import ThumbLikert from "@/components/ThumbLikert";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import { AnswerMap, FieldMap, LikertValue, CategoryId, Question } from "@/lib/types";
import { useRouter } from "next/navigation";

const isAnswered = (q: Question, answers: AnswerMap, fields: FieldMap) => {
  if (q.kind === "likert") return !!answers[q.id];
  if (q.id === "f1") return !!fields.bedtime && !!fields.waketime;
  const v = (fields as any)[q.field.key];
  return v !== undefined && v !== null && v !== "";
};

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

  const q = ordered[idx];
  const answeredCount = ordered.reduce((n, q) => n + (isAnswered(q, answers, fields) ? 1 : 0), 0);
  const progressPct = Math.round((answeredCount / total) * 100);

  const nextIndex = (i: number) => {
    let ni = Math.min(total - 1, i + 1);
    if (ordered[ni]?.id === "f2") ni = Math.min(total - 1, ni + 1); // f2 skjult
    return ni;
  };
  const prevIndex = (i: number) => {
    let pi = Math.max(0, i - 1);
    if (ordered[pi]?.id === "f2") pi = Math.max(0, pi - 1);
    return pi;
  };

  async function submitNow() {
    setLoading(true);
    try {
      const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers, fields, lang: "nb" }) });
      const json = await res.json();
      if (json?.id) { localStorage.setItem("lastResultId", json.id); router.push(`/result/${json.id}`); return; }
      alert("Kunne ikke åpne rapport. Prøv igjen.");
    } finally { setLoading(false); }
  }

  const catName = (c: CategoryId) => t(dict, `category.${c}.name`, String(c));

  return (
    <>
      <SiteHeader />
      <main className="container stage">
        <div className="stage-head">
          <div className="row mb-2" aria-live="polite">
            <div style={{minWidth:80}}>{String(progressPct).padStart(2,"0")}%</div>
            <div className="progress"><div style={{ width: `${progressPct}%` }} /></div>
            <div style={{minWidth:72, textAlign:"right"}}>{idx+1}/{total}</div>
          </div>
        </div>

        <div className="center-wrap">
          <article key={idx} className={`card q-card ${animOut ? "q-animate-out" : "q-animate-in"}`}>
            <p className="muted" style={{margin:0}}>{catName(q.category)}</p>
            <h1 className="mb-2">{t(dict, q.textKey, "")}</h1>

            {q.kind === "field" && q.id === "f1" && (
              <SleepDual
                bedtime={fields.bedtime}
                waketime={fields.waketime}
                onChange={(bed, wake) => setFields((p) => ({ ...p, bedtime: bed, waketime: wake }))}
              />
            )}

            {q.kind === "likert" && (
              <SmileyLikert name={q.id} value={answers[q.id]} onChange={(v:LikertValue)=> setAnswers((p)=>({ ...p, [q.id]: v }))} dict={dict} />
            )}

            {q.kind === "field" && q.id !== "f1" && (
              <>
                {q.field.key === "sleepHours" && (
                  <SleepHoursBand
                    value={(fields.sleepHours ?? 7) as number}
                    onChange={(val) => setFields((p) => ({ ...p, sleepHours: val }))}
                  />
                )}
                {q.field.key === "hypertensionDx" && (
                  <ThumbLikert value={(fields.hypertensionDx as any) || "unknown"} onChange={(val)=> setFields((p)=>({ ...p, hypertensionDx: val }))} />
                )}
              </>
            )}
          </article>
        </div>

        <div className="stage-controls">
          <button className="btn lg" onClick={() => { setAnimOut(true); setTimeout(()=>{ setAnimOut(false); setIdx(prevIndex); }, 120); }} disabled={idx===0 || loading}>
            {t(dict,"ui.common.back","Tilbake")}
          </button>

          {idx < total - 1 ? (
            <button className="btn primary lg" onClick={() => { if(!isAnswered(q,answers,fields)) return; setAnimOut(true); setTimeout(()=>{ setAnimOut(false); setIdx(nextIndex); }, 120); }} disabled={!isAnswered(q,answers,fields) || loading}>
              {t(dict,"ui.common.next","Neste")}
            </button>
          ) : (
            <button className="btn primary lg" onClick={submitNow} disabled={!isAnswered(q,answers,fields) || loading}>
              {t(dict,"ui.test.submit","Send inn")}
            </button>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
