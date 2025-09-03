// components/ThumbLikert.tsx
"use client";

import * as React from "react";

type ThumbVal = "yes" | "no" | "unknown";

type Props = {
  value?: ThumbVal;                 // "yes" | "no" | "unknown"
  onChange: (v: ThumbVal) => void;  // kalles umiddelbart ved valg
  ariaLabel?: string;
  disabled?: boolean;
};

export default function ThumbLikert({
  value = "unknown",
  onChange,
  ariaLabel = "Blood pressure diagnosed",
  disabled = false,
}: Props) {
  const opts: { val: ThumbVal; label: string; emoji: string }[] = [
    { val: "no",  label: "Nei", emoji: "👎" },
    { val: "yes", label: "Ja",  emoji: "👍" },
  ];

  function commit(v: ThumbVal) {
    if (!disabled) onChange(v); // <-- alltid fyr, ingen likhetsvakt
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    const idx = Math.max(0, opts.findIndex((o) => o.val === value));
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = (idx + dir + opts.length) % opts.length;
      commit(opts[next].val);
    }
  }

  return (
    <div
      className="smiley-group"
      role="listbox"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      onKeyDown={onKeyDown}
    >
      {opts.map((o) => {
        const selected = value === o.val;
        return (
          <button
            key={o.val}
            type="button"
            role="option"
            aria-selected={selected}
            className={`smiley-btn ${selected ? "is-selected" : ""}`}
            disabled={disabled}
            onClick={() => commit(o.val)}
          >
            <span className="smiley-emoji" aria-hidden>
              {o.emoji}
            </span>
            <span className="sr-only">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
