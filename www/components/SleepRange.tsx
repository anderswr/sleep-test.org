// components/SleepRange.tsx
"use client";

import * as React from "react";

type Props = {
  bedtime?: string;   // "HH:MM"
  waketime?: string;  // "HH:MM"
  onChange: (bed: string, wake: string) => void;
};

/** 48 steg (30-min). 0 = 00:00, 1 = 00:30 ... 47 = 23:30 */
function timeToIdx(t?: string) {
  if (!t) return undefined;
  const [hh, mm] = t.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return undefined;
  return (hh * 60 + (mm || 0)) / 30;
}
function idxToTime(idx: number) {
  const minutes = Math.round(idx) * 30;
  const hh = Math.floor(minutes / 60) % 24;
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function formatLabel(idx: number, mode24: boolean) {
  const t = idxToTime(idx);
  if (mode24) return t;
  let [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}
function clamp48(v: number) { return Math.max(0, Math.min(47, v)); }

export default function SleepRange({ bedtime, waketime, onChange }: Props) {
  // Default: 22:00 → 07:00
  const [mode24, setMode24] = React.useState(true);
  const [start, setStart] = React.useState<number>(() => timeToIdx(bedtime) ?? 44 /*22:00*/);
  const [end, setEnd]     = React.useState<number>(() => timeToIdx(waketime) ?? 14 /*07:00*/);

  const draggingRef = React.useRef<null | "start" | "end">(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  // Sync hvis props endres utenfra
  React.useEffect(() => {
    const si = timeToIdx(bedtime); if (si !== undefined) setStart(si);
    const ei = timeToIdx(waketime); if (ei !== undefined) setEnd(ei);
  }, [bedtime, waketime]);

  function onPointerDown(which: "start" | "end") {
    draggingRef.current = which;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }
  function onPointerMove(e: PointerEvent) {
    if (!draggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const idx = clamp48(Math.round(ratio * 47));
    if (draggingRef.current === "start") setStart(idx);
    else setEnd(idx);
  }
  function onPointerUp() {
    draggingRef.current = null;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    onChange(idxToTime(start), idxToTime(end));
  }

  // Segment (med wrap over midnatt)
  const segmentStyle: React.CSSProperties = end >= start
    ? { left: `${(start / 47) * 100}%`, width: `${((end - start) / 47) * 100}%` }
    : { left: 0, width: "100%", ["--mask-start" as any]: `${(end / 47) * 100}%`, ["--mask-end" as any]: `${(start / 47) * 100}%` };

  return (
    <div className="sleep-timeline">
      <div className="sleep-head">
        <div className="sleep-time">
          <div>
            <span className="sleep-chip">{formatLabel(start, mode24)}</span>
            <span className="sleep-chip sep">→</span>
            <span className="sleep-chip">{formatLabel(end, mode24)}</span>
          </div>
        </div>
        <div className="sleep-mode">
          <button type="button" className={`btn tiny ${mode24 ? "active" : ""}`} onClick={() => setMode24(true)} aria-pressed={mode24} title="24h">24h</button>
          <button type="button" className={`btn tiny ${!mode24 ? "active" : ""}`} onClick={() => setMode24(false)} aria-pressed={!mode24} title="12h">12h</button>
        </div>
      </div>

      <div className="sleep-track" ref={trackRef}>
        <div className={`sleep-segment ${end < start ? "wrap" : ""}`} style={segmentStyle} aria-hidden />
        <div className="sleep-ticks" aria-hidden>
          {Array.from({ length: 49 }, (_, i) => (
            <div key={i} className={`tick ${i % 4 === 0 ? "tick-lg" : "tick-sm"}`} />
          ))}
        </div>
        <button type="button" className="sleep-handle" style={{ left: `calc(${(start / 47) * 100}% - 10px)` }} onPointerDown={() => onPointerDown("start")} aria-label="Bedtime handle" />
        <button type="button" className="sleep-handle" style={{ left: `calc(${(end / 47) * 100}% - 10px)` }} onPointerDown={() => onPointerDown("end")} aria-label="Wake time handle" />
      </div>

      <div className="sleep-scale">
        {[0, 6, 12, 18].map((h) => (
          <span key={h}>
            {mode24
              ? `${String(h).padStart(2, "0")}:00`
              : h === 0 ? "12:00 AM"
              : h === 12 ? "12:00 PM"
              : h > 12 ? `${String(h - 12).padStart(2, "0")}:00 PM`
              : `${String(h).padStart(2, "0")}:00 AM`}
          </span>
        ))}
      </div>
    </div>
  );
}
