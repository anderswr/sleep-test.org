// components/SmileyLikert.tsx
"use client";
import React from "react";
import { LikertValue } from "@/lib/types";
import { t } from "@/lib/i18n";

type Props = {
  name: string;
  value?: LikertValue;
  onChange: (v: LikertValue) => void;
  dict: any;
};

const FACES: Record<LikertValue, { emoji: string; key: keyof typeof LABEL_KEYS; tone: number }> = {
  1: { emoji: "😞", key: "v1", tone: 1 },
  2: { emoji: "🙁", key: "v2", tone: 2 },
  3: { emoji: "😐", key: "v3", tone: 3 },
  4: { emoji: "🙂", key: "v4", tone: 4 },
  5: { emoji: "😃", key: "v5", tone: 5 }
};

const LABEL_KEYS = {
  v1: "likert.1",
  v2: "likert.2",
  v3: "likert.3",
  v4: "likert.4",
  v5: "likert.5"
} as const;

export default function SmileyLikert({ name, value, onChange, dict }: Props) {
  return (
    <div className="likert" role="radiogroup" aria-labelledby={`${name}-legend`}>
      {(Object.keys(FACES) as unknown as LikertValue[]).map((n) => {
        const face = FACES[n];
        const id = `${name}-${n}`;
        return (
          <React.Fragment key={n}>
            <input
              id={id}
              type="radio"
              name={name}
              checked={value === n}
              onChange={() => onChange(n)}
              aria-label={t(dict, LABEL_KEYS[face.key], String(n))}
            />
            <label htmlFor={id} data-tone={face.tone}>
              <div className="face" aria-hidden>{face.emoji}</div>
              <div className="caption">{t(dict, LABEL_KEYS[face.key], String(n))}</div>
            </label>
          </React.Fragment>
        );
      })}
    </div>
  );
}
