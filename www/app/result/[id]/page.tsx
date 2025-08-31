import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { COLOR_THRESHOLDS, bucketColor } from "@/lib/scoring";
import { t } from "@/lib/i18n";
import { useI18n } from "@/app/providers/I18nProvider";

async function fetchResult(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}/api/result/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ResultPage({ params }: { params: { id: string } }) {
  const data = await fetchResult(params.id);

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ flex: "1 1 auto" }}>
        {!data ? (
          <div className="card" style={{ padding: 24 }}>Not found.</div>
        ) : (
          <ResultCard data={data} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}

// Client-ish formatting but in a server component (no hooks needed)
function ResultCard({ data }: { data: any }) {
  const dictCtx = require("@/app/providers/I18nProvider");
  const { t } = require("@/lib/i18n");
  // useI18n is client-only; for simplicity just render raw keys if SSR-only.
  return (
    <div className="card" style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Rapport</h1>
      <p className="muted" style={{ marginTop: 0 }}>ID: {data.id}</p>
      <div className="row" style={{ gap: 16, alignItems: "center" }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Søvn-score</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data.sleepScore} / 100</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, marginTop: 16 }}>
        {Object.entries(data.categoryScores || {}).map(([k, v]) => {
          const color = bucketColor(Number(v));
          const bg =
            color === "green" ? "#ecfdf5" : color === "yellow" ? "#fffbeb" : "#fef2f2";
          const border =
            color === "green" ? "#d1fae5" : color === "yellow" ? "#fde68a" : "#fecaca";
          return (
            <div key={k} className="card" style={{ background: bg, borderColor: border, padding: 16 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{k}</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{v}</div>
            </div>
          );
        })}
      </div>

      {data.flags?.osaSignal && (
        <p style={{ color: "#b91c1c", marginTop: 16 }}>Mulige tegn på søvnapné – vurder å snakke med fastlege.</p>
      )}
      {data.flags?.excessiveSleepiness && (
        <p style={{ color: "#b45309" }}>Uttalt søvnighet på dagtid – vær ekstra oppmerksom.</p>
      )}
    </div>
  );
}
