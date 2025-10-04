// app/[lang]/layout.tsx
import { ReactNode } from "react";
import { LOCALES, langDir, DEFAULT_LOCALE, type Locale } from "@/lib/i18n-routing";

export function generateStaticParams() {
  return LOCALES.map((l) => ({ lang: l }));
}

export default function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: Locale };
}) {
  const { lang } = params;
  const dir = langDir(lang);

  // NB: <html> her overstyrer også data-attributter som I18nProvideren din leser.
  return (
    <html lang={lang} dir={dir} data-lang={lang} data-dir={dir} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
