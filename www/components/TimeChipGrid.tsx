"use client";

import * as React from "react";

type Props = {
  value?: string | null;                   // "HH:MM" (24t) eller null
  onChange: (val: string | null) => void;  // null = ikke fast/vet ikke
  showNotFixed?: boolean;
  notFixedLabel?: string;
};

function pad(n: number) {
  return n < 10 ? "0" + n : "" + n;
}

function makeTimes(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) out.push(`${pad(h)}:${pad(m)}`);
  }
  return out;
}
const TIMES = makeTimes();

export default function TimeChipGrid({
  value,
  onChange,
  showNotFixed = true,
  notFixedLabel = "Varierer / vet ikke",
}: Props) {
  return (
    <div className="timegrid">
      {showNotFixed && (
        <button
          type="button"
          className={`chip ${value === null ? "active" : ""}`}
          onClick={() => onChange(null)}
          aria-pressed={value === null}
        >
          {notFixedLabel}
        </button>
      )}
      <div className="scrollrow" role="listbox" aria-label="Tider i døgnet">
        {TIMES.map((t) => (
          <button
            key={t}
            type="button"
            role="option"
            aria-selected={value === t}
            className={`chip ${value === t ? "active" : ""}`}
            onClick={() => onChange(t)}
            title={t}
          >
            {t}
          </button>
        ))}
      </div>

      <style jsx>{`
        .timegrid { display: grid; gap: 10px; }
        .scrollrow {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: max-content;
          overflow-x: auto;
          gap: 8px;
          padding: 6px 0;
        }
        .chip {
          border: 1px solid var(--border);
          background: #fff;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 14px;
          box-shadow: var(--shadow);
          white-space: nowrap;
        }
        .chip.active {
          background: var(--primary-weak);
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
