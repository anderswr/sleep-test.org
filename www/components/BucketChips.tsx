"use client";

import * as React from "react";

type Bucket =
  | "<6" | "6-7" | "7-8" | "8-9" | "9-10" | ">10" | "unknown";

type Props = {
  value?: Bucket;
  onChange: (b: Bucket) => void;
  labels?: Partial<Record<Bucket, string>>;
};

const DEF: Record<Bucket, string> = {
  "<6": "<6t", "6-7": "6–7t", "7-8": "7–8t", "8-9": "8–9t",
  "9-10": "9–10t", ">10": ">10t", "unknown": "Vet ikke",
};

export default function BucketChips({ value, onChange, labels }: Props) {
  const L = { ...DEF, ...(labels || {}) };
  const order: Bucket[] = ["<6", "6-7", "7-8", "8-9", "9-10", ">10", "unknown"];
  return (
    <div className="scrollrow">
      {order.map((b) => (
        <button
          key={b}
          type="button"
          className={`chip ${value === b ? "active" : ""}`}
          onClick={() => onChange(b)}
        >
          {L[b]}
        </button>
      ))}
      <style jsx>{`
        .scrollrow {
          display: grid; grid-auto-flow: column; grid-auto-columns: max-content;
          overflow-x: auto; gap: 8px; padding: 6px 0;
        }
        .chip { border:1px solid var(--border); background:#fff; border-radius:999px; padding:8px 12px; box-shadow: var(--shadow); }
        .chip.active { background: var(--primary-weak); border-color: var(--primary); }
      `}</style>
    </div>
  );
}
