// components/SleepHoursBand.tsx
"use client";

import * as React from "react";

type Props = {
  value?: number;           // 0–12 (vi begrenser visuelt 0–12)
  onChange: (val: number) => void;
};

const MIN = 0;
const MAX = 12;
const STEP = 0.5;

export default function SleepHoursBand({ value = 7, onChange }: Props) {
  const [val, setVal] = React.useState(value);
  React.useEffect(() => setVal(value), [value]);

  const pct = ((val - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="sleep-timeline">
      <div className="sleep-head">
        <div className="sleep-time">
          <span className="sleep-chip">{val.toFixed(1)} h</span>
        </div>
        <div className="sleep-mode" />
      </div>

      <div className="sleep-track" style={{ height: 46, position: "relative" }}>
        {/* fyll-segment fra 0 -> val */}
        <div className="sleep-segment" style={{ left: 0, width: `${pct}%` }} aria-hidden />
        {/* ticks hver time (0..12) */}
        <div className="sleep-ticks" aria-hidden style={{ gridTemplateColumns: `repeat(${(MAX - MIN) * 2}, 1fr)` }}>
          {Array.from({ length: (MAX - MIN) * 2 + 1 }, (_, i) => (
            <div key={i} className={`tick ${i % 2 === 0 ? "tick-lg" : "tick-sm"}`} />
          ))}
        </div>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          onPointerUp={() => onChange(val)}
          onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") onChange(val); }}
          aria-label="Sleep hours slider"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer"
          }}
        />
        {/* “handle” som følger verdien (visuell markør) */}
        <div className="sleep-handle" style={{ left: `calc(${pct}% - 10px)` }} aria-hidden />
      </div>

      <div className="sleep-scale">
        {[0, 3, 6, 9, 12].map((h) => (<span key={h}>{h}h</span>))}
      </div>
    </div>
  );
}
