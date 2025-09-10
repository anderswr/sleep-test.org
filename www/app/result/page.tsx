// app/result/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

export default function ResultIndex() {
  const { dict } = useI18n();
  const [id, setId] = React.useState("");
  const router = useRouter();

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="container page-main">
        <section className="panel head" style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>
            {t(dict, "ui.result.title", "Fallback-Result")}
          </h1>
          <p className="muted">
            {t(dict, "ui.result.lookup_hint", "Fallback-Paste your ID to open your report.")}
          </p>

          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <input
              className="btn"
              style={{ flex: 1, textAlign: "left" }}
              placeholder={t(dict, "ui.result.id_placeholder", "fallback-Your ID")}
              value={id}
              onChange={(e) => setId(e.target.value.trim())}
              aria-label={t(dict, "ui.result.id_placeholder", "fallback2-Your ID")}
            />
            <button
              className="btn primary"
              onClick={() => id && router.push(`/result/${id}`)}
            >
              {t(dict, "ui.common.read", "Read")}
            </button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
