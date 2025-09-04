"use client";

import * as React from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { marked } from "marked";

const VALID = new Set<string>(); // valgfritt: fylles ikke -> vi viser 404 for manglende filer via fetch-resultat

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { lang } = useI18n();
  const [html, setHtml] = React.useState<string>("<h1>…</h1>");
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setNotFound(false);
    fetch(`/articles/${lang}/${slug}.md`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          return { ok: false, body: "# Not found" };
        }
        const md = await r.text();
        return { ok: true, body: md };
      })
      .then(({ ok, body }) => {
        if (!alive) return;
        if (!ok) { setNotFound(true); setHtml(String(marked.parse(String(body)))); }
        else { setHtml(String(marked.parse(String(body)))); }
      });
    return () => { alive = false; };
  }, [slug, lang]);

  return (
    <>
      <SiteHeader />
      <main className="container">
        {notFound ? (
          <div className="card">
            <h1>Not found</h1>
            <p className="muted">This article isn’t available in the selected language (yet).</p>
          </div>
        ) : (
          <article className="card prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
