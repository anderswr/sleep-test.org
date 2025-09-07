// app/test/page.tsx
"use client";

import * as React from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import { AnswerMap, LikertValue } from "@/lib/types";
import SmileyLikert from "@/components/SmileyLikert";

const LIKERT_QUESTIONS = QUESTION_BANK.filter((q) => q.kind === "likert");

export default function TestPage() {
  const { dict, lang } = useI18n();

  const [idx, setIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const q = LIKERT_QUESTIONS[idx];
  const isFirst = idx === 0;
  const isLast = idx === LIKERT_QUESTIONS.length - 1;
  const isAnswered = q ? !!answers[q.id as keyof AnswerMap] : false;

  // Beskytter mot dobbel submit
  const submittedRef = React.useRef(false);

  const next = React.useCallback(() => {
    setIdx((i) => Math.min(LIKERT_QUESTIONS.length - 1, i + 1));
  }, []);

  const prev = React.useCallback(() => {
    setIdx((i) => Math.max(0, i - 1));
  }, []);

  async function submit() {
    if (submittedRef.current || submitting) return;
    // Sjekk at siste er besvart
    const lastQ = LIKERT_QUESTIONS[LIKERT_QUESTIONS.length - 1];
    if (!answers[lastQ.id as keyof AnswerMap]) return;

    submittedRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ answers, lang }),
      });
      if (!res.ok) throw new Error("submit_failed");
      const json = (await res.json()) as { id: string };
      window.location.assign(`/result/${json.id}`);
    } catch {
      setError(t(dict, "ui.common.error_submit", "Kunne ikke sende inn. Prøv igjen."));
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  // Når man velger et likert-svar: lagre + auto-naviger/auto-submit
  function setLikert(v: LikertValue) {
    if (!q) return;
    const id = q.id;
    setAnswers((prev) => ({ ...prev, [id]: v }));

    // Liten delay for hyggelig følelse (gir visuell bekreftelse)
    if (!isLast) {
      window.setTimeout(next, 160);
    } else {
      window.setTimeout(submit, 200);
    }
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
                <h1 style={{ margin: 0 }}>{t(dict, "ui.test.title", "Søvntest")}</h1>
                <div className="progress" style={{ width: 180 }}>
                  <div
                    style={{
                      width: `${Math.round(((idx + 1) / LIKERT_QUESTIONS.length) * 100)}%`,
                    }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            {/* Spørsmål */}
            <div className="center-wrap">
              <div className="q-card card">
                {q ? (
                  <>
                    <p style={{ marginTop: 0, marginBottom: 12 }}>
                      {t(dict, q.textKey, q.textKey)}
                    </p>
                    <SmileyLikert
                      value={(answers[q.id] as LikertValue) ?? null}
                      onChange={setLikert}
                      labels={{
                        1: t(dict, "likert.1", "Aldri / Ikke i det hele tatt"),
                        2: t(dict, "likert.2", "Sjelden"),
                        3: t(dict, "likert.3", "Av og til"),
                        4: t(dict, "likert.4", "Ofte"),
                        5: t(dict, "likert.5", "Svært ofte"),
                      }}
                    />
                  </>
                ) : (
                  <p className="muted">…</p>
                )}
              </div>
            </div>

            {/* Navigasjon */}
            <div className="stage-controls">
              <button className="btn" onClick={prev} disabled={isFirst || submitting}>
                {t(dict, "ui.common.back", "Tilbake")}
              </button>

              {/* “Neste” er tilgjengelig for de som vil trykke; auto-next skjer uansett ved valg */}
              {!isLast ? (
                <button className="btn primary" onClick={next} disabled={!isAnswered || submitting}>
                  {t(dict, "ui.common.next", "Neste")}
                </button>
              ) : (
                <button
                  className="btn primary"
                  onClick={submit}
                  disabled={!isAnswered || submitting}
                >
                  {submitting ? t(dict, "ui.common.sending", "Sender…") : t(dict, "ui.test.submit", "Send inn")}
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
