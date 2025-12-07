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

  const shareButtons = [
    { key: "facebook", label: "Facebook", href: shareTargets.facebook },
    { key: "x", label: "X", href: shareTargets.x },
    { key: "linkedin", label: "LinkedIn", href: shareTargets.linkedin },
    { key: "reddit", label: "Reddit", href: shareTargets.reddit },
    { key: "whatsapp", label: "WhatsApp", href: shareTargets.whatsapp },
    { key: "telegram", label: "Telegram", href: shareTargets.telegram },
    { key: "email", label: "Email", href: shareTargets.email },
  ];

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

                <p className="muted" style={{ marginBottom: 12 }}>
                  {t(
                    dict,
                    "ui.result.disclaimer",
                    "Dette er ikke en medisinsk vurdering, men en generell veiledning. Bruk rådene som passer deg."
                  )}
                </p>

                <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <code className="code-badge">{id}</code>

                  <button className="button" data-size="sm" onClick={() => shareOrCopy("copy")}>
                    {t(dict, "ui.result.copy_id", "Copy ID")}
                  </button>

                  {copied === "copy" && (
                    <span className="muted" role="status" aria-live="polite">
                      {t(dict, "ui.common.copied", "Copied!")}
                    </span>
                  )}
                </div>
              </div>

              <div className="score-hero__right">
                <div className="score-ring" data-color={ringColor}>
                  <div className="score-ring__value">{Math.round(data.sleepScore)}</div>
                  <div className="score-ring__label">{t(dict, "ui.result.sleep_score", "Sleep score")}</div>
                </div>

                <div className="pill" data-color={ringColor} style={{ marginTop: 10 }}>
                  {t(dict, `ui.result.suggestions.score_${ringColor}`, "Score")} / 100
                </div>
              </div>
            </article>

            <article className="card share-card" style={{ padding: 18 }}>
              <div className="share-card__grid">
                <div>
                  <p className="muted" style={{ marginBottom: 8 }}>
                    {t(dict, "ui.result.share", "Del rapporten")}
                  </p>
                  <div className="share-chip-row">
                    <button className="share-chip" onClick={() => shareOrCopy("instagram")}>
                      <span aria-hidden>
                        <IconInstagram />
                      </span>
                      <span>Instagram</span>
                    </button>
                    <button className="share-chip" onClick={() => shareOrCopy("tiktok")}>
                      <span aria-hidden>
                        <IconTiktok />
                      </span>
                      <span>TikTok</span>
                    </button>
                    <button className="share-chip" onClick={() => shareOrCopy("copy")}>
                      <span aria-hidden>
                        <IconLink />
                      </span>
                      <span>{t(dict, "ui.common.copy_link", "Copy link")}</span>
                    </button>
                    {(copied === "instagram" || copied === "tiktok" || copied === "copy") && (
                      <span className="muted" role="status" aria-live="polite">
                        {t(dict, "ui.common.copied", "Copied!")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="share-icons" aria-label={t(dict, "ui.result.share", "Share")}> 
                  {shareButtons.map((btn) => (
                    <a
                      key={btn.key}
                      className="share-icon"
                      href={btn.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={btn.label}
                      title={btn.label}
                    >
                      {renderShareIcon(btn.key)}
                    </a>
                  ))}
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
                  const displayScore = Math.max(0, Math.min(100, Math.round(100 - value)));

                  return (
                    <article key={cat} className={`card card--score card--${color}`} data-color={color}>
                      <header>
                        <div>
                          <p className="muted">{t(dict, `quiz.categories.${cat}`, cat)}</p>
                          <div className="score-chip" data-color={color}>
                            <span className="score-chip__value">{displayScore}</span>
                            <span className="score-chip__label">/100</span>
                          </div>
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

function renderShareIcon(key: string) {
  switch (key) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
          <path d="M21 12a9 9 0 1 0-10.41 8.91v-6.3H8.1V12h2.49V9.8c0-2.46 1.46-3.82 3.7-3.82 1.07 0 2.2.19 2.2.19v2.42h-1.24c-1.22 0-1.6.76-1.6 1.54V12h2.73l-.44 2.61h-2.29v6.3A9 9 0 0 0 21 12Z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
          <path d="M17.5 4h-2.2l-3 3.98L9.25 4H4.8l4.55 6.64L4.5 20h2.2l3.26-4.32L13.7 20h4.45l-4.86-7Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
          <path d="M5.5 4.25a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5ZM4 9h3v11H4Zm5.5 0h2.9v1.5h.04c.4-.76 1.4-1.56 2.9-1.56C18.9 8.94 20 10.38 20 12.9V20h-3v-6.3c0-1.5-.5-2.53-1.75-2.53-1.07 0-1.7.72-1.98 1.41-.1.23-.12.55-.12.87V20h-3Z" />
        </svg>
      );
    case "reddit":
      return (
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
          <path d="M18.67 11.6a2 2 0 1 0-3.27-2.1l-2.14-.46.57-2.67 1.86.4a1.26 1.26 0 1 0 .14-.68l-2.17-.47a.48.48 0 0 0-.58.36l-.7 3.3-2.7.58a2 2 0 1 0-3.08 2.02 3.62 3.62 0 0 0-.07.73c0 2.52 2.57 4.57 5.75 4.57s5.75-2.05 5.75-4.57c0-.23-.03-.46-.09-.68ZM7.4 10.3a.9.9 0 1 1 1.03 1.5A.9.9 0 0 1 7.4 10.3Zm5.1 5.76c-1.27 0-2.38-.5-2.98-1.25a.42.42 0 0 1 .65-.53c.4.48 1.17.78 2.03.78s1.63-.3 2.03-.78a.42.42 0 0 1 .66.53c-.6.75-1.72 1.25-2.99 1.25Zm2.07-3.76a.9.9 0 1 1 1.03-1.5.9.9 0 0 1-1.03 1.5Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
          <path d="M12.04 4a7 7 0 0 0-6.06 10.48L5 19l4.64-1.22A7 7 0 1 0 12.05 4Zm0 1.5a5.5 5.5 0 0 1 0 11h-.02c-.7 0-1.37-.14-2-.37l-.3-.11-2.77.72.74-2.63-.13-.27A5.5 5.5 0 0 1 12.05 5.5Zm2.75 8.06c-.15-.09-.9-.5-1.04-.55-.14-.05-.24-.08-.34.08-.1.15-.4.55-.5.67-.09.1-.18.11-.33.04-.15-.08-.63-.25-1.2-.78-.44-.39-.74-.86-.83-1-.09-.15-.01-.23.07-.31.07-.07.16-.18.24-.27.08-.09.11-.15.16-.26.05-.1.03-.2-.01-.28-.05-.09-.34-.82-.46-1.12-.12-.3-.24-.25-.34-.26h-.3c-.1 0-.27.04-.41.2-.14.15-.54.52-.54 1.27 0 .75.54 1.48.62 1.58.08.1 1.07 1.73 2.58 2.35.36.15.63.24.85.31.36.12.7.1.96.06.29-.04.9-.36 1.02-.7.13-.35.13-.65.09-.7-.03-.05-.12-.09-.27-.18Z" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
          <path d="M20.86 4.22a.75.75 0 0 0-.77-.12L3.8 11.4a.75.75 0 0 0 .04 1.37l4.36 1.67 1.67 4.36a.75.75 0 0 0 1.37.04l7.3-16.29a.75.75 0 0 0-.36-.95Zm-7.52 15.16-1.17-3.05 2.84-2.84a.75.75 0 0 0-.77-1.24l-3.69 1.39-2.7-1.03 11.19-4.98-5.7 11.75Z" />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
          <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5Zm1.5-.25a.25.25 0 0 0-.25.25v.26l6.25 3.9 6.25-3.9v-.26a.25.25 0 0 0-.25-.25h-12ZM18.5 17.5a.25.25 0 0 0 .25-.25v-7.9l-6 3.74a.75.75 0 0 1-.8 0l-6-3.74v7.9a.25.25 0 0 0 .25.25Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
          <path d="M12 4a5 5 0 0 1 3.96 8.04l-1.45 1.63a.75.75 0 0 1-1.12-1l1.45-1.63A3.5 3.5 0 1 0 8.5 8a.75.75 0 0 1-1.5 0A5 5 0 0 1 12 4Zm0 16a5 5 0 0 1-3.96-8.04l1.45-1.63a.75.75 0 1 1 1.12 1L9.16 12.96A3.5 3.5 0 1 0 15.5 16a.75.75 0 0 1 1.5 0A5 5 0 0 1 12 20Z" />
        </svg>
      );
  }
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
      <path d="M8.25 4.5h7.5A3.25 3.25 0 0 1 19 7.75v8.5A3.25 3.25 0 0 1 15.75 19h-7.5A3.25 3.25 0 0 1 5 16.25v-8.5A3.25 3.25 0 0 1 8.25 4.5Zm0 1.5A1.75 1.75 0 0 0 6.5 7.75v8.5c0 .97.78 1.75 1.75 1.75h7.5c.97 0 1.75-.78 1.75-1.75v-8.5c0-.97-.78-1.75-1.75-1.75h-7.5Zm8.5-.25a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.5A2.5 2.5 0 1 0 12 14a2.5 2.5 0 0 0 0-5Z" />
    </svg>
  );
}

function IconTiktok() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
      <path d="M14.75 4.25a.75.75 0 0 0-.75-.75h-2.5A.75.75 0 0 0 10.75 4v12.38a1.63 1.63 0 1 1-3.25 0 3.38 3.38 0 0 1 3.36-3.38.75.75 0 0 0 .64-.37l1.25-2.16c.27-.48-.07-1.07-.62-1.07h-.33a6.5 6.5 0 0 0-6.5 6.5 4.13 4.13 0 0 0 8.25 0V9.97c.97.79 2.2 1.28 3.53 1.28a.75.75 0 0 0 .75-.75V8.75a.75.75 0 0 0-.75-.75 2.75 2.75 0 0 1-2.73-2.26Z" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" aria-hidden>
      <path d="M8.75 5.5a3.25 3.25 0 0 0-2.3 5.56l1.1 1.1a.75.75 0 1 0 1.06-1.06l-1.1-1.1a1.75 1.75 0 0 1 2.48-2.47l1.4 1.4a1.75 1.75 0 0 1 0 2.48.75.75 0 0 0 1.06 1.06 3.25 3.25 0 0 0 0-4.6l-1.4-1.4A3.24 3.24 0 0 0 8.75 5.5Zm6.5 0a3.25 3.25 0 0 0-2.3 5.56l1.1 1.1a.75.75 0 0 0 1.06-1.06l-1.1-1.1a1.75 1.75 0 0 1 2.48-2.47l1.4 1.4a1.75 1.75 0 0 1 0 2.48.75.75 0 1 0 1.06 1.06 3.25 3.25 0 0 0 0-4.6l-1.4-1.4a3.24 3.24 0 0 0-2.3-.97Z" />
    </svg>
  );
}
