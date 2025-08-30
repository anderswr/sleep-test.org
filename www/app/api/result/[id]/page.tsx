// app/result/[id]/page.tsx
import React from "react";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}/api/result/${params.id}`, { cache: "no-store" });
  const data = await res.json();

  if (data?.error) {
    return <div className="max-w-3xl mx-auto p-6">Fant ikke rapport med ID: {params.id}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Rapport</h1>
      <p><strong>ID:</strong> {data.id}</p>
      <p><strong>Søvn-score:</strong> {data.sleepScore} / 100</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(data.categoryScores || {}).map(([k, v]) => (
          <div key={k} className="text-sm border rounded p-2">
            <strong>{k}</strong>: {v}
          </div>
        ))}
      </div>

      {data.flags?.osaSignal && (
        <p className="text-red-600 text-sm">Mulige tegn på søvnapné – vurder å snakke med fastlege.</p>
      )}
      {data.flags?.excessiveSleepiness && (
        <p className="text-orange-600 text-sm">Uttalt søvnighet på dagtid – vær ekstra oppmerksom.</p>
      )}
    </div>
  );
}
