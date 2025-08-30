// app/compare/page.tsx
"use client";
import React, { useState } from "react";

export default function ComparePage() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idA: a, idB: b }),
    });
    setData(await res.json());
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sammenlign</h1>

      <div className="flex flex-wrap gap-2">
        <input className="border rounded px-3 py-2" placeholder="ID A" value={a} onChange={(e) => setA(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="ID B" value={b} onChange={(e) => setB(e.target.value)} />
        <button className="bg-black text-white px-4 py-2 rounded" onClick={run} disabled={loading || !a || !b}>
          {loading ? "Kjører…" : "Kjør"}
        </button>
      </div>

      {data && !data.error && (
        <div className="space-y-2">
          <div className="text-sm">Δ totalRaw: {data.totalRawDiff}</div>
          <div className="text-sm">Δ sleepScore: {data.sleepScoreDiff}</div>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data.diffs, null, 2)}
          </pre>
        </div>
      )}

      {data?.error && <div className="text-red-600 text-sm">Feil: {data.error}</div>}
    </div>
  );
}
