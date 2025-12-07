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
  sleepScore: number; // 0–100 (høyere = bedre)
  totalRaw?: number; // 0–100 (høyere = verre)
  categoryScores: Record<string, number>; // 0–100 (høyere = verre)
  flags?: { osaSignal?: boolean; excessiveSleepiness?: boolean; highBpRisk?: boolean };
  suggestedTips?: Record<string, string[]>;
};

function decapitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

const ARTICLE_SLUG_BY_CAT: Partial<Record<CategoryId, string>> = {
  [CategoryId.Pattern]: "pattern",
  [CategoryId.Insomnia]: "insomnia",
  [CategoryId.Quality]: "quality",
  [CategoryId.Daytime]: "daytime",
  [CategoryId.Hygiene]: "hygiene",
  [CategoryId.Environment]: "environment",
  [CategoryId.Breathing]: "breathing",
};

function pickTipKeys(cat: CategoryId, color: "green" | "orange" | "red"): string[] {
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
  return [];
}

function buildShareTargets(url: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    reddit: `https://www.reddit.com/submit?url=${u}&title=${t}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
    email: `mailto:?subject=${encodeURIComponent("Free Sleep Test result")}&body=${t}%0A%0A${u}`,
    instagram: url,
    tiktok: url,
  };
}

type ResultPageClientProps = { id: string };

export default function ResultPageClient({ id }: ResultPageClientProps) {
  const { dict } = useI18n();
  const [data, setData] = useState<ResultDoc | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState<null | "copy" | "instagram" | "tiktok">(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/result/${id}`, { cache: "no-store" });
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setNotFound(true);
      }
    })();
  }, [id]);

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

  const ringColor =
    data
      ? (bucketColor(
          typeof data.totalRaw === "number" ? data.totalRaw : Math.max(0, 100 - Number(data.sleepScore))
        ).replace("yellow", "orange") as "green" | "orange" | "red")
      : "green";

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://www.sleep-test.org/result/${id}`;

  const shareText =
    data
      ? `I took a free sleep test and scored ${data.sleepScore}/100. Try your own anonymous test:`
      : `I took a free sleep test. Try your own anonymous test:`;

  const shareTargets = buildShareTargets(shareUrl, shareText);

  async function shareOrCopy(kind: "instagram" | "tiktok" | "copy") {
    try {
      if (typeof navigator !== "undefined" && "share" in navigator && kind !== "copy") {
        // @ts-ignore
        await navigator.share({ title: "Sleep Test", text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(kind);
        setTimeout(() => setCopied(null), 1800);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setCopied(kind);
        setTimeout(() => setCopied(null), 1800);
      } catch {
        // ignore
      }
    }
  }

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
            <article className="panel head score-hero" style={{ padding: 24 }}>
              <div className="score-hero__left">
                <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>

                <div className="row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <code
                    className="code-badge"
                    style={{
                      background: "var(--prose-code-bg, #f3f4f6)",
                      color: "var(--text)",
                    }}
                  >
                    {id}
                  </code>

                  <button className="button" data-size="sm" onClick={() => shareOrCopy("copy")}>Copy link</button>

                  {copied === "copy" && (
                    <span className="muted" role="status" aria-live="polite">
                      Copied!
                    </span>
                  )}
                </div>

                <div className="score-hero__score" data-score-color={ringColor}>
                  <span className="score-hero__score-number">{Math.round(data.sleepScore)}</span>
                  <span className="score-hero__score-label">Sleep score</span>
                </div>
              </div>

              <div className="score-hero__right">
                <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
                  <button className="button" data-variant="secondary" onClick={() => shareOrCopy("instagram")}>
                    Share to Instagram
                  </button>
                  <button className="button" data-variant="secondary" onClick={() => shareOrCopy("tiktok")}>
                    Share to TikTok
                  </button>

                  {(copied === "instagram" || copied === "tiktok") && (
                    <span className="muted" role="status" aria-live="polite">
                      Copied!
                    </span>
                  )}
                </div>

                <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
                  <a className="button" data-variant="ghost" href={shareTargets.facebook} target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                  <a className="button" data-variant="ghost" href={shareTargets.x} target="_blank" rel="noreferrer">
                    X / Twitter
                  </a>
                  <a className="button" data-variant="ghost" href={shareTargets.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                  <a className="button" data-variant="ghost" href={shareTargets.reddit} target="_blank" rel="noreferrer">
                    Reddit
                  </a>
                  <a className="button" data-variant="ghost" href={shareTargets.whatsapp} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                  <a className="button" data-variant="ghost" href={shareTargets.telegram} target="_blank" rel="noreferrer">
                    Telegram
                  </a>
                  <a className="button" data-variant="ghost" href={shareTargets.email}>
                    Email
                  </a>
                </div>
              </div>
            </article>

            <section className="panel" style={{ padding: 24 }}>
              <h2 className="mb-2">{t(dict, "ui.result.suggestions.title", "Forbedringsområder")}</h2>
              <p className="muted mb-4">
                {t(dict, "ui.result.suggestions.subtitle", "Ditt resultat baseres på svarene dine, så fokuser på det som virker relevant for deg.")}
              </p>

              <div className="grid" style={{ gap: 16 }}>
                {entries.map(([cat, value]) => {
                  const color = (bucketColor(value).replace("yellow", "orange") as "green" | "orange" | "red") || "green";
                  const tipKeys = pickTipKeys(cat, color);

                  return (
                    <article key={cat} className={`card card--score card--${color}`}>
                      <header>
                        <div>
                          <p className="muted">{t(dict, `quiz.categories.${cat}`, cat)}</p>
                          <h3>
                            {t(dict, `ui.result.suggestions.score_${color}`, "Score")} {Math.round(100 - value)}/100
                          </h3>
                        </div>

                        {ARTICLE_SLUG_BY_CAT[cat] && (
                          <a href={`/articles/${ARTICLE_SLUG_BY_CAT[cat]}`} className="button" data-variant="ghost">
                            {t(dict, "ui.result.suggestions.read_more", "Les mer")}
                          </a>
                        )}
                      </header>

                      <div className="tips-grid">
                        {tipKeys.map((tip) => (
                          <div key={tip} className="tip">
                            <h4>{t(dict, `${tip}.title`, tip)}</h4>
                            <p>{t(dict, `${tip}.desc`, decapitalize(t(dict, `${tip}.title`, "")))}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
