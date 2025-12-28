// lib/scoring.ts
import { AnswerMap, CategoryId, CategoryScores, LikertValue } from "@/lib/types";

// Definisjon av fargegrenser
export const COLOR_THRESHOLDS = {
  green: { max: 39 },
  yellow: { min: 40, max: 59 },
  red: { min: 60 },
} as const;

// Likert-label-nøkler (tekst i språkfilene)
export const LIKERT_LABEL_KEYS = {
  1: "likert.1",
  2: "likert.2",
  3: "likert.3",
  4: "likert.4",
  5: "likert.5",
} as const;

// Konverterer likert 1–5 til en verdi 0–100 (1=0, 5=100)
export const likertTo100 = (v: LikertValue) => ((v - 1) / 4) * 100;

// Snitt av tall (med håndtering av tom array)
export const avg = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

// Plasserer en verdi i grønn/gul/rød kategori
export const bucketColor = (s: number): "green" | "yellow" | "red" =>
  s <= 39 ? "green" : s >= 60 ? "red" : "yellow";

// Regner ut snitt per kategori (0–100; høyere = verre)
export function computeCategoryScores(
  answers: AnswerMap,
  byCatIds: Record<CategoryId, string[]>
) {
  const out = {} as CategoryScores;
  (Object.keys(byCatIds) as CategoryId[]).forEach((cat) => {
    const vals = byCatIds[cat]
      .map((id) => answers[id])
      .filter((v): v is LikertValue => typeof v === "number")
      .map((v) => likertTo100(v));
    out[cat] = Math.round(avg(vals));
  });
  return out;
}

/** Praktisk helper: totalRaw som snitt av kategori-scorer (0–100; høyere = verre) */
export function computeTotalRaw(categoryScores: CategoryScores): number {
  const values = Object.values(categoryScores).filter((v) => typeof v === "number");
  return Math.round(avg(values));
}
