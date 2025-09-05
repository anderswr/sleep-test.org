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
        <div className="content-narrow">
          <section className="panel head">
            <h1 style={{ marginTop: 0 }}>
              {t(dict, "ui.result.title", "Result")}
            </h1>
            <p className="muted">
              {t(
                dict,
                "ui.result.lookup_hint",
                "Paste your ID to open your report."
              )}
            </p>

            <div className="row" style={{ gap: 8 }}>
              <input
                className="border rounded px-3 py-2"
                style={{
                  flex: 1,
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                }}
                placeholder={t(dict, "ui.result.id_placeholder", "Your ID")}
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              <button
                className="btn primary"
                onClick={() => id && router.push(`/result/${id}`)}
              >
                {t(dict, "ui.common.read", "Read")}
              </button>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
