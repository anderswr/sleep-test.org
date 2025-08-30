// components/SmileyLikert.tsx
"use client";
import { LikertValue } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  name: string;
  value?: LikertValue;
  onChange: (v: LikertValue) => void;
  dict: any;
}

const FACES: { v: LikertValue; color: string; emoji: string }[] = [
  { v: 1, color: "#ef4444", emoji: "😡" },
  { v: 2, color: "#f97316", emoji: "🙁" },
  { v: 3, color: "#facc15", emoji: "😐" },
  { v: 4, color: "#4ade80", emoji: "🙂" },
  { v: 5, color: "#22c55e", emoji: "😄" },
];

export default function SmileyLikert({ name, value, onChange, dict }: Props) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {FACES.map((f) => (
        <button
          key={f.v}
          type="button"
          onClick={() => onChange(f.v)}
          className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl border text-sm transition 
            ${value === f.v ? "ring-2 ring-black scale-105" : "hover:scale-105"}`}
          style={{ borderColor: f.color }}
        >
          <span style={{ fontSize: "2rem" }}>{f.emoji}</span>
          <span style={{ color: f.color, fontWeight: 500 }}>{t(dict, `likert.${f.v}`, String(f.v))}</span>
        </button>
      ))}
    </div>
  );
}
