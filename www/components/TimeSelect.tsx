// components/TimeSelect.tsx
"use client";

import * as React from "react";

type Props = {
  value?: string;                 // "HH:MM"
  onChange: (val: string) => void;
  label?: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export default function TimeSelect({ value, onChange, label }: Props) {
  const [h, m] = (value || "").split(":");
  const hour = HOURS.includes(h || "") ? h! : "";
  const minute = MINUTES.includes(m || "") ? m! : "";

  function updateHour(nh: string) {
    const next = `${nh}:${minute || "00"}`;
    onChange(next);
  }
  function updateMinute(nm: string) {
    const next = `${hour || "00"}:${nm}`;
    onChange(next);
  }

  return (
    <div className="time-select">
      {label && <div className="time-label">{label}</div>}
      <div className="time-grid">
        <div className="time-col">
          <div className="time-col-title">HH</div>
          <div className="time-buttons">
            {HOURS.map((hh) => (
              <button
                key={hh}
                type="button"
                className={`chip ${hour === hh ? "chip--active" : ""}`}
                onClick={() => updateHour(hh)}
              >
                {hh}
              </button>
            ))}
          </div>
        </div>
        <div className="time-col">
          <div className="time-col-title">MM</div>
          <div className="time-buttons">
            {MINUTES.map((mm) => (
              <button
                key={mm}
                type="button"
                className={`chip ${minute === mm ? "chip--active" : ""}`}
                onClick={() => updateMinute(mm)}
              >
                {mm}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="time-preview">
        {hour && minute ? `${hour}:${minute}` : "—:—"}
      </div>
    </div>
  );
}
