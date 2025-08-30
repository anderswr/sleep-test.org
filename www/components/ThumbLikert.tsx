// components/ThumbLikert.tsx
"use client";
import * as React from "react";

type Val = "yes" | "no" | "unknown";
export default function ThumbLikert({ value, onChange }: { value: Val; onChange: (v: Val) => void }) {
  return (
    <div className="likert">
      <input id="thumb-no" type="radio" name="bp" checked={value === "no"} onChange={() => onChange("no")} />
      <label htmlFor="thumb-no" data-tone="4">
        <div className="face" style={{ fontSize: 30 }}>👍</div>
        <div className="caption">Nei</div>
      </label>

      <input id="thumb-yes" type="radio" name="bp" checked={value === "yes"} onChange={() => onChange("yes")} />
      <label htmlFor="thumb-yes" data-tone="1">
        <div className="face" style={{ fontSize: 30 }}>👎</div>
        <div className="caption">Ja</div>
      </label>
    </div>
  );
}
