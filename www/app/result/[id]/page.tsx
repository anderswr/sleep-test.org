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
  totalRaw?: number;                           // 0–100 (høyere = verre)
  categoryScores: Record<string, number>;      // 0–100 (høyere = verre)
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

/** Build share links (URL + optional text) */
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
    // Instagram + TikTok: no web share URL; we fallback to navigator.share/copy
    instagram: url,
    tiktok: url,
  };
}

export default function ResultPage({ params }: { params: { id: string } }) {
  const { dict } = useI18n();
  const [data, setData] = useState<ResultDoc | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState<null | "copy" | "instagram" | "tiktok">(null);

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

  const ringColor =
    data
      ? (bucketColor(
          typeof data.totalRaw === "number" ? data.totalRaw : Math.max(0, 100 - Number(data.sleepScore))
        ).replace("yellow", "orange") as "green" | "orange" | "red")
      : "green";

  // Share text + URL for this specific result
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://www.sleep-test.org/result/${params.id}`;

  const shareText =
    data
      ? `I took a free sleep test and scored ${data.sleepScore}/100. Try your own anonymous test:`
      : `I took a free sleep test. Try your own anonymous test:`;

  const shareTargets = buildShareTargets(shareUrl, shareText);

  // Fallback action for IG/TikTok (and a general "copy" if you want to add later)
  async function shareOrCopy(kind: "instagram" | "tiktok" | "copy") {
    try {
      if (typeof navigator !== "undefined" && "share" in navigator && kind !== "copy") {
        // Try the native share sheet if available
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
            {/* TOPP: bredt kort */}
            <article className="panel head score-hero" style={{ padding: 24 }}>
              <div className="score-hero__left">
                <h1 className="mb-2">{t(dict, "ui.result.title", "Resultat")}</h1>

                {/* ID + Kopier-knapp */}
                <div className="row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <code
                    className="code-badge"
                    style={{
                      background: "var(--prose-code-bg, #f3f4f6)",
                      color: "var(--text)",
                      borderRadius: 8,
                      padding: "4px 8px",
                    }}
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
                </div>

                {/* Disclaimer */}
                <p style={{ marginTop: 12, color: "var(--muted)" }}>
                  {t(
                    dict,
                    "ui.result.disclaimer",
                    "This is not a medical evaluation, but a general guide to help you notice patterns and try practical steps."
                  )}
                </p>
              </div>

              <div className="score-hero__right">
                <div
                  className="score-ring"
                  data-color={ringColor}
                  aria-label={t(dict, "ui.result.sleep_score", "Søvn-score")}
                >
                  {/* Force white text in the ring */}
                  <div className="score-ring__value" style={{ color: "#fff" }}>
                    {Number(data.sleepScore)}
                  </div>
                  <div className="score-ring__label" style={{ color: "rgba(255,255,255,.85)" }}>
                    {t(dict, "ui.result.sleep_score", "Søvn-score")}
                  </div>
                </div>
              </div>
            </article>

            {/* Kategorier */}
            <section className="grid-cards mt-6">
              {entries.map(([cat, rawVal]) => {
                const raw = Number(rawVal);
                const display = 100 - raw;
                const color = bucketColor(raw).replace("yellow", "orange") as "green" | "orange" | "red";
                const desc = t(dict, `category.${cat}.desc`, "");
                const lead = t(dict, `ui.result.lead.${color}`, "");
                const tipKeys = pickTipKeys(cat, color).filter((k) => t(dict, k, "") !== "");
                const articleSlug = ARTICLE_SLUG_BY_CAT[cat];
                const showArticleIcon = !!articleSlug;

                return (
                  <article
                    key={cat}
                    className="cat-card"
                    data-color={color}
                    // Force white foreground for everything inside this tinted card
                    style={{ color: "#fff" }}
                  >
                    <div className="cat-card__head">
                      <span
                        className="pill"
                        data-color={color}
                        // ensure pill text is white too
                        style={{ color: "#fff" }}
                      >
                        {t(dict, `category.${cat}.name`, String(cat))}
                      </span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <strong className="cat-card__score" style={{ color: "#fff" }}>
                          {display}
                        </strong>
                        <span style={{ fontSize: ".85rem", color: "rgba(255,255,255,.75)" }}>
                          / 100
                        </span>
                      </div>
                    </div>

                    <p
                      style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "rgba(255,255,255,.9)",
                      }}
                    >
                      <span>
                        <strong style={{ color: "#fff" }}>{lead}</strong>{" "}
                        {decapitalize(desc)}
                      </span>
                      {showArticleIcon && (
                        <a
                          href={`/articles/${articleSlug}`}
                          aria-label={t(dict, "ui.common.read", "Read")}
                          title={t(dict, "ui.common.read", "Read")}
                          style={{ display: "inline-flex", alignItems: "center", color: "rgba(255,255,255,.85)" }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
                            <path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Zm-4 4v2H5v10h10v-5h2v7H3V7h7Z"/>
                          </svg>
                        </a>
                      )}
                    </p>

                    {tipKeys.length > 0 && (
                      <>
                        <h4 className="mb-2 mt-6" style={{ color: "#fff" }}>
                          {t(dict, "ui.result.how_to_improve", "Hvordan forbedre dette:")}
                        </h4>
                        <ul className="tips-list">
                          {tipKeys.map((key) => (
                            <li key={`${cat}-${key}`} style={{ color: "rgba(255,255,255,.92)" }}>
                              <span className="star" style={{ color: "rgba(255,255,255,.7)" }}>*</span>{" "}
                              {t(dict, key, key)}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </article>
                );
              })}
            </section>

            {/* Flags */}
            {(data.flags?.osaSignal || data.flags?.excessiveSleepiness || data.flags?.highBpRisk) && (
              <section className="panel mt-6" style={{ padding: 24 }}>
                <h2 className="mb-2" style={{ marginTop: 0 }}>
                  {t(dict, "ui.result.title", "Resultat")}
                </h2>
                {data.flags?.osaSignal && <p>{t(dict, "flags.osa_signal")}</p>}
                {data.flags?.excessiveSleepiness && <p>{t(dict, "flags.excessive_sleepiness")}</p>}
                {data.flags?.highBpRisk && (
                  <p>
                    {t(
                      dict,
                      "flags.high_bp_risk",
                      "Several lifestyle factors point to an increased risk of high blood pressure."
                    )}
                  </p>
                )}

                {/* Share bar */}
                <div className="share-bar" aria-label="Share" style={{ marginTop: 16 }}>
                  {/* Facebook */}
                  <a className="share-btn" href={shareTargets.facebook} target="_blank" rel="noopener" aria-label="Share on Facebook" title="Facebook">
                    {/* FB icon */}
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.86h2.77l-.44 2.91h-2.33v7.03C18.34 21.24 22 17.08 22 12.06Z"/>
                    </svg>
                  </a>

                  {/* X / Twitter */}
                  <a className="share-btn" href={shareTargets.x} target="_blank" rel="noopener" aria-label="Share on X" title="X">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M18.244 2H21l-6.54 7.47L22 22h-6.8l-4.78-6.2L4.8 22H2l7-8-6.6-8H9.4l4.28 5.56L18.244 2Z"/>
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a className="share-btn" href={shareTargets.linkedin} target="_blank" rel="noopener" aria-label="Share on LinkedIn" title="LinkedIn">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M6.94 6.5A2.44 2.44 0 1 1 4.5 4.06 2.44 2.44 0 0 1 6.94 6.5ZM3 8.5h6v12H3Zm8 0h5.76v1.64h.08A6.32 6.32 0 0 1 23 16.83V20.5h-6v-3.2c0-.76 0-1.74-1.06-1.74s-1.22.83-1.22 1.68v3.26h-6v-12h5Z"/>
                    </svg>
                  </a>

                  {/* Reddit */}
                  <a className="share-btn" href={shareTargets.reddit} target="_blank" rel="noopener" aria-label="Share on Reddit" title="Reddit">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M14.5 3.5a1 1 0 1 0 0 2l1.62.27-.53 2.5A7.2 7.2 0 0 0 12 8c-3.87 0-7 2.24-7 5s3.13 5 7 5 7-2.24 7-5a3 3 0 0 0-.28-1.25l1.05-.61A1.5 1.5 0 1 0 18 9.5l-1.08.62.43-2.04 1.93.33a1 1 0 1 0 .34-1.97l-3.12-.54ZM9 12a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 9 12Zm6 0a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 15 12Zm-6.2 3.38a.75.75 0 0 1 1.05.17c.47.64 1.49 1.05 2.65 1.05s2.18-.41 2.65-1.05a.75.75 0 1 1 1.22.88C15.66 17.38 14.13 18 12.5 18s-3.16-.62-4.07-1.57a.75.75 0 0 1 .17-1.05Z"/>
                    </svg>
                  </a>

                  {/* WhatsApp */}
                  <a className="share-btn" href={shareTargets.whatsapp} target="_blank" rel="noopener" aria-label="Share on WhatsApp" title="WhatsApp">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M12.04 2A9.96 9.96 0 0 0 2 11.97c0 1.76.46 3.41 1.27 4.85L2 22l5.33-1.25a9.96 9.96 0 0 0 4.71 1.22h.01A9.96 9.96 0 0 0 22 11.97C22 6.46 17.55 2 12.04 2Zm0 18.02h-.01A7.98 7.98 0 0 1 7.7 19l-.34-.2-3.16.74.7-3.08-.22-.32a8 8 0 1 1 7.36 4.88Zm4.52-5.87c-.25-.13-1.46-.72-1.69-.8-.23-.08-.4-.13-.57.13-.16.25-.65.8-.8.96-.15.16-.3.18-.55.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.24-.42.08-.16.04-.31-.02-.44-.06-.13-.57-1.38-.78-1.89-.21-.51-.42-.44-.57-.44l-.49-.01c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.11s.9 2.45 1.02 2.62c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.52.6.19 1.15.16 1.58.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z"/>
                    </svg>
                  </a>

                  {/* Telegram */}
                  <a className="share-btn" href={shareTargets.telegram} target="_blank" rel="noopener" aria-label="Share on Telegram" title="Telegram">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M9.04 14.86 8.9 18.1c.33 0 .48-.14.66-.31l1.59-1.52 3.3 2.42c.6.33 1.04.16 1.2-.55l2.17-10.2c.22-1.02-.37-1.42-1.04-1.17L3.7 9.74c-1 .39-.99.95-.17 1.2l3.46 1.08 8.02-5.07c.38-.25.73-.11.44.14l-6.41 5.76Z"/>
                    </svg>
                  </a>

                  {/* Email */}
                  <a className="share-btn" href={shareTargets.email} aria-label="Share via email" title="Email">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5Z"/>
                    </svg>
                  </a>

                  {/* Instagram (fallback share/copy) */}
                  <button className="share-btn" onClick={() => shareOrCopy("instagram")} aria-label="Share to Instagram (copy link)" title={copied==="instagram" ? "Copied!" : "Instagram"}>
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.8A5.2 5.2 0 1 0 17.2 13 5.2 5.2 0 0 0 12 7.8Zm0 8.4A3.2 3.2 0 1 1 15.2 13 3.2 3.2 0 0 1 12 16.2ZM18 6.7a1.3 1.3 0 1 0 1.3 1.3A1.3 1.3 0 0 0 18 6.7Z"/>
                    </svg>
                  </button>

                  {/* TikTok (fallback share/copy) */}
                  <button className="share-btn" onClick={() => shareOrCopy("tiktok")} aria-label="Share to TikTok (copy link)" title={copied==="tiktok" ? "Copied!" : "TikTok"}>
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <path fill="currentColor" d="M15.5 2h3.02c.24 2.1 1.41 3.6 3.48 4v3.03c-1.27.12-2.4-.16-3.5-.85v6.84c0 4.92-3.43 7.06-6.74 7.06-3.17 0-6.26-2.3-6.26-6.2 0-3.9 3.09-6.2 6.26-6.2.74 0 1.43.11 2.09.34v3.19c-.5-.16-1.04-.25-1.62-.25-1.76 0-3.24 1.15-3.24 2.92 0 1.77 1.48 2.92 3.24 2.92 1.51 0 2.93-.89 2.93-2.97V2Z"/>
                    </svg>
                  </button>
                </div>

                {copied && (
                  <div className="copy-toast" role="status" aria-live="polite">
                    Link copied to clipboard
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
      <style jsx>{`
        .share-bar {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .share-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid var(--border, #e5e7eb);
          background: var(--panel, #fff);
          color: var(--text, #111);
          transition: transform .06s ease, background .15s ease, opacity .15s ease;
        }
        .share-btn:hover,
        .share-btn:focus {
          transform: translateY(-1px);
          opacity: 0.9;
        }
        .copy-toast {
          margin-top: 10px;
          font-size: 0.875rem;
          color: var(--muted, #6b7280);
        }
        .score-ring {
          position: relative;
          width: 148px; height: 148px;
          border-radius: 999px;
          display: grid; place-items: center;
          background: var(--ring-bg, #111);
        }
        .score-ring[data-color="green"] { background: linear-gradient(135deg,#16a34a,#22c55e); }
        .score-ring[data-color="orange"] { background: linear-gradient(135deg,#f59e0b,#f97316); }
        .score-ring[data-color="red"] { background: linear-gradient(135deg,#ef4444,#dc2626); }
        .score-ring__value { font-size: 44px; font-weight: 700; }
        .score-ring__label { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }

        /* (… eksisterende styles beholdes overalt ellers) */
      `}</style>
    </div>
  );
}
