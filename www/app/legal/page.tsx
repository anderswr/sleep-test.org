import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function LegalPage() {
  const { dict } = useI18n();
  return (
    <>
      <SiteHeader />
      <main className="container">
        <article className="card">
          <h1>{t(dict,"ui.legal.title","Personvern, vilkår og kontakt")}</h1>
          <h2>{t(dict,"ui.legal.privacy","Personvern")}</h2>
          <p className="muted">{t(dict,"ui.legal.privacy_text","Vi lagrer kun svar og en teknisk ID. Ingen personopplysninger. Data kan slettes ved forespørsel (oppgi ID).")}</p>
          <h2>{t(dict,"ui.legal.terms","Vilkår")}</h2>
          <p className="muted">{t(dict,"ui.legal.terms_text","Tjenesten er veiledende og erstatter ikke helsehjelp. Ved bekymring: kontakt fastlege.")}</p>
          <h2>{t(dict,"ui.legal.contact","Kontakt")}</h2>
          <p className="muted">{t(dict,"ui.legal.contact_text","E-post: support@sleep-test.example")}</p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
