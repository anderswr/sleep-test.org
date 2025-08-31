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

  const title = t(dict, `ui.articles.${slug}.title`);
  const body: string[] = t(dict, `ui.articles.${slug}.body`) || [];

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        <article className="card prose" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>{title}</h1>
          {Array.isArray(body) ? body.map((p, i) => <p key={i}>{p}</p>) : <p>{String(body)}</p>}
          <h3 style={{ marginTop: 24 }}>{t(dict, "ui.articles.sources")}</h3>
          <ul>
            {(t(dict, `ui.articles.${slug}.sources`) || []).map((s: string, i: number) => (
              <li key={i}><a href={s} target="_blank" rel="noreferrer">{s}</a></li>
            ))}
          </ul>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
