"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SmileyLikert from "@/components/SmileyLikert";
import SleepDual from "@/components/SleepDual";
import SleepHoursBand from "@/components/SleepHoursBand";
import ThumbLikert from "@/components/ThumbLikert";

import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import type { AnswerMap, FieldMap, LikertValue, CategoryId, Question } from "@/lib/types";

// Hjelper: er det aktuelle spørsmålet besvart?
function isAnswered(q: Question, answers: AnswerMap, fields: FieldMap) {
  if (q.kind === "likert") return !!answers[q.id];
  if (q.id === "f1") return !!fields.bedtime && !!fields.waketime; // begge må settes i SleepDual
  const v = (fields as any)[q.field.key];
  return v !== undefined && v !== null && v !== "";
}

export default function TestPage() {
  const { dict, lang } = useI18n();
  const router = useRouter();

  // Fast ordensliste (vi skjuler f2 visuelt – f1 styrer begge tider)
  const ordered = useMemo(() => QUESTION_BANK.slice(), []);
  const total = ordered.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fields, setFields] = useState<FieldMap>({});
  const [loading, setLoading] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  const q = ordered[idx];

  // Fremdrift
  const answeredCount = ordered.reduce((n, q) => n + (isAnswered(q, answers, fields) ? 1 : 0), 0);
  const progressPct = Math.round((answeredCount / total) * 100);

  // Neste/forrige (hopper over f2 – separat waketime-spørsmål som vi IKKE viser)
  const nextIndex = (i: number) => {
    let ni = Math.min(total - 1, i + 1);
    if (ordered[ni]?.id === "f2") ni = Math.min(total - 1, ni + 1);
    return ni;
  };
  const prevIndex = (i: number) => {
    let pi = Math.max(0, i - 1);
    if (ordered[pi]?.id === "f2") pi = Math.max(0, pi - 1);
    return pi;
  };

  // Innsending
  async function submitNow() {
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, fields, lang }),
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

  const catName = (c: CategoryId) => t(dict, `category.${c}.name`, String(c));
  const canGoNext = isAnswered(q, answers, fields);

  return (
    <>
      <SiteHeader />
      <main className="container stage">
        {/* Topp – fremdrift */}
        <div className="stage-head">
          <div className="row mb-2" aria-live="polite">
            <div style={{ minWidth: 80 }}>{String(progressPct).padStart(2, "0")}%</div>
            <div className="progress">
              <div style={{ width: `${progressPct}%` }} />
            </div>
            <div style={{ minWidth: 72, textAlign: "right" }}>
              {idx + 1}/{total}
            </div>
          </div>
        </div>

        {/* Midt – spørsmåls-kort */}
        <div className="center-wrap">
          <article
            key={idx}
            className={`card q-card ${animOut ? "q-animate-out" : "q-animate-in"}`}
          >
            <p className="muted" style={{ margin: 0 }}>
              {catName(q.category)}
            </p>
            <h1 className="mb-2">{t(dict, q.textKey, "")}</h1>

            {/* Feltspørsmål – f1: SleepDual (legg/opp) */}
            {q.kind === "field" && q.id === "f1" && (
              <SleepDual
                bedtime={fields.bedtime}
                waketime={fields.waketime}
                onChange={(bed, wake) =>
                  setFields((p) => ({ ...p, bedtime: bed, waketime: wake }))
                }
              />
            )}

            {/* Likert 1–5 med smileys */}
            {q.kind === "likert" && (
              <SmileyLikert
                name={q.id}
                value={answers[q.id]}
                onChange={(v: LikertValue) =>
                  setAnswers((p) => ({ ...p, [q.id]: v }))
                }
                dict={dict}
              />
            )}

            {/* Øvrige felt: søvntimer, blodtrykk (tomler) */}
            {q.kind === "field" && q.id !== "f1" && (
              <>
                {q.field.key === "sleepHours" && (
                  <SleepHoursBand
                    // default til 7 hvis ikke valgt, for en bedre startposisjon
                    value={(typeof fields.sleepHours === "number" ? fields.sleepHours : 7) as number}
                    onChange={(val) =>
                      setFields((p) => ({ ...p, sleepHours: val }))
                    }
                    ticks={[0, 2, 4, 6, 8, 10, 12]}
                    max={12}
                    step={0.5}
                  />
                )}

                {q.field.key === "hypertensionDx" && (
                  <ThumbLikert
                    // vi viser kun Ja/Nei, ingen "unknown" – da må bruker velge
                    value={((fields.hypertensionDx as any) || null) as any}
                    onChange={(val) =>
                      setFields((p) => ({ ...p, hypertensionDx: val }))
                    }
                  />
                )}
              </>
            )}
          </article>
        </div>

        {/* Bunn – kontroller */}
        <div className="stage-controls">
          <button
            className="btn lg"
            onClick={() => {
              setAnimOut(true);
              setTimeout(() => {
                setAnimOut(false);
                setIdx((i) => prevIndex(i));
              }, 120);
            }}
            disabled={idx === 0 || loading}
          >
            {t(dict, "ui.common.back", "Tilbake")}
          </button>

          {idx < total - 1 ? (
            <button
              className="btn primary lg"
              onClick={() => {
                if (!canGoNext) return;
                setAnimOut(true);
                setTimeout(() => {
                  setAnimOut(false);
                  setIdx((i) => nextIndex(i));
                }, 120);
              }}
              disabled={!canGoNext || loading}
            >
              {t(dict, "ui.common.next", "Neste")}
            </button>
          ) : (
            <button
              className="btn primary lg"
              onClick={submitNow}
              disabled={!canGoNext || loading}
            >
              {t(dict, "ui.test.submit", "Send inn")}
            </button>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
