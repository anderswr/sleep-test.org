"use client";
import * as React from "react";

type Props = {
  value: number;                      // nåværende verdi (timer)
  onChange: (val: number) => void;    // callback ved endring
  max?: number;                       // default 12
  step?: number;                      // default 0.5
  ticks?: number[];                   // default [0,2,4,6,8,10,12]
};

export default function SleepHoursBand({
  value,
  onChange,
  max = 12,
  step = 0.5,
  ticks = [0, 2, 4, 6, 8, 10, 12],
}: Props) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="hours-wrap">
      <div className="hours-head">
        <strong>{value.toFixed(step < 1 ? 1 : 0)} h</strong>
      </div>

      <div className="hours-track">
        <div className="hours-fill" style={{ width: `${percent}%` }} />
        <input
          aria-label="Sleep hours per night"
          type="range"
          min={0}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="hours-ticks">
          {ticks.map((t) => (
            <span
              key={t}
              style={{ left: `${(t / max) * 100}%` }}
              className="hours-tick"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hours-wrap { display: grid; gap: 10px; }
        .hours-head { display:flex; align-items:center; gap:10px }
    .hours-track { position: relative; height: 42px; display: grid; align-items: center; }
    .hours-track input[type="range"] { width: 100%; appearance: none; background: transparent; position: relative; z-index: 2; }
    .hours-track input[type="range"]::-webkit-slider-runnable-track { height: 10px; background: transparent; }
    .hours-track input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--primary); border: 2px solid white; box-shadow: var(--shadow); margin-top: -4px; cursor: pointer; }
    .hours-track input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--primary); border: 2px solid white; cursor: pointer; }
    .hours-fill { position: absolute; z-index: 1; left: 0; top: 50%; transform: translateY(-50%); height: 10px; background: var(--primary-weak); border-radius: 999px; }
    .hours-track:before { content: ""; position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); height: 10px; background: #f3f4f6; border-radius: 999px; z-index: 0; }
    .hours-ticks { position: absolute; left: 0; right: 0; bottom: -2px; transform: translateY(100%); height: 18px; pointer-events: none; }
    .hours-tick { position: absolute; transform: translateX(-50%); font-size: .8rem; color: var(--muted); }
      `}</style>
    </div>
  );
}
