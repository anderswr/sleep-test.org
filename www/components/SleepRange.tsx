// components/SleepRange.tsx
"use client";

import * as React from "react";

type Props = {
  bedtime?: string;                 // "HH:MM" (24h)
  waketime?: string;                // "HH:MM" (24h)
  onChange: (bed: string, wake: string) => void;     // kalles hver gang noe flyttes
  onBothSet?: (bed: string, wake: string) => void;   // kalles når begge er satt (slipp)
};

/** 96 steg (30-min) over 48 timer. 0 = dag0 00:00 … 95 = dag1 23:30 */
const STEPS = 96;

function clamp(v: number, min = 0, max = STEPS - 1) {
  return Math.max(min, Math.min(max, v));
}

function toIdx(t?: string) {
  if (!t) return undefined;
  const [hh, mm] = t.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return undefined;
  return clamp(Math.round((hh * 60 + (mm || 0)) / 30));
}
function idxToTime(idx: number) {
  // idx er 0..95, men vi ønsker tidspunkt i døgnet (00:00..23:30)
  const minutes = (idx % 48) * 30; // 0..47 → 0..1410
  const hh = Math.floor(minutes / 60) % 24;
  const mm = minutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function label(idxIn48: number, mode24: boolean) {
  const minutes = idxIn48 * 30;
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (mode24) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const ampm = h >= 12 ? "PM" : "AM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function SleepRange({ bedtime, waketime, onChange, onBothSet }: Props) {
  // Default: 22:00 → 07:00 (+9 timer)
  const [mode24, setMode24] = React.useState(true);
  const [start, setStart] = React.useState<number>(() => toIdx(bedtime) ?? 44);
  const [end, setEnd] = React.useState<number>(() => {
    const w = toIdx(waketime);
    if (w === undefined) return 44 + 18 > 95 ? (44 + 18) - 48 : 44 + 18; // 07:00 i 48h-index med wrap
    // sørg for at end > start i 48h rommet
    let e = w;
    if (e <= (toIdx(bedtime) ?? 44)) e += 48;
    return clamp(e, 0, 95);
  });

  const [touchedStart, setTouchedStart] = React.useState(false);
  const [touchedEnd, setTouchedEnd] = React.useState(false);

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef<null | "start" | "end">(null);

  // Sync hvis props oppdateres utenfra
  React.useEffect(() => {
    const s = toIdx(bedtime);
    if (s !== undefined) setStart(s);
    const w = toIdx(waketime);
    if (w !== undefined) {
      let e = w;
      if (e <= (s ?? start)) e += 48;
      setEnd(clamp(e, 0, 95));
    }
  }, [bedtime, waketime]);

  // kall parent ved hver lokal endring
  React.useEffect(() => {
    onChange(idxToTime(start), idxToTime(end));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  function posToIdx(clientX: number) {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return clamp(Math.round(ratio * (STEPS - 1)));
  }

  function onPointerDown(which: "start" | "end") {
    draggingRef.current = which;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  }
  function onPointerMove(e: PointerEvent) {
    const idx = posToIdx(e.clientX);
    if (!draggingRef.current) return;
    if (draggingRef.current === "start") {
      setTouchedStart(true);
      // Behold lengden når man krysser
      let s = idx;
      if (s >= end) {
        // flytter hele vinduet frem
        const span = end - start;
        setEnd(clamp(s + span));
      }
      setStart(s);
    } else {
      setTouchedEnd(true);
      let eIdx = idx;
      if (eIdx <= start) eIdx = start + 1; // alltid etter start
      setEnd(clamp(eIdx));
    }
  }
  function onPointerUp() {
    draggingRef.current = null;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    if (touchedStart && touchedEnd && onBothSet) {
      onBothSet(idxToTime(start), idxToTime(end));
    }
  }

  const startPct = (start / (STEPS - 1)) * 100;
  const endPct = (end / (STEPS - 1)) * 100;

  return (
    <div className="sleep-timeline">
      <div className="sleep-head">
        <div className="sleep-time">
          <span className="sleep-chip">{label(start % 48, mode24)}</span>
          <span className="sleep-chip sep">→</span>
          <span className="sleep-chip">{label(end % 48, mode24)}</span>
        </div>
        <div className="sleep-mode">
          <button type="button" className={`btn tiny ${mode24 ? "active" : ""}`} onClick={() => setMode24(true)} aria-pressed={mode24}>24h</button>
          <button type="button" className={`btn tiny ${!mode24 ? "active" : ""}`} onClick={() => setMode24(false)} aria-pressed={!mode24}>12h</button>
        </div>
      </div>

      <div className="sleep-track" ref={trackRef}>
        {/* segment */}
        <div className="sleep-segment" style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }} aria-hidden />
        {/* ticks: hver 30 min, større hver 2. time */}
        <div className="sleep-ticks" aria-hidden style={{ gridTemplateColumns: `repeat(${STEPS}, 1fr)` }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <div key={i} className={`tick ${(i % 4 === 0) ? "tick-lg" : "tick-sm"}`} />
          ))}
        </div>
        {/* handles */}
        <button type="button" className="sleep-handle" style={{ left: `calc(${startPct}% - 10px)` }} onPointerDown={() => onPointerDown("start")} aria-label="Bedtime handle" />
        <button type="button" className="sleep-handle" style={{ left: `calc(${endPct}% - 10px)` }} onPointerDown={() => onPointerDown("end")} aria-label="Wake time handle" />
      </div>

      {/* akseetiketter over 48h (hver 6. time) */}
      <div className="sleep-scale">
        {[0, 12, 24, 36, 48, 60, 72, 84].map((i) => (
          <span key={i}>
            {mode24
              ? label(i % 48, true) + (i >= 48 ? " (+1)" : "")
              : label(i % 48, false) + (i >= 48 ? " (+1)" : "")}
          </span>
        ))}
      </div>
    </div>
  );
}
