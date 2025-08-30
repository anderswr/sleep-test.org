"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import * as React from "react";
import { marked } from "marked";

const VALID = new Set(["fall-asleep", "screen-time"]);

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { lang } = useI18n();
  const [html, setHtml] = React.useState<string>("# …");

  React.useEffect(() => {
    if (!VALID.has(slug)) {
      setHtml("# Not found");
      return;
    }
    fetch(`/articles/${lang}/${slug}.md`, { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.resolve("# Not found")))
      .then((md) => setHtml(String(marked.parse(md))));
  }, [slug, lang]);

  return (
    <>
      <SiteHeader />
      <main className="container">
        <article
          className="card prose max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
