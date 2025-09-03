"use client";

import * as React from "react";

/** Enkelt option-format som funker for string/number/null. */
export type ChipValue = string | number | null | undefined;

export type ChipOption = {
  value: ChipValue;     // string | number | null
  label: string;        // visningstekst
  title?: string;       // valgfri tooltip
};

type Props = {
  value?: ChipValue;
  onChange: (v: ChipValue) => void;

  /** Liste over valg (rekkefølgen brukes som er). */
  options: ChipOption[];

  /** Hvis satt, rendrer en ekstra chip først med value=null og denne labelen. */
  nullLabel?: string;

  /** ARIA-label/listbox-navn. */
  ariaLabel?: string;

  /** Størrelse på chip (bare litt mer padding). */
  size?: "md" | "lg";

  /** Deaktiver komponenten. */
  disabled?: boolean;

  /** Ekstra className på wrapperen. */
  className?: string;
};

export default function ChipSelect({
  value,
  onChange,
  options,
  nullLabel,
  ariaLabel,
  size = "md",
  disabled = false,
  className,
}: Props) {
  const merged: ChipOption[] = React.useMemo(() => {
    if (typeof nullLabel === "string") {
      return [{ value: null, label: nullLabel }, ...options];
    }
    return options;
  }, [options, nullLabel]);

  // <- Endret til HTMLElement, så funker både på div og button
  function handleKey(e: React.KeyboardEvent<HTMLElement>, idx: number) {
    if (disabled) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = Math.max(0, Math.min(merged.length - 1, idx + dir));
    const nextVal = merged[next]?.value;
    if (typeof nextVal !== "undefined") onChange(nextVal);
  }

  return (
    <div
      className={`chipselect ${className || ""}`}
      role="listbox"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
    >
      {merged.map((opt, i) => {
        const active = value === opt.value || (value == null && opt.value == null);
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="option"
            aria-selected={active}
            className={`chip ${active ? "active" : ""} ${size}`}
            title={opt.title}
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            onKeyDown={(e) => handleKey(e, i)}
          >
            {opt.label}
          </button>
        );
      })}

<style jsx>{`
  .chipselect {
    display: flex;              /* <- endret fra grid */
    flex-wrap: wrap;            /* pakk inn i flere rader på små skjermer */
    gap: 8px;
    padding: 6px 0;
    max-width: 100%;            /* aldri bredere enn container */
    min-width: 0;               /* tillat krymping */
    justify-content: center;    /* hold det på midten */
  }
  .chip {
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 14px;
    box-shadow: var(--shadow);
    white-space: nowrap;
    transition: background .15s, border-color .15s, transform .05s ease;
    flex: 0 0 auto;             /* ikke strekk chips */
  }
  .chip:hover:not(:disabled) { transform: translateY(-1px); }
  .chip.active {
    background: var(--primary-weak);
    border-color: var(--primary);
  }
  .chip.lg { padding: 10px 14px; font-size: 15px; }
  .chip:disabled { opacity: .6; cursor: not-allowed; }
`}</style>
    </div>
  );
}

/* Hjelpere for tider (hvis du vil generere HH:MM-ops eksternt):
--------------------------------------------------------------- */
export function makeHalfHourTimes(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    out.push(`${pad(h)}:00`);
    out.push(`${pad(h)}:30`);
  }
  return out;
}
export function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
export function timesToOptions(
  times: string[],
  titlePrefix?: string
): ChipOption[] {
  return times.map((t) => ({ value: t, label: t, title: titlePrefix ? `${titlePrefix} ${t}` : t }));
}
