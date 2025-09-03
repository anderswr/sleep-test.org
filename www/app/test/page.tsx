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
  if (!q) return false;
  if (q.kind === "likert") return !!answers[q.id];
  const key = q.kind === "field" ? q.field.key : undefined;
  if (!key) return false;
  const val = (fields as any)[key];
  return val !== undefined && val !== ""; // null er lov
}

// Hent opsjoner fra i18n-objekt (object -> [{value,label}]) – typesikkert
function optionsFromDict(dict: any, baseKey: string): ChipOption[] {
  const anyVal = t(dict, baseKey);
  if (!anyVal || typeof anyVal !== "object") return [];
  const obj = anyVal as Record<string, unknown>;
  return Object.entries(obj).map(([value, label]) => ({
    value,
    label: String(label),
  }));
}

export default function TestPage() {
  const { dict, lang } = useI18n();
  const router = useRouter();

  // Fast rekkefølge fra spørsmålbanken
  const ordered = useMemo(() => (Array.isArray(QUESTION_BANK) ? QUESTION_BANK.slice() : []), []);
  const total = ordered.length;
  const hasQuestions = total > 0;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fields, setFields] = useState<FieldMap>({});
  const [loading, setLoading] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const q = hasQuestions ? ordered[idx] : undefined;

  // Fremdrift – vær robust mot total===0
  const answeredCount = hasQuestions
    ? ordered.reduce((n, q) => n + (isAnswered(q, answers, fields) ? 1 : 0), 0)
    : 0;
  const progressPct = hasQuestions ? Math.round((answeredCount / total) * 100) : 0;

  const nextIndex = (i: number) => (hasQuestions ? Math.min(total - 1, i + 1) : 0);
  const prevIndex = (i: number) => (hasQuestions ? Math.max(0, i - 1) : 0);
  const goNext = () => setIdx((i) => nextIndex(i));
  const goPrev = () => setIdx((i) => prevIndex(i));

  function animateAndGoNext() {
    if (!hasQuestions) return;
    if (idx >= total - 1) return;
    setAnimOut(true);
    setTimeout(() => {
      setAnimOut(false);
      goNext();
    }, 140);
  }

// Innsending – versjon som kan ta med "overstyrte" fields
async function submitNowWith(fieldsOverride?: FieldMap) {
  if (loading || submitted) return;
  setLoading(true);
  setSubmitted(true);
  try {
    const payload = {
      answers,
      fields: fieldsOverride ?? fields,
      lang,
    };
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    if (!q) return;
    setAnswers((p) => ({ ...p, [q.id]: v }));
    animateAndGoNext();
  }

  // Blodtrykk: auto-submit
// Blodtrykk: ett klikk => oppdater state + send inn umiddelbart
function onHypertensionChange(val: "yes" | "no" | "unknown") {
  const next = { ...fields, hypertensionDx: val };
  setFields(next);
  // Ingen animasjon, ingen delay – send inn med en gang med de nye feltene
  submitNowWith(next);
}

  const catName = (cat: CategoryId) =>
    t(dict, `category.${cat}.name`, String(cat));

  // ---- Opsjoner til chips-feltene ----
  const halfHourOptions = useMemo(() => timesToOptions(makeHalfHourTimes()), []);

  const sleepBucketOptions = useMemo<ChipOption[]>(() => {
    const base = optionsFromDict(dict, "f.sleep_bucket.options");
    const order: SleepHoursBucket[] = ["<6", "6-7", "7-8", "8-9", "9-10", ">10", "unknown"];
    const byVal = new Map(base.map((o) => [o.value, o]));
    const arranged = order.map((v) => byVal.get(v)).filter(Boolean) as ChipOption[];
    return arranged.length ? arranged : base;
  }, [dict]);

  const weekendShiftOptions = useMemo<ChipOption[]>(() => {
    return optionsFromDict(dict, "f.weekend_shift.options");
  }, [dict]);

  const shiftWorkOptions = useMemo<ChipOption[]>(() => {
    return optionsFromDict(dict, "f.shift_work.options");
  }, [dict]);

  const napFreqOptions = useMemo<ChipOption[]>(() => {
    return optionsFromDict(dict, "f.nap_freq.options");
  }, [dict]);

  // Render-hjelper for feltspørsmål (w1–w6 + f4)
  function renderField() {
    if (!q || q.kind !== "field") return null;
    const key = q.field.key;

    if (key === "wakeTimeWorkday") {
      return (
        <ChipSelect
          value={fields.wakeTimeWorkday ?? undefined}
          onChange={(v) => {
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

    if (key === "weekendWakeShift") {
      return (
        <ChipSelect
          value={typeof fields.weekendWakeShift === "number" ? String(fields.weekendWakeShift) : undefined}
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

    if (key === "hypertensionDx") {
      return (
        <ThumbLikert
          value={(fields.hypertensionDx as any) || "unknown"}
          onChange={onHypertensionChange}
        />
      );
    }

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
            <div className="progress" aria-label={t(dict, "ui.test.progress", "Fremdrift")}>
              <div style={{ width: `${progressPct}%` }} />
            </div>
            <div style={{ minWidth: 72, textAlign: "right" }}>
              {hasQuestions ? `${idx + 1}/${total}` : "0/0"}
            </div>
          </div>
        </div>

        {/* Mangler spørsmål – vis hjelpetekst */}
        {!hasQuestions && (
          <div className="card q-card">
            <h2>Ingen spørsmål tilgjengelig</h2>
            <p>Sjekk følgende:</p>
            <ul>
              <li><code>/data/questions.ts</code> eksporterer <code>QUESTION_BANK</code> med innhold.</li>
              <li>Bygget er oppdatert (push/commit gjort) og Vercel bruker siste commit.</li>
              <li>Ingen runtime-feil i konsollen som stopper render.</li>
            </ul>
          </div>
        )}

        {/* Spørsmålskort */}
        {hasQuestions && q && (
          <div className="center-wrap">
            <article
              key={idx}
              className={`card q-card ${animOut ? "q-animate-out" : "q-animate-in"}`}
            >
              <p className="muted" style={{ margin: 0 }}>
                {catName(q.category as CategoryId)}
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
        )}

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
            disabled={!hasQuestions || idx === 0 || loading}
          >
            {t(dict, "ui.common.back", "Tilbake")}
          </button>

          {/* Ingen manuell “Send inn” – siste (hypertension) autosubmitter */}
          {hasQuestions && idx < total - 1 && (
            <button
              className="btn primary"
              onClick={animateAndGoNext}
              disabled={!isAnswered(q!, answers, fields) || loading}
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
