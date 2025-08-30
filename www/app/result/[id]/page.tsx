// app/result/[id]/page.tsx
import React from "react";

type ResultDoc = {
  id: string;
  sleepScore: number;
  categoryScores?: Record<string, number>;
  flags?: { osaSignal?: boolean; excessiveSleepiness?: boolean };
};

export default async function ResultPage({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${base}/api/result/${params.id}`, { cache: "no-store" });
  const data = (await res.json()) as ResultDoc | { error: string };

  if ("error" in data) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        Fant ikke rapport med ID: <code className="px-1 py-0.5 bg-gray-100 rounded">{params.id}</code>
      </div>
    );
  }

  const entries: Array<[string, number]> = Object.entries(data.categoryScores || {}) as Array<[string, number]>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Rapport</h1>

      <p>
        <strong>ID:</strong>{" "}
        <code className="px-1 py-0.5 bg-gray-100 rounded">{data.id}</code>
      </p>

      <p>
        <strong>Søvn-score:</strong> {Number(data.sleepScore)} / 100
      </p>

      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {entries.map(([k, v]) => (
            <div key={k} className="text-sm border rounded p-2">
              <strong>{String(k)}</strong>: {Number(v)}
            </div>
          ))}
        </div>
      )}

      {data.flags?.osaSignal && (
        <p className="text-red-600 text-sm">
          Mulige tegn på søvnapné – vurder å snakke med fastlege.
        </p>
      )}
      {data.flags?.excessiveSleepiness && (
        <p className="text-orange-600 text-sm">
          Uttalt søvnighet på dagtid – vær ekstra oppmerksom.
        </p>
      )}
    </div>
  );
}
