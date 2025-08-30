// app/page.tsx
"use client";

import Link from "next/link";
import { useI18n } from "./providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function Home() {
  const { lang, setLang, dict } = useI18n();

  return (
    <main className="max-w-3xl mx-auto p-6">
      {/* Språkvelger */}
      <div className="flex justify-end gap-2 mb-6">
        <label className="sr-only" htmlFor="lang">
          {t(dict, "ui.home.language_label", "Language")}
        </label>
        <select
          id="lang"
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="nb">Norsk</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Tittel & ingress */}
      <h1 className="text-2xl font-semibold mb-2">
        {t(dict, "ui.home.title", "DMZ Sleep Test")}
      </h1>
      <p className="text-gray-600 mb-6">
        {t(dict, "ui.home.subtitle", "Start testen for å få en personlig rapport.")}
      </p>

      {/* CTA-er */}
      <div className="flex items-center gap-3">
        <Link
          href="/test"
          className="inline-block bg-black text-white px-4 py-2 rounded-lg"
        >
          {t(dict, "ui.home.cta", "Start test")}
        </Link>

        <Link
          href="/compare"
          className="inline-block border px-4 py-2 rounded-lg"
        >
          {t(dict, "ui.home.compare_cta", "Sammenlign resultater")}
        </Link>
      </div>

      {/* Liten forklaring */}
      <div className="mt-8 text-sm text-gray-500">
        {t(
          dict,
          "ui.home.note",
          "Du kan bytte språk når som helst. Svarene dine beholdes."
        )}
      </div>
    </main>
  );
}
