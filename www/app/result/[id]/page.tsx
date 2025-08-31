"use client";

import * as React from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { bucketColor } from "@/lib/scoring";
import { useI18n } from "@/app/providers/I18nProvider";
import { t } from "@/lib/i18n";

type CategoryId =
  | "pattern"
  | "insomnia"
  | "quality"
  | "daytime"
  | "hygiene"
  | "environment"
  | "breathing";

type CategoryScores = Partial<Record<CategoryId, number>>;

interface ResultDoc {
  id: string;
  sleepScore: number;
  totalRaw: number;
  categoryScores: CategoryScores;
  flags?: { osaSignal?: boolean; excessiveSleepiness?: boolean };
}

async function fetchResult(id: string): Promise<ResultDoc | null> {
  try {
    const res = await fetch(`/api/result/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ResultDoc;
  } catch {
    return null;
  }
}

export default function ResultPage({ params }: { params: { id: string } }) {
  const { dict } = useI18n();
  const [data, setData] = React.useState<ResultDoc | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchResult(params.id).then((d) => {
      if (mounted) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [params.id]);

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {loading && <div className="card" style={{ padding: 24 }}>…</div>}

        {!loading && !data && (
          <div className="card" style={{ padding: 24 }}>
            {t(dict, "ui.compare.notfound", "Not found.")}
          </div>
        )}

        {!loading && data && <ResultView data={data} dict={dict} />}
      </main>
      <SiteFooter />
    </>
  );
}

function ResultView({ data, dict }: { data: ResultDoc; dict: any }) {
  const catEntries = Object.entries(data.categoryScores || {}) as [CategoryId, number][];

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ margin: 0 }}>{t(dict, "ui.result.title", "Result")}</h1>
        <div className="muted">ID: {data.id}</div>
      </div>

      <div className="row" style={{ gap: 16, alignItems: "center", marginTop: 12 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {t(dict, "ui.result.sleep_score", "Sleep score")}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{Number(data.sleepScore)} / 100</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0,1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        {catEntries.map(([k, v]) => {
          const color = bucketColor(Number(v));
          const bg =
            color === "green" ? "#ecfdf5" : color === "yellow" ? "#fffbeb" : "#fef2f2";
          const border =
            color === "green" ? "#d1fae5" : color === "yellow" ? "#fde68a" : "#fecaca";
          return (
            <div
              key={k}
              className="card"
              style={{ background: bg, borderColor: border, padding: 16 }}
            >
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {t(dict, `category.${k}.name`, k)}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{Number(v)}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                {t(dict, `category.${k}.desc`, "")}
              </div>
            </div>
          );
        })}
      </div>

      {data.flags?.osaSignal && (
        <p style={{ color: "#b91c1c", marginTop: 16 }}>
          {t(dict, "flags.osa_signal")}
        </p>
      )}
      {data.flags?.excessiveSleepiness && (
        <p style={{ color: "#b45309" }}>{t(dict, "flags.excessive_sleepiness")}</p>
      )}
    </div>
  );
}
