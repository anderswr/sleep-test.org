// components/SmileyLikert.tsx
"use client";

import * as React from "react";
import { LikertValue } from "@/lib/types";
import { t } from "@/lib/i18n";

type Props = {
  name: string;
  value?: LikertValue;
  onChange: (v: LikertValue) => void;
  dict: any;
};

type Face = {
  v: LikertValue;
  emoji: string;
  tone: number;   // 1..5 for fargehint i CSS
  labelKey: string;
};

const FACES: Face[] = [
  { v: 1, emoji: "😞", tone: 1, labelKey: "likert.1" },
  { v: 2, emoji: "🙁", tone: 2, labelKey: "likert.2" },
  { v: 3, emoji: "😐", tone: 3, labelKey: "likert.3" },
  { v: 4, emoji: "🙂", tone: 4, labelKey: "likert.4" },
  { v: 5, emoji: "😃", tone: 5, labelKey: "likert.5" },
];

export default function SmileyLikert({ name, value, onChange, dict }: Props) {
  const groupRef = React.useRef<HTMLDivElement>(null);

  // Flytt fokus mellom “radio-knappene” med piltaster
  function onKeyDown(e: React.KeyboardEvent) {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    if (!buttons || buttons.length === 0) return;

    const currentIndex = Array.from(buttons).findIndex((b) => b === document.activeElement);
    let nextIndex = currentIndex;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = Math.min(buttons.length - 1, Math.max(0, currentIndex) + 1);
      buttons[nextIndex].focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = Math.max(0, (currentIndex === -1 ? 0 : currentIndex) - 1);
      buttons[nextIndex].focus();
      e.preventDefault();
    } else if (e.key === "Home") {
      buttons[0].focus();
      e.preventDefault();
    } else if (e.key === "End") {
      buttons[buttons.length - 1].focus();
      e.preventDefault();
    } else if (e.key === " " || e.key === "Enter") {
      // Velg aktiv knapp
      const active = buttons[Math.max(0, currentIndex)];
      const val = Number(active?.dataset?.val) as LikertValue;
      if (val >= 1 && val <= 5) onChange(val);
      e.preventDefault();
    }
  }

  return (
    <div
      ref={groupRef}
      className="smiley-group"
      role="radiogroup"
      aria-labelledby={`${name}-legend`}
      onKeyDown={onKeyDown}
    >
      {FACES.map((f) => {
        const selected = value === f.v;
        const id = `${name}-${f.v}`;
        return (
          <button
            key={id}
            id={id}
            role="radio"
            aria-checked={selected}
            data-tone={f.tone}
            data-val={f.v}
            type="button"
            className={`smiley-btn${selected ? " is-selected" : ""}`}
            onClick={() => onChange(f.v)}
          >
            <span className="smiley-emoji" aria-hidden>
              {f.emoji}
            </span>
            <span className="smiley-caption">
              {t(dict, f.labelKey, String(f.v))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
