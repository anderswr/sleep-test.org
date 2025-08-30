// components/SleepHoursSlider.tsx
"use client";

import * as React from "react";

type Props = {
  value?: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function SleepHoursSlider({
  value = 7,
  onChange,
  min = 0,
  max = 12,
  step = 0.5
}: Props) {
  const [local, setLocal] = React.useState<number>(value);

  React.useEffect(() => { setLocal(value ?? 7); }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setLocal(v);
  }
  function handleCommit() {
    onChange(local);
  }

  const pct = Math.round(((local - min) / (max - min)) * 100);

  return (
    <div className="slider-wrap">
      <div className="slider-row">
        <input
          className="slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={local}
          onChange={handleChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          aria-label="Søvntimer pr natt"
        />
        <div className="bubble" style={{ left: `calc(${pct}% )` }}>
          {local.toFixed(1)}h
        </div>
      </div>
      <div className="slider-scale">
        <span>{min}h</span>
        <span>{max}h</span>
      </div>
    </div>
  );
}
