// app/test/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { QUESTION_BANK } from "@/data/questions";
import { AnswerMap, FieldMap, LikertValue, CategoryId } from "@/lib/types";
import { LIKERT_LABEL_KEYS } from "@/lib/scoring";

export default function TestPage() {
  const { lang, setLang, dict } = useI18n();

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [fields, setFields] = useState<FieldMap>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Likert-etiketter fra språkfilen
  const likertLabels = useMemo(
    () => [1, 2, 3, 4, 5].map((n) => t(dict, LIKERT_LABEL_KEYS[n as 1])),
    [dict]
  );

  const handleLikert = (id: string, v: LikertValue) =>
    setAnswers((p) => ({ ...p, [id]: v }));

  const handleField = (key: keyof FieldMap, v: any) =>
    setFields((p) => ({ ...p, [key]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, fields, lang }),
      });
      const json = await res.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  // Gruppe spørsmål per kategori for naturlig rekkefølge
  const groups: Record<CategoryId, typeof QUESTION_BANK> = {
    pattern: [],
    insomnia: [],
    quality: [],
    daytime: [],
    hygiene: [],
    environment: [],
    breathing: [],
  } as any;
  QUESTION_BANK.forEach((q) => groups[q.category].push(q));

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          {t(dict, "ui.test.title", "Søvntest")}
        </h1>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="nb">Norsk</option>
          <option value="en">English</option>
        </select>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {Object.entries(groups).map(([cat, items]) => (
          <section key={cat} className="space-y-4">
            <h2 className="text-xl font-medium">
              {t(dict, `category.${cat}.name`)}
            </h2>
            <p className="text-sm text-gray-600">
              {t(dict, `category.${cat}.desc`)}
            </p>

            {items.map((q) => (
              <div key={q.id} className="border rounded-xl p-4">
                {q.kind === "likert" ? (
                  <div>
                    <p className="mb-2">{t(dict, q.textKey)}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label key={n} className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={q.id}
                            value={n}
                            checked={answers[q.id] === n}
                            onChange={() => handleLikert(q.id, n as LikertValue)}
                          />
                          <span className="text-sm">{likertLabels[n - 1]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>{t(dict, q.textKey)}</p>

                    {q.field.subtype === "time" && (
                      <input
                        className="border rounded px-3 py-2"
                        type="time"
                        onChange={(e) =>
                          handleField(q.field.key as keyof FieldMap, e.target.value)
                        }
                      />
                    )}

                    {q.field.subtype === "number" && (
                      <input
                        className="border rounded px-3 py-2"
                        type="number"
                        step="0.1"
                        onChange={(e) =>
                          handleField(
                            q.field.key as keyof FieldMap,
                            Number(e.target.value)
                          )
                        }
                      />
                    )}

                    {q.field.subtype === "select" && (
                      <select
                        className="border rounded px-3 py-2"
                        onChange={(e) =>
                          handleField(
                            q.field.key as keyof FieldMap,
                            e.target.value as any
                          )
                        }
                      >
                        {Object.entries(
                          t<Record<string, string>>(dict, q.field.optionsKey!, {})
                        ).map(([v, label]) => (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        ))}

        <button
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          {loading
            ? t(dict, "ui.common.sending", "Sender…")
            : t(dict, "ui.test.submit", "Send inn")}
        </button>
      </form>

      {result && (
        <div className="mt-10 border rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-2">
            {t(dict, "ui.result.title", "Resultat")}
          </h3>

          <p>
            <strong>{t(dict, "ui.result.sleep_score", "Søvn-score")}:</strong>{" "}
            {result.sleepScore} / 100
          </p>

          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(result.categoryScores || {}).map(([k, v]) => (
              <li key={k} className="text-sm">
                {t(dict, `category.${k}.name`)}: {v}
              </li>
            ))}
          </ul>

          {result.flags?.osaSignal && (
            <p className="mt-3 text-red-600 text-sm">
              {t(dict, "flags.osa_signal")}
            </p>
          )}
          {result.flags?.excessiveSleepiness && (
            <p className="text-orange-600 text-sm">
              {t(dict, "flags.excessive_sleepiness")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
