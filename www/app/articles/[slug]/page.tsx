"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import * as React from "react";

const VALID = new Set(["fall-asleep", "screen-time"]);

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { dict } = useI18n();

  if (!VALID.has(slug)) {
    return (
      <>
        <SiteHeader />
        <main className="container" style={{ flex: "1 1 auto" }}>
          <div className="card" style={{ padding: 24 }}>Not found.</div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const title = String(t(dict, `ui.articles.${slug}.title`));

  // Normalize body to string[]
  const bodyRaw = t(dict, `ui.articles.${slug}.body`);
  const body: string[] = Array.isArray(bodyRaw)
    ? (bodyRaw as string[])
    : bodyRaw
    ? [String(bodyRaw)]
    : [];

  // Normalize sources to string[]
  const sourcesRaw = t(dict, `ui.articles.${slug}.sources`);
  const sources: string[] = Array.isArray(sourcesRaw)
    ? (sourcesRaw as string[])
    : sourcesRaw
    ? [String(sourcesRaw)]
    : [];

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        <article className="card prose" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>{title}</h1>

          {body.length > 0 ? (
            body.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>…</p>
          )}

          {sources.length > 0 && (
            <>
              <h3 style={{ marginTop: 24 }}>{t(dict, "ui.articles.sources")}</h3>
              <ul>
                {sources.map((s, i) => (
                  <li key={i}>
                    <a href={s} target="_blank" rel="noreferrer">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
