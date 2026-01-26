// app/test/page.tsx
"use client";

import * as React from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import { AnswerMap, GenderSelection, LikertValue } from "@/lib/types";
import SmileyLikert from "@/components/SmileyLikert";

const LIKERT_QUESTIONS = QUESTION_BANK.filter((q) => q.kind === "likert");
const FEMALE_ONLY_IDS = new Set(
  LIKERT_QUESTIONS.filter((q) => q.femaleOnly).map((q) => q.id)
);

export default function TestPage() {
  const { dict, lang } = useI18n();

  const [idx, setIdx] = React.useState(0);
  const [gender, setGender] = React.useState<GenderSelection | null>(null);
  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const activeQuestions = React.useMemo(
    () => LIKERT_QUESTIONS.filter((q) => !q.femaleOnly || gender === "female"),
    [gender]
  );

  const q = gender ? activeQuestions[idx] : null;
  const isGenderStep = gender === null;
  const isFirst = idx === 0;
  const isLast = idx === activeQuestions.length - 1;
  const isAnswered = q ? !!answers[q.id as keyof AnswerMap] : false;

  // Beskytter mot dobbel submit
  const submittedRef = React.useRef(false);

  const next = React.useCallback(() => {
    setIdx((i) => Math.min(activeQuestions.length - 1, i + 1));
  }, [activeQuestions.length]);

  const prev = React.useCallback(() => {
    if (gender && idx === 0) {
      setGender(null);
      return;
    }
    setIdx((i) => Math.max(0, i - 1));
  }, [gender, idx]);

  // --- NY: submit med eksplisitt "current" svarobjekt for å unngå stale state
  async function submitWith(current: AnswerMap) {
    if (submittedRef.current || submitting) return;

    submittedRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      body: JSON.stringify({ answers: current, lang, gender }),
      });
      if (!res.ok) throw new Error("submit_failed");
      const json = (await res.json()) as { id: string };
      window.location.assign(`/result/${json.id}`);
    } catch {
      setError(t(dict, "common.error_submit", "Could not submit. Please try again."));
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  // Beholder API-et: kaller bare submitWith(answers)
  async function submit() {
    return submitWith(answers);
  }

  // Når man velger et likert-svar: lagre + auto-naviger/auto-submit
  function setLikert(v: LikertValue) {
    if (!q) return;
    const id = q.id;

    // Bygg neste svarobjekt synkront (inkluderer dette valget)
    const nextAnswers = { ...answers, [id]: v } as AnswerMap;
    setAnswers(nextAnswers);

    // Liten delay for hyggelig følelse (gir visuell bekreftelse)
    if (!isLast) {
      window.setTimeout(next, 120);
    } else {
      // Viktig: submit med nextAnswers for å ikke miste siste klikk
      window.setTimeout(() => submitWith(nextAnswers), 160);
    }
  }

  function selectGender(value: GenderSelection) {
    setGender(value);
    setIdx(0);
    setAnswers((prevAnswers) => {
      if (value === "female") return prevAnswers;
      const nextAnswers = { ...prevAnswers };
      FEMALE_ONLY_IDS.forEach((id) => {
        delete nextAnswers[id];
      });
      return nextAnswers;
    });
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        <section className="card" style={{ padding: 16 }}>
          <div className="stage">
            {/* Topp */}
            <div className="stage-head">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h1 style={{ margin: 0 }}>{t(dict, "test.title", "Søvntest")}</h1>
                {!isGenderStep && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      className="progress"
                      style={{ width: 180 }}
                      aria-label={t(dict, "test.progress", "Fremdrift")}
                    >
                      <div
                        style={{
                          width: `${Math.round(((idx + 1) / activeQuestions.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span
                      style={{ fontSize: ".9rem", color: "var(--muted)", minWidth: 60, textAlign: "right" }}
                      aria-live="polite"
                    >
                      {idx + 1} / {activeQuestions.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Spørsmål */}
            <div className="center-wrap">
              <div className="q-card card">
                {isGenderStep ? (
                  <div className="gender-step">
                    <p style={{ marginTop: 0, marginBottom: 12 }}>
                      {t(dict, "test.gender.title", "Kjønn")}
                    </p>
                    <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
                      {t(
                        dict,
                        "test.gender.help",
                        "Vi spør for å gi mer presise søvntips knyttet til hormonelle faser."
                      )}
                    </p>
                    <div className="gender-grid">
                      <button
                        className="gender-option"
                        type="button"
                        onClick={() => selectGender("female")}
                        aria-label={t(dict, "test.gender.female", "Kvinne")}
                      >
                        <span className="gender-icon" aria-hidden>
                          ♀
                        </span>
                        <span>{t(dict, "test.gender.female", "Kvinne")}</span>
                      </button>
                      <button
                        className="gender-option"
                        type="button"
                        onClick={() => selectGender("male")}
                        aria-label={t(dict, "test.gender.male", "Mann")}
                      >
                        <span className="gender-icon" aria-hidden>
                          ♂
                        </span>
                        <span>{t(dict, "test.gender.male", "Mann")}</span>
                      </button>
                      <button
                        className="gender-option"
                        type="button"
                        onClick={() => selectGender("na")}
                        aria-label={t(dict, "test.gender.na", "Ønsker ikke å oppgi")}
                      >
                        <span className="gender-icon" aria-hidden>
                          ○
                        </span>
                        <span>{t(dict, "test.gender.na", "Ønsker ikke å oppgi")}</span>
                      </button>
                    </div>
                  </div>
                ) : q ? (
                  <>
                    <p style={{ marginTop: 0, marginBottom: 12 }}>
                      {t(dict, q.textKey, q.textKey)}
                    </p>
                    <SmileyLikert
                      value={(answers[q.id] as LikertValue) ?? null}
                      onChange={setLikert}
                      labels={{
                        1: t(dict, "likert.1", "Never"),
                        2: t(dict, "likert.2", "Rarely"),
                        3: t(dict, "likert.3", "Sometimes"),
                        4: t(dict, "likert.4", "Often"),
                        5: t(dict, "likert.5", "Very often"),
                      }}
                    />
                  </>
                ) : (
                  <p className="muted">…</p>
                )}
              </div>
            </div>

            {/* Navigasjon */}
            <div className="stage-controls" aria-busy={submitting}>
              <button
                className="btn"
                onClick={prev}
                disabled={(isGenderStep && isFirst) || submitting}
              >
                {t(dict, "common.back", "Back")}
              </button>

              {/* “Neste” er tilgjengelig for de som vil trykke; auto-next skjer uansett ved valg */}
              {!isGenderStep && !isLast ? (
                <button className="btn primary" onClick={next} disabled={!isAnswered || submitting}>
                  {t(dict, "common.next", "Next")}
                </button>
              ) : !isGenderStep ? (
                <button
                  className="btn primary"
                  onClick={submit}
                  disabled={!isAnswered || submitting}
                >
                  {submitting ? t(dict, "common.sending", "Sending…") : t(dict, "test.submit", "Submit")}
                </button>
              ) : (
                <button className="btn primary" disabled>
                  {t(dict, "common.next", "Next")}
                </button>
              )}
            </div>

            {error && (
              <p style={{ color: "var(--bad)", marginTop: 8 }}>{error}</p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
