"use client";

import * as React from "react";

export type ShiftWork = "none" | "rotating" | "night" | "evening_morning";

type Props = {
  value?: ShiftWork;
  onChange: (v: ShiftWork) => void;
  labels?: Partial<Record<ShiftWork, string>>;
};

const DEF: Record<ShiftWork, string> = {
  none: "Nei",
  rotating: "Roterende",
  night: "Natt",
  evening_morning: "Kveld/Morgen",
};

export default function ShiftChips({ value, onChange, labels }: Props) {
  const L = { ...DEF, ...(labels || {}) };
  const order: ShiftWork[] = ["none", "rotating", "night", "evening_morning"];
  return (
    <div className="scrollrow">
      {order.map((v) => (
        <button
          key={v}
          type="button"
          className={`chip ${value === v ? "active" : ""}`}
          onClick={() => onChange(v)}
        >
          {L[v]}
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
