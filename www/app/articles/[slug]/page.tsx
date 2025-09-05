// app/articles/[slug]/page.tsx
"use client";

import * as React from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

// Lazy import av marked, med enkel fallback hvis pakken mangler
let markedParse: ((md: string) => string) | null = null;
async function ensureMarked() {
  if (markedParse) return markedParse;
  try {
    const { marked } = await import("marked");
    markedParse = (md: string) => String(marked.parse(md));
  } catch {
    markedParse = (md: string) =>
      md
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("\n");
  }
  return markedParse;
}

const VALID = new Set<string>([
  "pattern",
  "insomnia",
  "quality",
  "daytime",
  "hygiene",
  "environment",
  "breathing",
]);

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { dict, lang } = useI18n();
  const [html, setHtml] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        if (!VALID.has(slug)) {
          if (!cancelled) {
            setTitle("Not found");
            setHtml("<p>Not found</p>");
          }
          return;
        }

        const parse = await ensureMarked();

        async function fetchMD(l: string) {
          const res = await fetch(`/articles/${l}/${slug}.md`, { cache: "no-store" });
          return res.ok ? res.text() : null;
        }

        let md = await fetchMD(lang);
        if (!md) md = await fetchMD("en");
        if (!md) {
          if (!cancelled) {
            setTitle("Not found");
            setHtml("<p>Not found</p>");
          }
          return;
        }

        // Ta første H1 som tittel og fjern den fra selve innholdet
        const h1Match = md.match(/^\s*#\s+(.+)\s*$/m);
        const derivedTitle = h1Match?.[1]?.trim() ?? slug;
        const mdWithoutFirstH1 = h1Match ? md.replace(h1Match[0], "").trimStart() : md;

        if (!cancelled) {
          setTitle(derivedTitle);
          setHtml(parse(mdWithoutFirstH1));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug, lang]);

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="container page-main">
        <div className="content-narrow">
          <article className="panel head">
            <h1 className="mb-2">{title || t(dict, "ui.articles.card.title", "Article")}</h1>
            {loading ? (
              <p className="muted">Loading…</p>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
