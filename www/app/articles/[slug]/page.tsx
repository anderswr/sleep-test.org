"use client";

import * as React from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

// If "marked" is missing, the try/catch gives a graceful fallback.
let markedParse: ((md: string) => string) | null = null;
async function ensureMarked() {
  if (markedParse) return markedParse;
  try {
    const { marked } = await import("marked");
    markedParse = (md: string) => String(marked.parse(md));
  } catch {
    // ultra-basic fallback: wrap paragraphs and preserve line breaks
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
  // plus any other slugs you add
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

        // load and parse markdown (lang -> fallback en)
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

        // optional: extract first heading as title (lines starting with "# ")
        const firstH1 = md.match(/^\s*#\s+(.+)$/m);
        const derivedTitle = firstH1?.[1]?.trim() ?? slug;

        if (!cancelled) {
          setTitle(derivedTitle);
          setHtml(parse(md));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, lang]);

  return (
    <>
      <SiteHeader />
      <main className="container">
        <article className="card prose max-w-none">
          <h1 className="mb-2">{title || t(dict, "ui.articles.card.title", "Article")}</h1>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
