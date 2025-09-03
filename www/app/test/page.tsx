// app/test/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SmileyLikert from "@/components/SmileyLikert";
import ThumbLikert from "@/components/ThumbLikert";

import ChipSelect, {
  makeHalfHourTimes,
  timesToOptions,
  ChipOption,
} from "@/components/ChipSelect";

import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import {
  AnswerMap,
  FieldMap,
  LikertValue,
  CategoryId,
  Question,
  SleepHoursBucket,
  ShiftWork,
} from "@/lib/types";
import { useRouter } from "next/navigation";

// Hjelper: er spørsmålet besvart?
// NB: vi tillater null som "gyldig" (f.eks. "Varierer / vet ikke")
function isAnswered(q: Question, answers: AnswerMap, fields: FieldMap) {
  if (q.kind === "likert") return !!answers[q.id];
  const key = q.kind === "field" ? q.field.key : undefined;
  if (!key) return false;
  const val = (fields as any)[key];
  return val !== undefined && val !== ""; // null er lov
}

// Hent opsjoner fra i18n-objekt (object -> [{value,label}])
function optionsFromDict(dict: any, baseKey: string): ChipOption[] {
  const obj = t(dict, baseKey) as Record<string, string> | undefined;
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).map(([value, label]) => ({
    value,
    label: String(label),
  }));
}

