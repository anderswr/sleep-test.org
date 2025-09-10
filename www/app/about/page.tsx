// app/about/page.tsx
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

  // Les nøkler fra rot: "about.*" og "privacy.*"
  const aboutTitle = t(dict, "about.title", "About");
  const aboutIntro = t(dict, "about.intro", "");
  const contactTitle = t(dict, "about.contact.title", "");
  const contactP1 = t(dict, "about.contact.p1", "");
  const contactP2 = t(dict, "about.contact.p2", "");

  const privacyTitle = t(dict, "privacy.title", "");
  const privacyP1 = t(dict, "privacy.p1", "");
  const privacyList = renderList(dict, "privacy");

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        <article className="panel head" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>{aboutTitle}</h1>
          {aboutIntro && <p className="muted">{aboutIntro}</p>}

          {(privacyTitle || privacyP1 || privacyList) && (
            <section id="privacy" style={{ marginTop: 28 }}>
              {privacyTitle && <h2>{privacyTitle}</h2>}
              {privacyP1 && <p>{privacyP1}</p>}
              {privacyList}
            </section>
          )}

          {(contactTitle || contactP1 || contactP2) && (
            <section id="contact" style={{ marginTop: 28 }}>
              {contactTitle && <h2>{contactTitle}</h2>}
              {contactP1 && <p>{contactP1}</p>}
              {contactP2 && <p className="muted">{contactP2}</p>}
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
