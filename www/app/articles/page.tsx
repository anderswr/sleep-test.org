"use client";

import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function ArticlesIndex() {
  const { dict } = useI18n();
  const items = [
    { slug: "fall-asleep", title: t(dict, "ui.articles.fall_asleep.title") },
    { slug: "screen-time", title: t(dict, "ui.articles.screen_time.title") },
  ];

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        <div className="card" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>{t(dict, "ui.menu.articles", "Articles")}</h1>
          <ul className="stack-2" style={{ marginTop: 12 }}>
            {items.map((it) => (
              <li key={it.slug} className="card" style={{ padding: 16 }}>
                <Link href={`/articles/${it.slug}`} className="font-semibold">
                  {it.title}
                </Link>
                <p className="muted" style={{ margin: 0 }}>{t(dict, `ui.articles.${it.slug}.excerpt`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
