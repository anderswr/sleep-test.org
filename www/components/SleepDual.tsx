// components/SleepDual.tsx
"use client";

import * as React from "react";

type Props = {
  bedtime?: string;     // "HH:MM" 24h
  waketime?: string;    // "HH:MM" 24h
  onChange: (bed: string, wake: string) => void;  // kalles ved endring
};

const toIdx = (t?: string) => {
  if (!t) return 22 * 2; // 22:00
  const [hh, mm] = t.split(":").map(Number);
  return Math.min(47, Math.max(0, hh * 2 + (mm >= 30 ? 1 : 0)));
};
const idxToTime = (i: number) => {
  const hh = Math.floor(i / 2);
  const mm = (i % 2) === 1 ? 30 : 0;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};
const label = (i: number) => {
  const hh = Math.floor(i / 2);
  const mm = (i % 2) === 1 ? ":30" : ":00";
  return `${String(hh).padStart(2, "0")}${mm}`;
};

export default function SleepDual({ bedtime, waketime, onChange }: Props) {
  const [bed, setBed] = React.useState(toIdx(bedtime));
  const [wake, setWake] = React.useState(toIdx(waketime ?? "07:00"));

  React.useEffect(() => onChange(idxToTime(bed), idxToTime(wake)), [bed, wake]); // eslint-disable-line

  return (
    <div className="dual-wrap">
      <div className="dual-row">
        <div className="dual-label">
          <span>🛏️</span><strong>Leggetid</strong>
          <code className="chip">{label(bed)}</code>
        </div>
        <div className="dual-track">
          <input
            type="range"
            min={0}
            max={47}
            step={1}
            value={bed}
            onChange={(e) => setBed(Number(e.target.value))}
          />
          <div className="ticks">
            {Array.from({ length: 25 }, (_, h) => (
              <span key={h} style={{ left: `${(h/24)*100}%` }}>{String(h).padStart(2,"0")}:00</span>
            ))}
          </div>
        </div>
      </div>

      <div className="dual-row">
        <div className="dual-label">
          <span>⏰</span><strong>Opp-tid</strong>
          <code className="chip">{label(wake)}</code>
        </div>
        <div className="dual-track">
          <input
            type="range"
            min={0}
            max={47}
            step={1}
            value={wake}
            onChange={(e) => setWake(Number(e.target.value))}
          />
          <div className="ticks">
            {Array.from({ length: 25 }, (_, h) => (
              <span key={h} style={{ left: `${(h/24)*100}%` }}>{String(h).padStart(2,"0")}:00</span>
            ))}
          </div>
        </div>
      </div>

      <p className="muted" style={{marginTop:8}}>
        Tips: Hvis opp-tid er tidligere enn leggetid tolkes det som **neste dag** (nattevakt o.l. støttes).
      </p>
    </div>
  );
}
