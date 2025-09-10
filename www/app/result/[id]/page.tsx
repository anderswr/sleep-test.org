// app/result/[id]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { bucketColor } from "@/lib/scoring";
import { CategoryId } from "@/lib/types";

type ResultDoc = {
  id: string;
  sleepScore: number;                          // 0–100 (høyere = bedre)
  totalRaw?: number;                           // 0–100 (høyere = verre) – kan mangle i eldre resultater
  categoryScores: Record<string, number>;      // 0–100 (høyere = verre)
  flags?: { osaSignal?: boolean; excessiveSleepiness?: boolean; highBpRisk?: boolean };
  suggestedTips?: Record<string, string[]>;
};

function decapitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Hjelper: map kategori -> artikkel-slug (må finnes i /articles/[lang]/). */
const ARTICLE_SLUG_BY_CAT: Partial<Record<CategoryId, string>> = {
  [CategoryId.Pattern]: "pattern",
  [CategoryId.Insomnia]: "insomnia",
  [CategoryId.Quality]: "quality",
  [CategoryId.Daytime]: "daytime",
  [CategoryId.Hygiene]: "hygiene",
  [CategoryId.Environment]: "environment",
  [CategoryId.Breathing]: "breathing",
  // bloodpressure har ingen artikkel hos deg ennå -> ingen link/ikon
};

/** Hjelper: velg 2–3 tips-nøkler per kategori basert på bucket-farge. */
function pickTipKeys(cat: CategoryId, color: "green" | "orange" | "red"): string[] {
  // NB: bruker bare nøkler som finnes i nb/en under "tips.*"
  if (cat === CategoryId.Pattern) {
    if (color === "green") return ["tips.pattern.keep_routine", "tips.pattern.protect_7h"];
    if (color === "orange") return ["tips.pattern.consistent_bed_wake", "tips.pattern.plan_winddown", "tips.pattern.protect_7h"];
    return ["tips.pattern.plan_winddown", "tips.pattern.cut_late_naps", "tips.pattern.protect_7h"];
  }
  if (cat === CategoryId.Insomnia) {
    if (color === "green") return ["tips.insomnia.maintain"];
    if (color === "orange") return ["tips.insomnia.rule_20min", "tips.insomnia.fixed_wake"];
    return ["tips.insomnia.rule_20min", "tips.insomnia.stimulus_control", "tips.insomnia.consider_cbti"];
  }
  if (cat === CategoryId.Quality) {
    if (color === "green") return ["tips.quality.track_triggers"];
    if (color === "orange") return ["tips.quality.address_disruptors", "tips.quality.track_triggers"];
    return ["tips.quality.address_disruptors", "tips.quality.consult_if_pain"];
  }
  if (cat === CategoryId.Daytime) {
    if (color === "green") return ["tips.daytime.morning_light"];
    if (color === "orange") return ["tips.daytime.morning_light", "tips.daytime.activity_breaks"];
    return ["tips.daytime.morning_light", "tips.daytime.activity_breaks", "tips.daytime.consider_medical"];
  }
  if (cat === CategoryId.Hygiene) {
    if (color === "green") return ["tips.hygiene.keep_it_up"];
    if (color === "orange") return ["tips.hygiene.screens_off_60", "tips.hygiene.limit_caffeine"];
    return ["tips.hygiene.screens_off_60", "tips.hygiene.limit_caffeine", "tips.hygiene.no_alcohol_late"];
  }
  if (cat === CategoryId.Environment) {
    if (color === "green") return ["tips.environment.keep_cool_dark"];
    if (color === "orange") return ["tips.environment.test_blackout", "tips.environment.noise_control"];
    return ["tips.environment.keep_cool_dark", "tips.environment.try_new_pillow", "tips.environment.cooler_temp"];
  }
  if (cat === CategoryId.Breathing) {
    if (color === "green") return ["tips.breathing.side_sleep"];
    if (color === "orange") return ["tips.breathing.side_sleep", "tips.breathing.reduce_evening_alcohol"];
    return ["tips.breathing.side_sleep", "tips.breathing.reduce_evening_alcohol", "tips.breathing.consider_gp_check"];
  }
  // BloodPressure: ingen tips-nøkler i i18n ennå -> tom liste
  return [];
}

