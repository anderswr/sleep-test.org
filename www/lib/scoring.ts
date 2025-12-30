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

export const SEVERITY_THRESHOLDS = {
  red: { max: 30 },
  yellow: { min: 31, max: 70 },
  green: { min: 71 },
} as const;

export type Severity = "green" | "yellow" | "red";

// Konverterer likert 1–5 til en verdi 0–100 (1=0, 5=100)
export const likertTo100 = (v: LikertValue) => ((v - 1) / 4) * 100;

// Snitt av tall (med håndtering av tom array)
export const avg = (ns: number[]) => (ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0);

const weightedAvg = (values: number[], weights: number[]) => {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (!values.length || !sum) return 0;
  const weightedSum = values.reduce((acc, value, idx) => acc + value * (weights[idx] ?? 0), 0);
  return weightedSum / sum;
};

const getLikert = (answers: AnswerMap, id: string): LikertValue | undefined =>
  answers[id] as LikertValue | undefined;

// Plasserer en verdi i grønn/gul/rød kategori
export const bucketColor = (s: number): "green" | "yellow" | "red" =>
  s <= 39 ? "green" : s >= 60 ? "red" : "yellow";

export const severityFromScore = (score: number): Severity => {
  if (score <= SEVERITY_THRESHOLDS.red.max) return "red";
  if (score <= SEVERITY_THRESHOLDS.yellow.max) return "yellow";
  return "green";
};

// Regner ut snitt per kategori (0–100; høyere = verre)
export function computeCategoryScores(
  answers: AnswerMap,
  byCatIds: Record<CategoryId, string[]>
) {
  const out = {} as CategoryScores;
  const irregularTimesId = "q2";
  const shiftWorkId = "q36";
  const shiftWorkHigh = (getLikert(answers, shiftWorkId) ?? 0) >= 4;

  (Object.keys(byCatIds) as CategoryId[]).forEach((cat) => {
    const ids = byCatIds[cat];
    const vals: number[] = [];
    const weights: number[] = [];
    ids.forEach((id) => {
      const v = answers[id];
      if (typeof v !== "number") return;
      vals.push(likertTo100(v as LikertValue));
      weights.push(id === irregularTimesId && shiftWorkHigh ? 0.5 : 1);
    });

    if (cat === CategoryId.Pattern) {
      out[cat] = Math.round(weightedAvg(vals, weights));
      return;
    }

    out[cat] = Math.round(avg(vals));
  });
  return out;
}

/** Praktisk helper: totalRaw som snitt av kategori-scorer (0–100; høyere = verre) */
export function computeTotalRaw(
  categoryScores: CategoryScores,
  options?: { includeMental?: boolean }
): number {
  const baseCategories: CategoryId[] = [
    CategoryId.Pattern,
    CategoryId.Insomnia,
    CategoryId.Quality,
    CategoryId.Daytime,
    CategoryId.Hygiene,
    CategoryId.Environment,
    CategoryId.Breathing,
    CategoryId.BloodPressure,
  ];
  const baseScores = baseCategories
    .map((cat) => categoryScores[cat])
    .filter((v) => typeof v === "number");
  const baseAvg = avg(baseScores);
  const mentalWeight = options?.includeMental ? 0.07 : 0;
  const mentalScore = categoryScores[CategoryId.Mental] ?? 0;
  const total = baseAvg * (1 - mentalWeight) + mentalScore * mentalWeight;
  return Math.round(total);
}
