"use client";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

const POSTS = [
  { slug: "fall-asleep", key: "articles.fall_asleep" },
  { slug: "screen-time", key: "articles.screen_time" },
];

export default function ArticlesIndex() {
  const { dict, lang } = useI18n();
  return (
    <>
      <SiteHeader />
      <main className="container">
        <h1>Artikler</h1>
        <section className="grid-cards mt-6">
          {POSTS.map((p) => (
            <article key={p.slug} className="card">
              <h3>{t(dict, `${p.key}.title`)}</h3>
              <p className="muted">{t(dict, `${p.key}.desc`)}</p>
              <Link className="btn" href={`/articles/${p.slug}`}>{t(dict,"ui.common.read","Les")}</Link>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
