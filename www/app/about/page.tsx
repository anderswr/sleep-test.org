"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";
import React from "react";

function renderList(dict: any, baseKey: string, max = 20) {
  const items: string[] = [];
  for (let i = 1; i <= max; i++) {
    const k = `${baseKey}.li${i}`;
    const val = t(dict, k, "");
    if (val && String(val).trim().length > 0) {
      items.push(val);
    }
  }
  if (items.length === 0) return null;
  return (
    <ul>
      {items.map((val, idx) => (
        <li key={`${baseKey}-li-${idx}`}>{val}</li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  const { dict } = useI18n();

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        <article className="panel head" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>{t(dict, "ui.about.title", "About")}</h1>
          <p className="muted">{t(dict, "ui.about.intro")}</p>

          <section id="privacy" style={{ marginTop: 28 }}>
            <h2>{t(dict, "ui.about.privacy.title")}</h2>
            <p>{t(dict, "ui.about.privacy.p1")}</p>
            {renderList(dict, "ui.about.privacy")}
          </section>

          <section id="terms" style={{ marginTop: 28 }}>
            <h2>{t(dict, "ui.about.terms.title")}</h2>
            <p>{t(dict, "ui.about.terms.p1")}</p>
            {renderList(dict, "ui.about.terms")}
          </section>

          <section id="contact" style={{ marginTop: 28 }}>
            <h2>{t(dict, "ui.about.contact.title")}</h2>
            <p>{t(dict, "ui.about.contact.p1")}</p>
            <p className="muted">{t(dict, "ui.about.contact.p2")}</p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
