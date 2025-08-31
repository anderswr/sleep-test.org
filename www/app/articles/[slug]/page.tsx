"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import * as React from "react";

const VALID = new Set(["fall-asleep", "screen-time"]);

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { lang } = useI18n();
  const [html, setHtml] = React.useState<string>("<h1>…</h1>");

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!VALID.has(slug)) {
        if (!cancelled) setHtml("<h1>Not found</h1>");
        return;
      }
      try {
        const res = await fetch(`/articles/${lang}/${slug}.md`, { cache: "no-store" });
        const md = res.ok ? await res.text() : "# Not found";
        // ⬇️ dynamic import so the client fetches 'marked' only in the browser
        const { marked } = await import("marked");
        const parsed = marked.parse(md) as string;
        if (!cancelled) setHtml(parsed);
      } catch {
        if (!cancelled) setHtml("<h1>Not found</h1>");
      }
    }
    run();
    return () => { cancelled = true; };
  }, [slug, lang]);

  return (
    <>
      <SiteHeader />
      <main className="container">
        <article className="card prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <SiteFooter />
    </>
  );
}
