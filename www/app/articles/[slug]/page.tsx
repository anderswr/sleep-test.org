"use client";

import * as React from "react";
import Link from "next/link";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import { marked } from "marked";

type ArticleItem = { slug: string; title: string; summary: string };

async function fetchIndex(lang: string): Promise<ArticleItem[]> {
  const r = await fetch(`/articles/${lang}/index.json`, { cache: "no-store" });
  if (!r.ok) throw new Error("index");
  return r.json();
}

async function fetchMd(lang: string, slug: string): Promise<string> {
  const r = await fetch(`/articles/${lang}/${slug}.md`, { cache: "no-store" });
  if (!r.ok) throw new Error("md");
  return r.text();
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { lang } = useI18n();
  const [html, setHtml] = React.useState<string>(""); 
  const [title, setTitle] = React.useState<string>("");
  const [fellBack, setFellBack] = React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      async function tryLoad(l: string) {
        const [index, md] = await Promise.all([
          fetchIndex(l),
          fetchMd(l, params.slug),
        ]);
        const item = index.find(i => i.slug === params.slug);
        return { md, title: item?.title ?? params.slug };
      }

      try {
        const { md, title } = await tryLoad(lang);
        if (!cancelled) { setTitle(title); setHtml(String(marked.parse(md))); setFellBack(false); }
      } catch {
        try {
          const { md, title } = await tryLoad("en");
          if (!cancelled) { setTitle(title); setHtml(String(marked.parse(md))); setFellBack(true); }
        } catch {
          if (!cancelled) {
            setTitle("Not found");
            setHtml(String(marked.parse("# Not found")));
            setFellBack(false);
          }
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [lang, params.slug]);

  return (
    <main className="container">
      <nav className="mb-4">
        <Link className="btn" href="/articles">← Back</Link>
      </nav>
      <article className="card prose max-w-none" dangerouslySetInnerHTML={{ __html: html || "" }} />
      {fellBack && (
        <p className="muted mt-6">
          (Showing English version because the article is not available in the selected language.)
        </p>
      )}
    </main>
  );
}