export default function ResultPage({ params }: { params: { id: string } }) {
  const { dict } = useI18n();
  const [data, setData] = useState<ResultDoc | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/result/${params.id}`, { cache: "no-store" });
        if (!res.ok) { setNotFound(true); return; }
        const json = await res.json();
        setData(json);
      } catch {
        setNotFound(true);
      }
    })();
  }, [params.id]);

  const entries = useMemo(
    () =>
      Object.entries((data?.categoryScores || {}) as Record<string, number>) as Array<
        [CategoryId, number]
      >,
    [data]
  );

  if (notFound) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <main className="container" style={{ flex: "1 1 auto" }}>
          <article className="card" style={{ padding: 24 }}>
            <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>
            <p className="muted">Not found.</p>
          </article>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Farge til ringen: bruk totalRaw hvis den finnes, ellers 100 - sleepScore (eldre resultater)
  const ringColor =
    data
      ? bucketColor(
          typeof data.totalRaw === "number" ? data.totalRaw : Math.max(0, 100 - Number(data.sleepScore))
        ).replace("yellow", "orange") as "green" | "orange" | "red"
      : "green";

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {!data ? (
          <article className="card" style={{ padding: 24 }}>
            <p className="muted">Loading…</p>
          </article>
        ) : (
          <>
            {/* TOPP: bredt kort – samme breddeopplevelse som About */}
            <article className="panel head score-hero" style={{ padding: 24 }}>
              <div className="score-hero__left">
                <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>
                <div className="row" style={{ gap: 8, alignItems: "center" }}>
                  <code
                    className="px-1 py-0.5"
                    style={{ background: "#f3f4f6", borderRadius: 6 }}
                  >
                    {data.id}
                  </code>
                  <button
                    className="btn"
                    onClick={() => navigator.clipboard.writeText(data.id)}
                    title={t(dict, "ui.result.copy_id", "Kopier ID")}
                    aria-label={t(dict, "ui.result.copy_id", "Kopier ID")}
                  >
                    {t(dict, "ui.result.copy_id", "Kopier ID")}
                  </button>

                  <p className="muted" style={{ marginTop: 8 }}>
                     {t( dict, "ui.result.disclaimer", "FallBack: This is not medical advice, but a general guide to help you spot patterns and try practical tips."  )}
        </p>
                  
                </div>
              </div>
              <div className="score-hero__right">
                <div
                  className="score-ring"
                  data-color={ringColor}
                  aria-label={t(dict, "ui.result.sleep_score", "Søvn-score")}
                  title={t(dict, "ui.result.sleep_score", "Søvn-score")}
                >
                  <div className="score-ring__value">{Number(data.sleepScore)}</div>
                  <div className="score-ring__label">
                    {t(dict, "ui.result.sleep_score", "Søvn-score")}
                  </div>
                </div>
              </div>
            </article>

            {/* Kategorier */}
            <section className="grid-cards mt-6">
              {entries.map(([cat, rawVal]) => {
                const raw = Number(rawVal);             // 0–100 (høyere = verre)
                const display = 100 - raw;              // visning 0–100 (høyere = bedre)
                const color = bucketColor(raw).replace("yellow", "orange") as "green" | "orange" | "red";
                const desc = t(dict, `category.${cat}.desc`, "");
                const lead = t(dict, `ui.result.lead.${color}`, "");

                // Velg tips lokalt (i18n keys), og filtrér vekk som ikke finnes i ordlista
                const tipKeys = pickTipKeys(cat, color).filter((k) => t(dict, k, "") !== "");

                // Artikkel-ikon (kun hvis vi har slug for kategorien)
                const articleSlug = ARTICLE_SLUG_BY_CAT[cat];
                const showArticleIcon = !!articleSlug;

                return (
                  <article key={cat} className="cat-card" data-color={color}>
                    <div className="cat-card__head">
                      <span className="pill" data-color={color}>
                        {t(dict, `category.${cat}.name`, String(cat))}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <strong className="cat-card__score">{display}</strong>
                        <span className="muted" style={{ fontSize: ".85rem" }}>
                          / 100
                        </span>
                      </div>
                    </div>

                    <p className="muted" style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>
                        <strong>{lead}</strong> {decapitalize(desc)}
                      </span>
                      {showArticleIcon && (
                        <a
                          href={`/articles/${articleSlug}`}
                          aria-label={t(dict, "ui.common.read", "Read")}
                          title={t(dict, "ui.common.read", "Read")}
                          style={{ display: "inline-flex", alignItems: "center" }}
                        >
                          {/* Link-ikon (inline SVG) */}
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
                            <path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Zm-4 4v2H5v10h10v-5h2v7H3V7h7Z"/>
                          </svg>
                        </a>
                      )}
                    </p>

                    {tipKeys.length > 0 && (
                      <>
                        <h4 className="mb-2 mt-6">
                          {t(dict, "ui.result.how_to_improve", "Hvordan forbedre dette:")}
                        </h4>
                        <ul className="tips-list">
                          {tipKeys.map((key) => (
                            <li key={`${cat}-${key}`}>
                              <span className="star">*</span> {t(dict, key, key)}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </article>
                );
              })}
            </section>

            {/* Flags – nøytral presentasjon uten emoji eller røde farger */}
            {(data.flags?.osaSignal || data.flags?.excessiveSleepiness || data.flags?.highBpRisk) && (
              <section className="panel mt-6" style={{ padding: 24 }}>
                <h2 className="mb-2" style={{ marginTop: 0 }}>{t(dict, "ui.result.title", "Resultat")}</h2>
                {data.flags?.osaSignal && (
                  <p>{t(dict, "flags.osa_signal")}</p>
                )}
                {data.flags?.excessiveSleepiness && (
                  <p>{t(dict, "flags.excessive_sleepiness")}</p>
                )}
                {data.flags?.highBpRisk && (
                  <p>
                    {t(
                      dict,
                      "flags.high_bp_risk",
                      "Several lifestyle factors point to an increased risk of high blood pressure. Consider measuring your blood pressure when you have the opportunity, especially if you have type 2 diabetes or close relatives with cardiovascular disease."
                    )}
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
