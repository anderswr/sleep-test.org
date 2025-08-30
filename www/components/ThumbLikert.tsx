// components/ThumbLikert.tsx
"use client";

import * as React from "react";

type Props = {
  value?: "yes" | "no" | "unknown";
  onChange: (val: "yes" | "no") => void;
};

export default function ThumbLikert({ value, onChange }: Props) {
  return (
    <div className="thumb-group" role="radiogroup" aria-label="Yes/No">
      <button
        type="button"
        role="radio"
        aria-checked={value === "no"}
        className={`thumb ${value === "no" ? "thumb--active" : ""}`}
        onClick={() => onChange("no")}
        title="No"
      >
        👎
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === "yes"}
        className={`thumb ${value === "yes" ? "thumb--active" : ""}`}
        onClick={() => onChange("yes")}
        title="Yes"
      >
        👍
      </button>
    </div>
  );
}
