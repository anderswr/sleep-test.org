// app/page.tsx
"use client";

import Link from "next/link";
import { useI18n } from "./providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function Home() {
  const { lang, setLang, dict } = useI18n();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex justify-end gap-2 mb-6">
        <label className="sr-only" htmlFor="lang">Language</label>
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

      <h1 className="text-2xl font-semibold mb-2">
        {t(dict, "ui.home.title", "DMZ Sleep Test")}
      </h1>
      <p className="text-gray-600 mb-6">
        {t(dict, "ui.home.subtitle", "Start testen for å få en personlig rapport.")}
      </p>

      <Link href="/test" className="inline-block bg-black text-white px-4 py-2 rounded-lg">
        {t(dict, "ui.home.cta", "Start test")}
      </Link>
    </main>
  );
}
