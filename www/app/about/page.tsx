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
    const key = `${baseKey}.li${i}`;
    const val = t(dict, key, "");
    if (val && String(val).trim().length > 0) items.push(val);
  }
  if (items.length === 0) return null;
  return (
    <ul className="bullets">
      {items.map((val, idx) => (
        <li key={`${baseKey}-li-${idx}`}>{val}</li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  const { dict } = useI18n();

  // about.*
  const aboutTitle   = t(dict, "about.title", "About");
  const aboutIntro   = t(dict, "about.intro", "");
  const contactTitle = t(dict, "about.contact.title", "");
  const contactP1    = t(dict, "about.contact.p1", "");
  const contactP2    = t(dict, "about.contact.p2", "");

  // privacy.*
  const privacyTitle = t(dict, "privacy.title", "");
  const privacyP1    = t(dict, "privacy.p1", "");
  const privacyList  = renderList(dict, "privacy");

  const hasContact = !!(contactTitle || contactP1 || contactP2);
  const hasPrivacy = !!(privacyTitle || privacyP1 || privacyList);

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {/* Om / Kontakt */}
        <article className="panel head" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>{aboutTitle}</h1>
          {aboutIntro && <p className="muted">{aboutIntro}</p>}

          {hasContact && (
            <section id="contact" style={{ marginTop: 28 }}>
              {contactTitle && <h2>{contactTitle}</h2>}
              {contactP1 && <p>{contactP1}</p>}

              {/* P2 støtter HTML (f.eks. <a href="...">...</a>) via språkfilene */}
              {contactP2 && (
                <p
                  className="muted"
                  dangerouslySetInnerHTML={{ __html: contactP2 }}
                />
              )}
            </section>
          )}
        </article>

        {/* Personvern */}
        {hasPrivacy && (
          <article className="panel" style={{ padding: 24, marginTop: 16 }}>
            {privacyTitle && <h2 style={{ marginTop: 0 }}>{privacyTitle}</h2>}
            {privacyP1 && <p>{privacyP1}</p>}
            {privacyList}
          </article>
        )}

        <style jsx>{`
          .bullets {
            margin-top: 12px;
            padding-left: 20px;
          }
          .bullets li + li {
            margin-top: 6px;
          }
        `}</style>
      </main>
      <SiteFooter />
    </>
  );
}
