"use client";

import * as React from "react";

type Props = {
  value?: number | null;                 // i timer (0.5, 1.5, 2.5, 3.5, 4.5) eller null=ikke relevant
  onChange: (v: number | null) => void;
  labels?: { le1?: string; b1_2?: string; b2_3?: string; b3_4?: string; gt4?: string; na?: string };
};

export default function DiffChips({ value, onChange, labels }: Props) {
  const L = {
    le1: labels?.le1 || "≤1t",
    b1_2: labels?.b1_2 || "1–2t",
    b2_3: labels?.b2_3 || "2–3t",
    b3_4: labels?.b3_4 || "3–4t",
    gt4: labels?.gt4 || ">4t",
    na: labels?.na || "Ikke relevant",
  };
  const opts: { v: number | null; label: string }[] = [
    { v: 0.5, label: L.le1 },
    { v: 1.5, label: L.b1_2 },
    { v: 2.5, label: L.b2_3 },
    { v: 3.5, label: L.b3_4 },
    { v: 4.5, label: L.gt4 },
    { v: null, label: L.na },
  ];
  return (
    <div className="scrollrow">
      {opts.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          className={`chip ${value === o.v ? "active" : ""}`}
          onClick={() => onChange(o.v)}
        >
          {o.label}
        </button>
      ))}
      <style jsx>{`
        .scrollrow { display:grid; grid-auto-flow:column; grid-auto-columns:max-content; overflow-x:auto; gap:8px; padding:6px 0; }
        .chip { border:1px solid var(--border); background:#fff; border-radius:999px; padding:8px 12px; box-shadow:var(--shadow); }
        .chip.active { background:var(--primary-weak); border-color:var(--primary); }
      `}</style>
    </div>
  );
}
