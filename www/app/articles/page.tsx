"use client";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function AboutPage() {
  const { dict } = useI18n();

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        <article className="card" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>{t(dict, "ui.about.title", "About")}</h1>
          <p className="muted">{t(dict, "ui.about.intro")}</p>

          <section id="privacy" style={{ marginTop: 28 }}>
            <h2>{t(dict, "ui.about.privacy.title")}</h2>
            <p>{t(dict, "ui.about.privacy.p1")}</p>
            <ul>
              <li>{t(dict, "ui.about.privacy.li1")}</li>
              <li>{t(dict, "ui.about.privacy.li2")}</li>
              <li>{t(dict, "ui.about.privacy.li3")}</li>
            </ul>
          </section>

          <section id="terms" style={{ marginTop: 28 }}>
            <h2>{t(dict, "ui.about.terms.title")}</h2>
            <p>{t(dict, "ui.about.terms.p1")}</p>
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