export default function TestPage() {
  const { dict, lang } = useI18n();
  const router = useRouter();

  // Fast rekkefølge fra spørsmålbanken
  const ordered = useMemo(() => QUESTION_BANK.slice(), []);
  const total = ordered.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fields, setFields] = useState<FieldMap>({});
  const [loading, setLoading] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const q = ordered[idx];

  // Fremdrift
  const answeredCount = ordered.reduce(
    (n, q) => n + (isAnswered(q, answers, fields) ? 1 : 0),
    0
  );
  const progressPct = Math.round((answeredCount / total) * 100);

  const nextIndex = (i: number) => Math.min(total - 1, i + 1);
  const prevIndex = (i: number) => Math.max(0, i - 1);
  const goNext = () => setIdx((i) => nextIndex(i));
  const goPrev = () => setIdx((i) => prevIndex(i));

  function animateAndGoNext() {
    if (idx >= total - 1) return;
    setAnimOut(true);
    setTimeout(() => {
      setAnimOut(false);
      goNext();
    }, 140);
  }

  async function submitNow() {
    if (loading || submitted) return;
    setLoading(true);
    setSubmitted(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, fields, lang }),
      });
      const json = await res.json();
      if (json?.id) {
        if (typeof window !== "undefined") {
          localStorage.setItem("lastResultId", json.id);
        }
        router.push(`/result/${json.id}`);
        return;
      }
      alert("Kunne ikke åpne rapport. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  // Likert: auto-neste
  function onLikert(v: LikertValue) {
    setAnswers((p) => ({ ...p, [q.id]: v }));
    animateAndGoNext();
  }

  // Blodtrykk: auto-submit
  function onHypertensionChange(val: "yes" | "no" | "unknown") {
    setFields((p) => ({ ...p, hypertensionDx: val }));
    setAnimOut(true);
    setTimeout(() => {
      setAnimOut(false);
      submitNow();
    }, 120);
  }

  const catName = (cat: CategoryId) =>
    t(dict, `category.${cat}.name`, String(cat));

  // ---- Opsjoner til chips-feltene ----
  const halfHourOptions = useMemo(() => timesToOptions(makeHalfHourTimes()), []);

  const sleepBucketOptions = useMemo<ChipOption[]>(() => {
    // fra i18n: f.sleep_bucket.options
    const base = optionsFromDict(dict, "f.sleep_bucket.options");
    // prøv å rendrere i ønsket rekkefølge hvis eksisterer:
    const order: SleepHoursBucket[] = [
      "<6",
      "6-7",
      "7-8",
      "8-9",
      "9-10",
      ">10",
      "unknown",
    ];
    const byVal = new Map(base.map((o) => [o.value, o]));
    const ordered = order
      .map((v) => byVal.get(v))
      .filter(Boolean) as ChipOption[];
    // hvis i18n ikke hadde alt, fall tilbake til base
    return ordered.length ? ordered : base;
  }, [dict]);

  const weekendShiftOptions = useMemo<ChipOption[]>(() => {
    // fra i18n: f.weekend_shift.options (keys: "0","1.5","3",...)
    const raw = optionsFromDict(dict, "f.weekend_shift.options");
    // behold som string-values; vi caster til number ved setFields
    return raw;
  }, [dict]);

  const shiftWorkOptions = useMemo<ChipOption[]>(() => {
    return optionsFromDict(dict, "f.shift_work.options");
  }, [dict]);

  const napFreqOptions = useMemo<ChipOption[]>(() => {
    return optionsFromDict(dict, "f.nap_freq.options");
  }, [dict]);

  // Render-hjelper for feltspørsmål (w1–w6 + f4)
  function renderField() {
    if (q.kind !== "field") return null;
    const key = q.field.key;

    // w1: wakeTimeWorkday (halvtimers chips + "ingen fast tid")
    if (key === "wakeTimeWorkday") {
      return (
        <ChipSelect
          value={fields.wakeTimeWorkday ?? undefined}
          onChange={(v) => {
            // v kan være string eller null (hvis "varierer")
            setFields((p) => ({ ...p, wakeTimeWorkday: (v as string) ?? null }));
            animateAndGoNext();
          }}
          options={halfHourOptions}
          nullLabel={t(dict, "f.wake_work.no_fixed", "Varierer / vet ikke")}
          ariaLabel={t(dict, "f.wake_work.title")}
          size="lg"
        />
      );
    }

    // w2: sleepHoursBucketWorkday
    if (key === "sleepHoursBucketWorkday") {
      return (
        <ChipSelect
          value={fields.sleepHoursBucketWorkday}
          onChange={(v) => {
            setFields((p) => ({
              ...p,
              sleepHoursBucketWorkday: v as SleepHoursBucket,
            }));
            animateAndGoNext();
          }}
          options={sleepBucketOptions}
          ariaLabel={t(dict, "f.sleep_bucket.title")}
          size="lg"
        />
      );
    }

    // w3: weekendWakeShift (number timer)
    if (key === "weekendWakeShift") {
      return (
        <ChipSelect
          value={
            typeof fields.weekendWakeShift === "number"
              ? String(fields.weekendWakeShift)
              : undefined
          }
          onChange={(v) => {
            const num = v == null ? null : Number(v);
            setFields((p) => ({ ...p, weekendWakeShift: num as any }));
            animateAndGoNext();
          }}
          options={weekendShiftOptions}
          ariaLabel={t(dict, "f.weekend_shift.title")}
          size="lg"
        />
      );
    }

    // w4: wakeTimeUsual (halvtimers chips, ingen null-chip)
    if (key === "wakeTimeUsual") {
      return (
        <ChipSelect
          value={fields.wakeTimeUsual ?? undefined}
          onChange={(v) => {
            setFields((p) => ({ ...p, wakeTimeUsual: (v as string) ?? null }));
            animateAndGoNext();
          }}
          options={halfHourOptions}
          ariaLabel={t(dict, "f.wake_usual.title")}
          size="lg"
        />
      );
    }

    // w5: shiftWork (enum)
    if (key === "shiftWork") {
      return (
        <ChipSelect
          value={fields.shiftWork ?? undefined}
          onChange={(v) => {
            setFields((p) => ({ ...p, shiftWork: (v as ShiftWork) ?? "none" }));
            animateAndGoNext();
          }}
          options={shiftWorkOptions}
          ariaLabel={t(dict, "f.shift_work.title")}
          size="lg"
        />
      );
    }

    // w6: napFreq
    if (key === "napFreq") {
      return (
        <ChipSelect
          value={fields.napFreq ?? undefined}
          onChange={(v) => {
            setFields((p) => ({ ...p, napFreq: (v as any) ?? "never" }));
            animateAndGoNext();
          }}
          options={napFreqOptions}
          ariaLabel={t(dict, "f.nap_freq.title")}
          size="lg"
        />
      );
    }

    // f4: hypertensionDx (tomler, autosubmit)
    if (key === "hypertensionDx") {
      return (
        <ThumbLikert
          value={(fields.hypertensionDx as any) || "unknown"}
          onChange={onHypertensionChange}
        />
      );
    }

    // Ukjent felt-key (fallback)
    return null;
  }

  return (
    <>
      <SiteHeader />
      <main className="container stage">
        {/* Topp: fremdrift */}
        <div className="stage-head">
          <div className="row mb-2" aria-live="polite">
            <div style={{ minWidth: 80 }}>
              {String(progressPct).padStart(2, "0")}%
            </div>
            <div
              className="progress"
              aria-label={t(dict, "ui.test.progress", "Fremdrift")}
            >
              <div style={{ width: `${progressPct}%` }} />
            </div>
            <div style={{ minWidth: 72, textAlign: "right" }}>
              {idx + 1}/{total}
            </div>
          </div>
        </div>

        {/* Spørsmålskort */}
        <div className="center-wrap">
          <article
            key={idx}
            className={`card q-card ${animOut ? "q-animate-out" : "q-animate-in"}`}
          >
            <p className="muted" style={{ margin: 0 }}>
              {catName(q.category)}
            </p>
            <h1 className="mb-2">{t(dict, q.textKey, "")}</h1>

            {/* Likert 1–5 */}
            {q.kind === "likert" && (
              <SmileyLikert
                name={q.id}
                value={answers[q.id]}
                onChange={onLikert}
                dict={dict}
              />
            )}

            {/* Feltspørsmål (chips / tomler) */}
            {q.kind === "field" && <div className="stack-2">{renderField()}</div>}
          </article>
        </div>

        {/* Navigasjon */}
        <div className="stage-controls">
          <button
            className="btn"
            onClick={() => {
              setAnimOut(true);
              setTimeout(() => {
                setAnimOut(false);
                goPrev();
              }, 120);
            }}
            disabled={idx === 0 || loading}
          >
            {t(dict, "ui.common.back", "Tilbake")}
          </button>

          {/* Ingen manuell “Send inn” – siste (hypertension) autosubmitter */}
          {idx < total - 1 && (
            <button
              className="btn primary"
              onClick={animateAndGoNext}
              disabled={!isAnswered(q, answers, fields) || loading}
            >
              {t(dict, "ui.common.next", "Neste")}
            </button>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
