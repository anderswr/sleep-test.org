"use client";

import * as React from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { marked } from "marked";

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { lang } = useI18n();
  const [html, setHtml] = React.useState<string>("");
  const [notFound, setNotFound] = React.useState(false);
  const [usedLang, setUsedLang] = React.useState(lang);

  React.useEffect(() => {
    let alive = true;
    setNotFound(false);

    async function loadArticle() {
      async function fetchMd(l: string) {
        const res = await fetch(`/articles/${l}/${slug}.md`, { cache: "no-store" });
        if (!res.ok) return null;
        return await res.text();
      }

      // Prøv valgt språk først
      let md = await fetchMd(lang);
      let actualLang = lang;

      // Hvis ikke finnes, prøv fallback til engelsk
      if (!md) {
        md = await fetchMd("en");
        actualLang = "en";
      }

      if (!alive) return;
      if (!md) {
        setNotFound(true);
        setHtml("# Not found\nThis article is not available.");
      } else {
        setHtml(String(marked.parse(md)));
        setUsedLang(actualLang);
      }
    }

    loadArticle();
    return () => { alive = false; };
  }, [slug, lang]);

  return (
    <>
      <SiteHeader />
      <main className="container">
        {notFound ? (
          <div className="card">
            <h1>Not found</h1>
            <p className="muted">This article isn’t available in any language.</p>
          </div>
        ) : (
          <article
            className="card prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {/* Hint til bruker hvis fallback ble brukt */}
        {usedLang !== lang && !notFound && (
          <p className="muted" style={{ marginTop: 12 }}>
            (Showing English version – not yet available in your language)
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
